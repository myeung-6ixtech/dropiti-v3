'use client';

import { useAuth } from '@/context/AuthContext';
import DropitiPassport from '@/components/common/DropitiPassport';
import { 
  StarIcon, 
  UserIcon,
  BuildingOfficeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getSafeProfileImage } from '@/lib/utils';
import ReviewItem from '@/components/reviews/ReviewItem';
import { reviewsAPI } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { Review } from '@/types/review';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import ReviewOpportunities from '@/components/dashboard/ReviewOpportunities';

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
            avatar: getSafeProfileImage(authUser.photoUrl || authUser.avatar, '/images/Portrait_Placeholder.png'),
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
      <div className="dashboard-welcome-header">
        <div className="dashboard-welcome-container">
          <div className="dashboard-welcome-content">
            <div className="dashboard-welcome-icon">
              <UserIcon className="h-8 w-8" />
            </div>
            <div className="dashboard-welcome-text">
              <h1 className="dashboard-welcome-title">Welcome back, {authUser.displayName || authUser.name || 'User'}! 👋</h1>
              <p className="dashboard-welcome-subtitle">Here's what's happening with your properties today</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="dashboard-welcome-stats">
            <div className="dashboard-stat-item">
              <div className="dashboard-stat-value">{userData.stats.totalProperties}</div>
              <div className="dashboard-stat-label">Properties</div>
            </div>
            <div className="dashboard-stat-item">
              <div className="dashboard-stat-value">{userData.stats.totalGuests}</div>
              <div className="dashboard-stat-label">Tenants</div>
            </div>
            <div className="dashboard-stat-item">
              <div className="dashboard-stat-value">{userData.stats.responseRate}%</div>
              <div className="dashboard-stat-label">Response Rate</div>
            </div>
            <div className="dashboard-stat-item">
              <div className="dashboard-stat-value">{userData.rating}</div>
              <div className="dashboard-stat-label">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Left Column - DropitiPassport */}
        <div className="dashboard-left-column">
          <DropitiPassport user={userData} />
        </div>

        {/* Right Column - Content */}
        <div className="dashboard-right-column">
          {/* Quick Actions */}
          <div className="quick-actions-container">
            <h2 className="quick-actions-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              <Link
                href="/dashboard/add-property"
                className="quick-action-item quick-action-primary quick-action-hover group"
              >
                <div className="quick-action-icon-container quick-action-icon-container-primary">
                  <PlusIcon className="quick-action-icon" />
                </div>
                <div className="quick-action-content">
                  <p className="quick-action-title">Add New Property</p>
                  <p className="quick-action-description">List a new rental property</p>
                </div>
              </Link>

              <Link
                href="/dashboard/properties"
                className="quick-action-item quick-action-secondary quick-action-hover group"
              >
                <div className="quick-action-icon-container quick-action-icon-container-secondary">
                  <BuildingOfficeIcon className="quick-action-icon" />
                </div>
                <div className="quick-action-content">
                  <p className="quick-action-title">Manage Properties</p>
                  <p className="quick-action-description">View and edit your listings</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Your Reviews</h2>
              <Link
                href="/dashboard/reviews"
                className="dashboard-card-link"
              >
                View All →
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
                    <p className="dashboard-review-empty-text">No reviews yet</p>
                    <p className="dashboard-review-empty-subtext">Reviews will appear here once you receive them</p>
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
