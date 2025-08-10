'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  StarIcon, 
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon,
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  verified: boolean;
  joinDate: string;
  about: string;
  location: string;
  languages: string[];
  contactInfo: {
    phone?: string;
    email?: string;
  };
  stats: {
    responseRate: number;
    avgResponseTime: string;
    totalProperties: number;
    totalGuests: number;
  };
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rating: number;
  reviewCount: number;
}

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  propertyTitle: string;
  propertyId: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  // Mock data - replace with API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser({
        id: userId || 'landlord1',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
        rating: 4.8,
        reviewCount: 127,
        responseTime: '1 hour',
        verified: true,
        joinDate: '2020-03-15',
        about: 'Hi! I\'m Sarah, a passionate property manager with over 5 years of experience in the Hong Kong real estate market. I love creating comfortable, welcoming spaces for tenants and ensuring they have the best possible living experience. When I\'m not managing properties, you can find me exploring the city\'s hidden gems or enjoying a good book with a cup of coffee.',
        location: 'Central, Hong Kong',
        languages: ['English', 'Cantonese', 'Mandarin'],
        contactInfo: {
          phone: '+852 1234 5678',
          email: 'sarah.j@email.com'
        },
        stats: {
          responseRate: 98,
          avgResponseTime: '1h',
          totalProperties: 5,
          totalGuests: 47
        }
      });

      setProperties([
        {
          id: '1',
          title: 'Modern 2BR Apartment in Central',
          location: 'Central, Hong Kong',
          price: 25000,
          image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          type: 'Apartment',
          bedrooms: 2,
          bathrooms: 2,
          rating: 4.9,
          reviewCount: 23
        },
        {
          id: '2',
          title: 'Luxury Condo in Causeway Bay',
          location: 'Causeway Bay, Hong Kong',
          price: 35000,
          image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          type: 'Condo',
          bedrooms: 3,
          bathrooms: 2,
          rating: 4.7,
          reviewCount: 18
        },
        {
          id: '3',
          title: 'Cozy Studio in Sheung Wan',
          location: 'Sheung Wan, Hong Kong',
          price: 18000,
          image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
          type: 'Studio',
          bedrooms: 1,
          bathrooms: 1,
          rating: 4.6,
          reviewCount: 15
        }
      ]);

      setReviews([
        {
          id: '1',
          reviewerName: 'Michael Chen',
          reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
          rating: 5,
          comment: 'Sarah was an excellent landlord! She was very responsive to any issues and the apartment was exactly as described. The location is perfect and the building is well-maintained. Highly recommend!',
          date: '2024-01-15',
          propertyTitle: 'Modern 2BR Apartment in Central',
          propertyId: '1'
        },
        {
          id: '2',
          reviewerName: 'Emma Wilson',
          reviewerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
          rating: 5,
          comment: 'Great experience renting from Sarah. She\'s professional, friendly, and always available when needed. The apartment is beautiful and the neighborhood is fantastic.',
          date: '2024-01-10',
          propertyTitle: 'Luxury Condo in Causeway Bay',
          propertyId: '2'
        },
        {
          id: '3',
          reviewerName: 'David Kim',
          rating: 4,
          comment: 'Good landlord, responsive to maintenance requests. The apartment is clean and well-maintained. Would rent again.',
          date: '2024-01-05',
          propertyTitle: 'Cozy Studio in Sheung Wan',
          propertyId: '3'
        },
        {
          id: '4',
          reviewerName: 'Lisa Wong',
          reviewerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
          rating: 5,
          comment: 'Sarah is the best landlord I\'ve ever had. She goes above and beyond to ensure her tenants are happy. The apartment exceeded my expectations.',
          date: '2023-12-20',
          propertyTitle: 'Modern 2BR Apartment in Central',
          propertyId: '1'
        },
        {
          id: '5',
          reviewerName: 'James Thompson',
          rating: 4,
          comment: 'Professional and reliable landlord. The property was well-maintained and Sarah was always helpful with any questions.',
          date: '2023-12-15',
          propertyTitle: 'Luxury Condo in Causeway Bay',
          propertyId: '2'
        }
      ]);

      setLoading(false);
    }, 500);
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Profile Picture */}
          <div className="relative">
            <Image
              src={user.avatar}
              alt={user.name}
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            {user.verified && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                <CheckCircleIcon className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              {user.verified && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Verified
                </span>
              )}
            </div>

            {/* Rating and Stats */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-gray-900">{user.rating}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{user.reviewCount} reviews</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <ClockIcon className="h-4 w-4" />
                <span>Responds in {user.responseTime}</span>
              </div>
            </div>

            {/* Location and Join Date */}
            <div className="flex items-center space-x-6 text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>Member since {formatJoinDate(user.joinDate)}</span>
              </div>
            </div>

            {/* Languages */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-600">Languages:</span>
              {user.languages.map((language, index) => (
                <span key={language} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                  {language}
                </span>
              ))}
            </div>

            {/* About */}
            <p className="text-gray-700 leading-relaxed">{user.about}</p>
          </div>

          {/* Contact Actions */}
          <div className="flex flex-col space-y-3 min-w-0">
            <button className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              Contact
            </button>
            <button className="flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors">
              <HeartIcon className="h-4 w-4 mr-2" />
              Follow
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{user.stats.responseRate}%</div>
          <div className="text-sm text-gray-500">Response rate</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{user.stats.avgResponseTime}</div>
          <div className="text-sm text-gray-500">Avg. response</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{user.stats.totalProperties}</div>
          <div className="text-sm text-gray-500">Properties</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{user.stats.totalGuests}</div>
          <div className="text-sm text-gray-500">Happy tenants</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('listings')}
              className={`${
                activeTab === 'listings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Current Listings ({properties.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <StarIcon className="h-5 w-5" />
              <span>Reviews ({reviews.length})</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'listings' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100">
                    <Image
                      src={property.image}
                      alt={property.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">{property.type}</span>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium">{property.rating}</span>
                        <span className="text-xs text-gray-500">({property.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                      <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{formatCurrency(property.price)}/month</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {review.reviewerAvatar ? (
                        <Image
                          src={review.reviewerAvatar}
                          alt={review.reviewerName}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 font-medium text-sm">
                          {review.reviewerName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{review.reviewerName}</h4>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(review.date)} • {review.propertyTitle}
                      </p>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
