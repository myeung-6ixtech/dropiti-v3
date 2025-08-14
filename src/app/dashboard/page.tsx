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
import { reviewsAPI } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { Review } from '@/types/review';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';

export default function DashboardPage() {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      // Use id from the user object, which contains the Firebase UID
      const firebaseUid = authUser?.id;
      
      if (!firebaseUid) {
        console.warn('Dashboard: No Firebase UID available for fetching reviews');
        setReviews([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Dashboard: Fetching reviews for Firebase UID:', firebaseUid);
        
        const response = await reviewsAPI.getReviewsByUser({
          userFirebaseUid: firebaseUid,
          limit: 5 // Show only 5 recent reviews on dashboard
        });
        
        if (response.success && response.data) {
          setReviews(Array.isArray(response.data) ? response.data : [response.data]);
        } else {
          setReviews([]);
        }
      } catch (err) {
        setError('Failed to fetch reviews.');
        console.error('Dashboard: Error fetching reviews:', err);
        setReviews([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [authUser?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated || !authUser) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  // Helper function to safely parse languages
  const parseLanguages = (languages: unknown): string[] => {
    if (Array.isArray(languages)) {
      return languages;
    }
    
    if (typeof languages === 'string') {
      try {
        const parsed = JSON.parse(languages);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn('Failed to parse languages JSON:', error);
        return [];
      }
    }
    
    return [];
  };

  // Use real user data from auth context for DropitiPassport
  const userData = {
    name: authUser.displayName || authUser.name || 'User',
    avatar: getSafeProfileImage(authUser.photoUrl || authUser.avatar, '/src/assets/img/Portrait_Placeholder.png'),
    email: authUser.email || 'user@example.com',
    location: authUser.location || 'Hong Kong',
    joinDate: authUser.userSince || authUser.createdAt || '2024-01-01',
    verified: authUser.verified || false,
    rating: authUser.rating || 0,
    reviewCount: authUser.reviewCount || 0,
    about: authUser.about || 'Professional landlord with over 5 years of experience in property management.',
    languages: parseLanguages(authUser.languages),
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

  if (loading && reviews.length === 0) {
    return <CenteredLoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

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
              <p className="text-gray-100 text-lg">Here's what's happening with your properties today</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{userData.stats.totalProperties}</div>
              <div className="text-gray-100 text-sm">Properties</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{userData.stats.totalGuests}</div>
              <div className="text-gray-100 text-sm">Tenants</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{userData.stats.responseRate}%</div>
              <div className="text-gray-100 text-sm">Response Rate</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{userData.rating}</div>
              <div className="text-gray-100 text-sm">Rating</div>
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
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
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
                className="text-black hover:text-gray-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={getSafeProfileImage(review.reviewer?.photoUrl, '/src/assets/img/Portrait_Placeholder.png')}
                          alt={review.reviewer?.displayName || 'Reviewer'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{review.reviewer?.displayName || 'Unknown Reviewer'}</h4>
                            <p className="text-sm text-gray-500">{review.property?.title || 'Property not specified'}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{review.comment || 'No comment provided'}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    <StarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No reviews yet</p>
                    <p className="text-xs text-gray-400">Reviews will appear here once you receive them</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
