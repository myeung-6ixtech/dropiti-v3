'use client';

import { useAuth } from '@/context/AuthContext';
import DropitiPassport from '@/components/common/DropitiPassport';
import { 
  StarIcon, 
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { getSafeProfileImage } from '@/lib/utils';

// Mock review data
const mockReviews = [
  {
    id: 1,
    reviewerName: 'Sarah Chen',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
    rating: 5,
    comment: 'Excellent landlord! Very responsive and the property was exactly as described. Highly recommend!',
    date: '2024-02-15',
    propertyName: 'Modern 2BR in Central'
  },
  {
    id: 2,
    reviewerName: 'Michael Wong',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
    rating: 5,
    comment: 'Great experience renting from this landlord. Quick responses and fair pricing. Will definitely rent again!',
    date: '2024-02-10',
    propertyName: 'Luxury Condo in Causeway Bay'
  }
];

export default function DashboardPage() {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !authUser) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-600 mb-4">Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Use real user data from auth context for DropitiPassport
  const userData = {
    name: authUser.displayName || authUser.name || 'User',
    avatar: getSafeProfileImage(authUser.photoUrl || authUser.avatar, '/images/default-avatar.png'),
    email: authUser.email || 'user@example.com',
    location: authUser.location || 'Hong Kong',
    joinDate: authUser.userSince || authUser.createdAt || '2024-01-01',
    verified: authUser.verified || false,
    rating: authUser.rating || 0,
    reviewCount: authUser.reviewCount || 0,
    about: authUser.about || 'Professional landlord with over 5 years of experience in property management.',
    languages: authUser.languages || ['English'],
    education: authUser.education || 'Not specified',
    occupation: authUser.occupation || 'Not specified',
    maritalStatus: authUser.maritalStatus || 'Not specified',
    stats: {
      responseRate: authUser.responseRate || 0,
      avgResponseTime: authUser.avgResponseTime || 'Not specified',
      totalProperties: authUser.totalProperties || 0,
      totalGuests: authUser.totalGuests || 0
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {authUser.displayName || authUser.name || 'User'}! 👋</h1>
              <p className="text-blue-100 text-lg">Here's what's happening with your properties today</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{userData.stats.totalProperties}</div>
              <div className="text-blue-100 text-sm">Properties</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{userData.stats.totalGuests}</div>
              <div className="text-blue-100 text-sm">Tenants</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{userData.stats.responseRate}%</div>
              <div className="text-blue-100 text-sm">Response Rate</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{userData.rating}</div>
              <div className="text-blue-100 text-sm">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - DropitiPassport */}
        <div className="lg:col-span-1">
          <DropitiPassport user={userData} />
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/add-property"
                className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add New Property</h3>
                  <p className="text-sm text-gray-600">List a new rental property</p>
                </div>
              </Link>

              <Link
                href="/dashboard/properties"
                className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
              >
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <BuildingOfficeIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Properties</h3>
                  <p className="text-sm text-gray-600">View and edit your listings</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Reviews</h2>
              <Link
                href="/dashboard/reviews"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {mockReviews.map((review) => (
                <div key={review.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={review.reviewerAvatar}
                        alt={review.reviewerName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.reviewerName}</h4>
                          <p className="text-sm text-gray-500">{review.propertyName}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {formatDate(review.date)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
