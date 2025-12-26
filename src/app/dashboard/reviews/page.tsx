'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { offersAPI } from '@/lib/api-client';
import CreateReviewModal from '@/components/common/CreateReviewModal';
import { FullScreenLoadingSpinner } from '@/components/common/LoadingSpinner';
import { Review, ReviewOpportunity, ReviewTabType, ReviewTab } from '@/types/review';
import { ReviewsHeader } from './_components/reviews-header';
import { ReviewsTabs } from './_components/reviews-tabs';
import { UpcomingReviewsSection } from './_components/upcoming-reviews-section';
import { ReviewsGivenSection } from './_components/reviews-given-section';
import { ReviewsReceivedSection } from './_components/reviews-received-section';

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
        <ReviewsHeader />

        <ReviewsTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'upcoming' && (
            <UpcomingReviewsSection
              opportunities={reviewOpportunities}
              onCreateReview={handleCreateReview}
            />
          )}

          {activeTab === 'given' && (
            <ReviewsGivenSection reviews={reviewsGiven} />
          )}

          {activeTab === 'received' && (
            <ReviewsReceivedSection reviews={reviewsReceived} />
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
