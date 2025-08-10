'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  HomeIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import CreateOfferModal from '@/components/common/CreateOfferModal';
import DropitiPassport2 from '@/components/common/DropitiPassport2';

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  location: string;
  joinDate: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  about: string;
  languages: string[];
  responseTime: string;
  stats: {
    responseRate: number;
    avgResponseTime: string;
    totalProperties: number;
    totalGuests: number;
  };
  properties: Array<{
    id: string;
    title: string;
    image: string;
    rating: number;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
  }>;
  reviews: Array<{
    id: string;
    reviewerName: string;
    reviewerAvatar: string;
    rating: number;
    date: string;
    propertyTitle: string;
    comment: string;
  }>;
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // Mock user data
  const user: User = {
    id: params.id,
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    email: 'sarah.johnson@email.com',
    location: 'Central, Hong Kong',
    joinDate: '2020-03-15',
    verified: true,
    rating: 4.8,
    reviewCount: 127,
    about: 'Hi! I\'m Sarah, a passionate property manager with over 5 years of experience in the Hong Kong real estate market. I love creating comfortable, welcoming spaces for tenants and ensuring they have the best possible living experience.',
    languages: ['English', 'Cantonese', 'Mandarin'],
    responseTime: '1 hour',
    stats: {
      responseRate: 98,
      avgResponseTime: '1h',
      totalProperties: 5,
      totalGuests: 47
    },
    properties: [
      {
        id: '1',
        title: 'Modern Studio in Central',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        rating: 4.9,
        price: 2800,
        location: 'Central, Hong Kong',
        bedrooms: 1,
        bathrooms: 1
      },
      {
        id: '2',
        title: 'Luxury 2BR Apartment',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        rating: 4.7,
        price: 4500,
        location: 'Wan Chai, Hong Kong',
        bedrooms: 2,
        bathrooms: 2
      },
      {
        id: '3',
        title: 'Cozy 1BR with Harbor View',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        rating: 4.8,
        price: 3200,
        location: 'North Point, Hong Kong',
        bedrooms: 1,
        bathrooms: 1
      }
    ],
    reviews: [
      {
        id: '1',
        reviewerName: 'Michael Chen',
        reviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        rating: 5,
        date: '2024-01-15',
        propertyTitle: 'Modern Studio in Central',
        comment: 'Sarah was incredibly responsive and helpful throughout the entire process. The apartment was exactly as described and the move-in was seamless. Highly recommend!'
      },
      {
        id: '2',
        reviewerName: 'Emma Wilson',
        reviewerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
        rating: 5,
        date: '2024-01-10',
        propertyTitle: 'Luxury 2BR Apartment',
        comment: 'Excellent experience working with Sarah. She was professional, attentive to detail, and made sure everything was perfect. The apartment is beautiful!'
      },
      {
        id: '3',
        reviewerName: 'David Kim',
        reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
        rating: 4,
        date: '2024-01-05',
        propertyTitle: 'Cozy 1BR with Harbor View',
        comment: 'Great location and Sarah was very helpful with the application process. The only minor issue was a small delay in getting the keys, but everything else was perfect.'
      }
    ]
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreateOffer = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setIsOfferModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header - Using DropitiPassport2 Component */}
      <DropitiPassport2 user={user} />

      {/* Current Listings Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <HomeIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Current Listings</h2>
        </div>
        
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
                    onClick={() => handleCreateOffer(property.id)}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Offer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <StarIcon className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
        </div>
        
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
      </div>

      {/* Create Offer Modal */}
      <CreateOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        propertyId={Array.isArray(params.id) ? params.id[0] : params.id}
      />
    </div>
  );
}
