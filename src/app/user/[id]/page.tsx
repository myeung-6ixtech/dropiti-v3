'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  HomeIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { usersAPI } from '@/lib/api-client';
import CreateOfferModal from '@/components/common/CreateOfferModal';
import DropitiPassport2 from '@/components/common/DropitiPassport2';

interface User {
  uuid: string;
  firebase_uid: string;
  display_name: string;
  photo_url?: string;
  email: string;
  location?: string;
  user_since: string;
  verified: boolean;
  rating: number;
  review_count: number;
  about?: string;
  languages?: string[];
  response_time?: string;
  response_rate: number;
  total_properties: number;
  total_guests: number;
  avg_response_time?: string;
  // Properties and reviews will be fetched separately or added later
  properties?: Array<{
    id: string;
    title: string;
    image: string;
    rating: number;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
  }>;
  reviews?: Array<{
    id: string;
    reviewerName: string;
    reviewerAvatar: string;
    rating: number;
    date: string;
    propertyTitle: string;
    comment: string;
  }>;
}

export default function UserProfilePage() {
  const params = useParams();
  const uuid = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (uuid) {
        try {
          setIsLoading(true);
          setError(null);
          
          console.log('Fetching user data for UUID:', uuid);
          const response = await usersAPI.getUserByUuid(uuid);
          
          if (response.success && response.data) {
            console.log('User data received:', response.data);
            
            // Transform API data to match our User interface
            const transformedUser: User = {
              uuid: response.data.uuid,
              firebase_uid: response.data.firebase_uid,
              display_name: response.data.display_name || 'Unknown User',
              photo_url: response.data.photo_url,
              email: response.data.email || '',
              location: response.data.location || 'Location not specified',
              user_since: response.data.user_since || new Date().toISOString(),
              verified: response.data.verified || false,
              rating: response.data.rating || 0,
              review_count: response.data.review_count || 0,
              about: response.data.about || 'No description available',
              languages: response.data.languages || [],
              response_time: response.data.response_time || 'Unknown',
              response_rate: response.data.response_rate || 0,
              total_properties: response.data.total_properties || 0,
              total_guests: response.data.total_guests || 0,
              avg_response_time: response.data.avg_response_time || 'Unknown',
              // For now, we'll use empty arrays for properties and reviews
              // These can be fetched separately in the future
              properties: [],
              reviews: []
            };
            
            setUser(transformedUser);
          } else {
            setError(response.error || 'Failed to load user data');
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setError('Failed to load user data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [uuid]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreateOffer = () => {
    setIsOfferModalOpen(true);
  };

  // Map User to DropitiPassport2 format
  const mapToPassportFormat = (user: User) => ({
    displayName: user.display_name,
    avatar: user.photo_url || 'https://via.placeholder.com/50', // Fallback avatar
    email: user.email,
    location: user.location,
    joinDate: user.user_since,
    verified: user.verified,
    rating: user.rating,
    reviewCount: user.review_count,
    about: user.about,
    languages: user.languages,
    stats: {
      responseRate: user.response_rate,
      avgResponseTime: user.avg_response_time || 'Unknown',
      totalProperties: user.total_properties,
      totalGuests: user.total_guests
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center py-8">User not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header - Using DropitiPassport2 Component */}
      <DropitiPassport2 user={mapToPassportFormat(user)} />

      {/* Current Listings Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <HomeIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Current Listings</h2>
        </div>
        
        {user.properties && user.properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.properties.map((property) => (
              <div key={property.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 group">
                <div className="relative">
                  <Image
                    src={property.image}
                    alt={property.title}
                    width={400}
                    height={400}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                    <StarIcon className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs font-medium">{property.rating}</span>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">
                    {property.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{property.location}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{property.bedrooms} bed • {property.bathrooms} bath</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      ${property.price.toLocaleString()}/month
                    </span>
                    <button
                      onClick={() => handleCreateOffer()}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Offer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HomeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No properties listed yet</p>
            <p className="text-sm">This user hasn't listed any properties for rent.</p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <StarIcon className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
        </div>
        
        {user.reviews && user.reviews.length > 0 ? (
          <div className="space-y-6">
            {user.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={review.reviewerAvatar}
                      alt={review.reviewerName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{review.reviewerName}</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(review.date)} • {review.propertyTitle}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <StarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No reviews yet</p>
            <p className="text-sm">This user hasn't received any reviews yet.</p>
          </div>
        )}
      </div>

      {/* Create Offer Modal */}
      <CreateOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        propertyId={uuid} // Use uuid for propertyId
      />
    </div>
  );
}
