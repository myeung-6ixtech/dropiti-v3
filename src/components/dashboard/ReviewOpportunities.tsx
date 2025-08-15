'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { REVIEW_CONSTANTS, REVIEW_TYPES, REVIEW_STATUS } from '@/constants/review';
import { offersAPI } from '@/lib/api-client';
import CreateReviewModal from '@/components/common/CreateReviewModal';

interface ReviewOpportunity {
  id: string;
  propertyTitle: string;
  otherPartyName: string;
  reviewType: string;
  reviewWindowEnd: string;
  daysRemaining: number;
  status: string;
  offerId: string;
  offerUuid: string;
  propertyUuid: string;
  otherPartyId: string;
}

export default function ReviewOpportunities() {
  const [opportunities, setOpportunities] = useState<ReviewOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ReviewOpportunity | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { user: authUser } = useAuth();

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
        offerUuid: selectedOpportunity.offerUuid,
        reviewType: selectedOpportunity.reviewType,
        rating: reviewData.rating,
        comment: reviewData.comment,
        reviewerId: authUser.id,
        reviewedUserId: selectedOpportunity.otherPartyId,
        propertyUuid: selectedOpportunity.propertyUuid
      });

      if (response.success) {
        // Refresh opportunities and close modal
        await loadReviewOpportunities();
        setIsReviewModalOpen(false);
        setSelectedOpportunity(null);
      }
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
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
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Review Opportunities</h2>
          <div className="text-sm text-gray-500">
            {REVIEW_CONSTANTS.REVIEW_WINDOW_DAYS} days to leave reviews after accepting offers
          </div>
        </div>
        
        {opportunities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500">No review opportunities at this time.</p>
            <p className="text-sm text-gray-400 mt-1">
              Reviews become available after accepting offers and expire in {REVIEW_CONSTANTS.REVIEW_WINDOW_DAYS} days.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map((opportunity) => {
              const daysRemaining = calculateDaysRemaining(opportunity.reviewWindowEnd);
              const isExpired = daysRemaining === 0;
              const isUrgent = daysRemaining <= 3 && daysRemaining > 0;
              
              return (
                <div 
                  key={opportunity.id} 
                  className={`border rounded-lg p-4 ${
                    isExpired 
                      ? 'border-red-200 bg-red-50' 
                      : isUrgent 
                        ? 'border-yellow-200 bg-yellow-50' 
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{opportunity.propertyTitle}</h3>
                      <p className="text-sm text-gray-600">
                        Review {opportunity.otherPartyName} as{' '}
                        {opportunity.reviewType === REVIEW_TYPES.TENANT_TO_LANDLORD 
                          ? 'Tenant to Landlord' 
                          : 'Landlord to Tenant'
                        }
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        {isExpired ? (
                          <span className="text-red-600 text-sm font-medium">Expired</span>
                        ) : (
                          <span className={`text-sm font-medium ${
                            isUrgent ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Expires: {new Date(opportunity.reviewWindowEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {opportunity.status === REVIEW_STATUS.PENDING && !isExpired ? (
                        <button 
                          onClick={() => handleLeaveReview(opportunity)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            isUrgent 
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                              : 'btn-primary'
                          }`}
                        >
                          {isUrgent ? 'Review Now' : 'Leave Review'}
                        </button>
                      ) : (
                        <span className={`text-sm font-medium px-3 py-2 rounded-lg ${
                          opportunity.status === REVIEW_STATUS.COMPLETED 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-red-600 bg-red-100'
                        }`}>
                          {opportunity.status === REVIEW_STATUS.COMPLETED ? 'Completed' : 'Expired'}
                        </span>
                      )}
                    </div>
                  </div>
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
