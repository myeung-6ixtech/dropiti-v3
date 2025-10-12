'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { REVIEW_CONSTANTS } from '@/constants/review';
import { offersAPI } from '@/lib/api-client';
import CreateReviewModal from '@/components/common/CreateReviewModal';
import ReviewOpportunityItem from '@/components/reviews/ReviewOpportunityItem';
import { ReviewOpportunity } from '@/types/review';

export default function ReviewOpportunities() {
  const [opportunities, setOpportunities] = useState<ReviewOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ReviewOpportunity | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { user: authUser } = useAuth();
  const { showToast } = useToast();

  const loadReviewOpportunities = useCallback(async () => {
    if (!authUser?.id) return;
    
    try {
      const response = await offersAPI.getReviewOpportunities(authUser.id);
      if (response.success) {
        setOpportunities(response.data.opportunities);
      }
    } catch (error) {
      console.error('Error loading review opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (authUser?.id) {
      loadReviewOpportunities();
    }
  }, [authUser?.id, loadReviewOpportunities]);

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleLeaveReview = (opportunity: ReviewOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData: { rating: number; comment: string }) => {
    if (!selectedOpportunity || !authUser?.id) return;

    try {
      const response = await offersAPI.createReview({
        offerId: selectedOpportunity.offerId,
        offerUuid: selectedOpportunity.offerUuid, // now the real DB offer_uuid from API
        reviewType: selectedOpportunity.reviewType,
        rating: reviewData.rating,
        comment: reviewData.comment,
        reviewerId: authUser.id,
        revieweeUserId: selectedOpportunity.otherPartyId,
        propertyUuid: selectedOpportunity.propertyUuid
      });

      if (response.success) {
        // Refresh opportunities and close modal
        await loadReviewOpportunities();
        setIsReviewModalOpen(false);
        setSelectedOpportunity(null);
        // Success toast
        showToast('success', 'Your review has been submitted successfully.');
      }
    } catch (error) {
      console.error('Error creating review:', error);
      showToast('error', 'Failed to submit review. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-card mb-8">
        <div className="dashboard-card-header">
          <h2 className="dashboard-card-title">Review Opportunities</h2>
        </div>
        
        {opportunities.length === 0 ? (
          <div className="dashboard-card-content">
            <div className="dashboard-review-empty">
              <div className="text-gray-500">
                <svg className="dashboard-review-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="dashboard-review-empty-text">No review opportunities at this time</p>
                <p className="dashboard-review-empty-subtext">
                  Reviews become available after accepting offers and expire in {REVIEW_CONSTANTS.REVIEW_WINDOW_DAYS} days
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-card-content">
            {opportunities.map((opportunity) => {
              const daysRemaining = calculateDaysRemaining(opportunity.reviewWindowEnd);
              const isExpired = daysRemaining === 0;
              const isUrgent = daysRemaining <= 3 && daysRemaining > 0;
              
              return (
                <div 
                  key={opportunity.id} 
                >
                  <ReviewOpportunityItem
                    opportunity={opportunity}
                    daysRemaining={daysRemaining}
                    isExpired={isExpired}
                    isUrgent={isUrgent}
                    onLeaveReview={handleLeaveReview}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Creation Modal */}
      {selectedOpportunity && (
        <CreateReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedOpportunity(null);
          }}
          onSubmit={handleReviewSubmit}
          reviewType={selectedOpportunity.reviewType}
          otherPartyName={selectedOpportunity.otherPartyName}
          propertyTitle={selectedOpportunity.propertyTitle}
        />
      )}
    </>
  );
}
