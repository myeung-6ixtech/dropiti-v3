'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import DropitiPassport from '@/components/common/DropitiPassport';
import { 
  StarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getSafeProfileImage } from '@/lib/utils';
import ReviewItem from '@/components/reviews/ReviewItem';
import { reviewsAPI } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { Review } from '@/types/review';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import ReviewOpportunities from '@/components/dashboard/ReviewOpportunities';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader';
import { getTotalPropertyCount, getPublishedPropertyCountByStatus, getAverageUserRating } from '@/lib/utils';

export default function DashboardPage() {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyCounts, setPropertyCounts] = useState({
    totalProperties: 0,
    publishedProperties: 0
  });
  const [userRating, setUserRating] = useState({
    averageRating: 0,
    reviewCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      // Use id from the user object, which contains the Firebase UID
      const firebaseUid = authUser?.id;
      
      if (!firebaseUid) {
        console.warn('Dashboard: No Firebase UID available for fetching data');
        setReviews([]);
        setPropertyCounts({ totalProperties: 0, publishedProperties: 0 });
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Dashboard: Fetching data for Firebase UID:', firebaseUid);
        
        // Fetch reviews, property counts, and average rating in parallel with individual error handling
        const [reviewsResponse, totalCount, publishedCount, ratingData] = await Promise.allSettled([
          reviewsAPI.getReviewsByUser({
            userFirebaseUid: firebaseUid,
            limit: 5 // Show only 5 recent reviews on dashboard
          }),
          getTotalPropertyCount(firebaseUid),
          getPublishedPropertyCountByStatus(firebaseUid),
          getAverageUserRating(firebaseUid)
        ]);
        
        // Handle reviews response
        if (reviewsResponse.status === 'fulfilled' && reviewsResponse.value.success && reviewsResponse.value.data) {
          setReviews(Array.isArray(reviewsResponse.value.data) ? reviewsResponse.value.data : [reviewsResponse.value.data]);
        } else {
          console.warn('Dashboard: Failed to fetch reviews, setting empty array');
          setReviews([]);
        }
        
        // Handle property counts
        if (totalCount.status === 'fulfilled') {
          setPropertyCounts(prev => ({ ...prev, totalProperties: totalCount.value }));
        } else {
          console.warn('Dashboard: Failed to fetch total property count');
          setPropertyCounts(prev => ({ ...prev, totalProperties: 0 }));
        }
        
        if (publishedCount.status === 'fulfilled') {
          setPropertyCounts(prev => ({ ...prev, publishedProperties: publishedCount.value }));
        } else {
          console.warn('Dashboard: Failed to fetch published property count');
          setPropertyCounts(prev => ({ ...prev, publishedProperties: 0 }));
        }
        
        // Handle user rating data
        if (ratingData.status === 'fulfilled') {
          setUserRating({
            averageRating: ratingData.value.averageRating,
            reviewCount: ratingData.value.reviewCount
          });
        } else {
          console.warn('Dashboard: Failed to fetch user rating data');
          setUserRating({ averageRating: 0, reviewCount: 0 });
        }
        
      } catch (err) {
        console.error('Dashboard: Unexpected error fetching data:', err);
        // Set fallback values for all data
        setReviews([]);
        setPropertyCounts({ totalProperties: 0, publishedProperties: 0 });
        setUserRating({ averageRating: 0, reviewCount: 0 });
        // Only show error if it's not related to empty database
        if (err && typeof err === 'object' && 'message' in err) {
          const errorMessage = (err as Error).message;
          if (!errorMessage.includes('relation') && !errorMessage.includes('does not exist')) {
            setError(t('dashboardPage.failedToFetchData'));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
            avatar: getSafeProfileImage(authUser.photoUrl || authUser.avatar, '/images/Portrait_Placeholder.png'),
    email: authUser.email || 'user@example.com',
    location: authUser.location || 'Hong Kong',
    created_at: authUser.userSince || authUser.createdAt || '2024-01-01',
    verified: authUser.verified || false,
    rating: userRating.averageRating || 0,
    reviewCount: userRating.reviewCount || 0,
    about: authUser.about || 'Professional landlord with over 5 years of experience in property management.',
    languages: parseLanguages(authUser.languages),
    education: authUser.education || 'Not specified',
    occupation: authUser.occupation || 'Not specified',
    maritalStatus: authUser.maritalStatus || 'Not specified',
    stats: {
      responseRate: authUser.responseRate || 0,
      avgResponseTime: authUser.avgResponseTime || 'Not specified',
      totalProperties: propertyCounts.totalProperties,
      publishedProperties: propertyCounts.publishedProperties
    }
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
          <h3 className="text-lg font-medium text-red-800 mb-2">{t('dashboardPage.error')}</h3>
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <DashboardWelcomeHeader 
        userName={authUser.displayName || authUser.name || 'User'}
        stats={{
          totalProperties: userData.stats.totalProperties,
          totalReviews: userData.reviewCount
        }}
      />

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Left Column - DropitiPassport */}
        <div className="dashboard-left-column">
          <DropitiPassport user={userData} firebaseUid={authUser?.id || ""} />
        </div>

        {/* Right Column - Content */}
        <div className="dashboard-right-column">
          {/* Recent Reviews */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">{t('dashboardPage.yourReviews')}</h2>
              <Link
                href="/dashboard/reviews"
                className="dashboard-card-link"
              >
                {t('dashboardPage.viewAll')}
              </Link>
            </div>
            
            <div className="dashboard-card-content">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} renderStars={renderStars} />
                ))
              ) : (
                <div className="dashboard-review-empty">
                  <div className="text-gray-500">
                    <StarIcon className="dashboard-review-empty-icon" />
                    <p className="dashboard-review-empty-text">{t('dashboardPage.noReviewsYet')}</p>
                    <p className="dashboard-review-empty-subtext">{t('dashboardPage.reviewsWillAppear')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review Opportunities */}
          <ReviewOpportunities />
        </div>
      </div>
    </div>
  );
}
