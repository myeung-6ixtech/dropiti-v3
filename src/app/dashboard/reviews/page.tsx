'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { offersAPI } from '@/lib/api-client';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewOpportunityCard from '@/components/reviews/ReviewOpportunityCard';
import CreateReviewModal from '@/components/common/CreateReviewModal';
import { FullScreenLoadingSpinner } from '@/components/common/LoadingSpinner';
import { Review, ReviewOpportunity, ReviewTabType, ReviewTab } from '@/types/review';

export default function ReviewsPage() {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ReviewTabType>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [reviewOpportunities, setReviewOpportunities] = useState<ReviewOpportunity[]>([]);
  const [reviewsGiven, setReviewsGiven] = useState<Review[]>([]);
  const [reviewsReceived, setReviewsReceived] = useState<Review[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ReviewOpportunity | null>(null);

  const fetchReviewData = useCallback(async () => {
    if (!authUser?.id) return;
    
    setIsLoading(true);
    try {
      // Fetch review opportunities
      const opportunitiesResponse = await offersAPI.getReviewOpportunities(authUser.id);
      if (opportunitiesResponse.success) {
        setReviewOpportunities(opportunitiesResponse.data.opportunities || []);
      } else {
        console.warn('Failed to fetch review opportunities:', opportunitiesResponse.error);
      }

      // Fetch all reviews for the user
      const reviewsResponse = await fetch(`/api/v1/reviews/get-reviews-by-user?userFirebaseUid=${authUser.id}`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        const allReviews = reviewsData.data || [];
        
        // Separate reviews given vs received
        const given = allReviews.filter((review: Review) => review.reviewerFirebaseUid === authUser.id);
        const received = allReviews.filter((review: Review) => review.revieweeFirebaseUid === authUser.id);
        
        setReviewsGiven(given);
        setReviewsReceived(received);
      } else if (reviewsResponse.status === 500) {
        // Handle 500 errors gracefully (likely empty database)
        console.warn('Reviews API returned 500, likely empty database. Setting empty reviews.');
        setReviewsGiven([]);
        setReviewsReceived([]);
      } else {
        console.warn('Failed to fetch reviews:', reviewsResponse.status, reviewsResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching review data:', error);
      showToast('error', 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id, showToast]);

  useEffect(() => {
    if (authUser?.id) {
      fetchReviewData();
    }
  }, [authUser?.id, fetchReviewData]);

  const handleCreateReview = (opportunity: ReviewOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsCreateModalOpen(true);
  };

    const handleReviewSubmitted = async (reviewData: { rating: number; comment: string }) => {
    if (!selectedOpportunity || !authUser?.id) {
      showToast('error', 'Missing required information to submit review');
      return;
    }

    try {
      // Submit the review
      const response = await fetch('/api/v1/reviews/create-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewData.rating,
          comment: reviewData.comment,
          offerId: selectedOpportunity.offerId,
          offerUuid: selectedOpportunity.offerUuid,
          reviewType: selectedOpportunity.reviewType,
          reviewerId: authUser.id,
          revieweeUserId: selectedOpportunity.otherPartyId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast('success', 'Review submitted successfully!');
          setIsCreateModalOpen(false);
          setSelectedOpportunity(null);
          // Refresh the data
          fetchReviewData();
        } else {
          throw new Error(result.error || 'Failed to submit review');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
      showToast('error', errorMessage);
    }
  };

  const tabs: ReviewTab[] = [
    {
      id: 'upcoming',
      name: 'Upcoming Reviews',
      count: reviewOpportunities.length,
      description: 'Reviews you can submit after completing offers'
    },
    {
      id: 'given',
      name: 'Reviews Given',
      count: reviewsGiven.length,
      description: 'Reviews you have written for others'
    },
    {
      id: 'received',
      name: 'Reviews Received',
      count: reviewsReceived.length,
      description: 'Reviews others have written about you'
    }
  ];

  if (isLoading) {
    return <FullScreenLoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="mt-2 text-gray-600">
            Manage your reviews and see what others are saying about you
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'upcoming' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Upcoming Reviews
                </h2>
                <p className="text-gray-600">
                  You can submit reviews for these completed offers. Reviews help the community make better decisions.
                </p>
              </div>

              {reviewOpportunities.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming reviews</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any offers that are ready for review yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewOpportunities.map((opportunity) => (
                    <ReviewOpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onCreateReview={() => handleCreateReview(opportunity)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'given' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Reviews You've Given
                </h2>
                <p className="text-gray-600">
                  Reviews you have written for other users and properties.
                </p>
              </div>

              {reviewsGiven.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews given</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't written any reviews yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewsGiven.map((review) => (
                    <ReviewCard
                      key={review.reviewUuid}
                      review={review}
                      showPropertyInfo={true}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'received' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Reviews You've Received
                </h2>
                <p className="text-gray-600">
                  What others are saying about you and your properties.
                </p>
              </div>

              {reviewsReceived.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews received</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't received any reviews yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewsReceived.map((review) => (
                    <ReviewCard
                      key={review.reviewUuid}
                      review={review}
                      showPropertyInfo={true}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Review Modal */}
      {isCreateModalOpen && selectedOpportunity && (
        <CreateReviewModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedOpportunity(null);
          }}
          onSubmit={handleReviewSubmitted}
          reviewType={selectedOpportunity.reviewType}
          otherPartyName={selectedOpportunity.otherPartyName}
          propertyTitle={selectedOpportunity.propertyTitle}
        />
      )}
    </div>
  );
}
