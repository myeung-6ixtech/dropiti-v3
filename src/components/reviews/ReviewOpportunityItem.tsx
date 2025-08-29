'use client';

import { REVIEW_TYPES, REVIEW_STATUS } from '@/constants/review';

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

interface ReviewOpportunityItemProps {
  opportunity: ReviewOpportunity;
  daysRemaining: number;
  isExpired: boolean;
  isUrgent: boolean;
  onLeaveReview: (opportunity: ReviewOpportunity) => void;
}

export default function ReviewOpportunityItem({
  opportunity,
  daysRemaining,
  isExpired,
  isUrgent,
  onLeaveReview,
}: ReviewOpportunityItemProps) {
  return (
    <div className="dashboard-review-opportunity-content">
      <div className="dashboard-review-opportunity-details">
        <h3 className="dashboard-review-opportunity-title">{opportunity.propertyTitle}</h3>
        <p className="dashboard-review-opportunity-description">
          Review {opportunity.otherPartyName} as{' '}
          {opportunity.reviewType === REVIEW_TYPES.TENANT_TO_LANDLORD
            ? 'Tenant to Landlord'
            : 'Landlord to Tenant'}
        </p>
        <div className="dashboard-review-opportunity-meta">
          {isExpired ? (
            <span className="dashboard-review-opportunity-status-expired">Expired</span>
          ) : (
            <span className={`${isUrgent ? 'dashboard-review-opportunity-status-urgent' : 'dashboard-review-opportunity-status-normal'}`}>
              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
            </span>
          )}
          <span className="dashboard-review-opportunity-expiry">
            Expires: {new Date(opportunity.reviewWindowEnd).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="dashboard-review-opportunity-actions">
        {opportunity.status === REVIEW_STATUS.PENDING && !isExpired ? (
          <button
            onClick={() => onLeaveReview(opportunity)}
            className={isUrgent ? 'dashboard-review-opportunity-button-urgent' : 'btn-primary'}
          >
            {isUrgent ? 'Review Now' : 'Leave Review'}
          </button>
        ) : (
          <span
            className={
              opportunity.status === REVIEW_STATUS.COMPLETED
                ? 'dashboard-review-opportunity-status-completed'
                : 'dashboard-review-opportunity-status-expired-badge'
            }
          >
            {opportunity.status === REVIEW_STATUS.COMPLETED ? 'Completed' : 'Expired'}
          </span>
        )}
      </div>
    </div>
  );
}


