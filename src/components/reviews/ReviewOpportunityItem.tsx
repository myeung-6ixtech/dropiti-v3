'use client';

import Image from 'next/image';
import { REVIEW_TYPES, REVIEW_STATUS } from '@/constants/review';
import { ReviewOpportunity } from '@/types/review';
import { getSafeProfileImage } from '@/lib/utils';

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



  const getReviewTypeLabel = (reviewType: string) => {
    return reviewType === REVIEW_TYPES.TENANT_TO_LANDLORD
      ? 'Tenant to Landlord'
      : 'Landlord to Tenant';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Review Header - Focus on the other party being reviewed */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Image
              src={getSafeProfileImage(undefined, '/images/Portrait_Placeholder.png')}
              alt={opportunity.otherPartyName || 'Other Party'}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/Portrait_Placeholder.png';
              }}
            />
          </div>
          <div>
            <p className="text-sm mb-1 font-medium text-gray-900">
              {opportunity.otherPartyName}
            </p>
            <p className="text-xs mb-1 text-gray-500">
              {getReviewTypeLabel(opportunity.reviewType)}
            </p>
            <p className="text-xs mb-1 text-gray-400">
              {isExpired ? 'Expired' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        {/* <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
          {opportunity.status}
        </span> */}
      </div>

      {/* Property Information */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-medium text-gray-900 truncate mb-1">
              {opportunity.propertyTitle}
            </h5>
            <p className="text-xs text-gray-500 mb-0">
              Review window ends: {new Date(opportunity.reviewWindowEnd).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Review Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>Offer ID: {opportunity.offerId}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>Review window ends: {new Date(opportunity.reviewWindowEnd).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}</span>
        </div>

        {/* Action Button */}
        {opportunity.status === REVIEW_STATUS.PENDING && !isExpired ? (
          <button
            onClick={() => onLeaveReview(opportunity)}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              isUrgent 
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                : 'bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 active:bg-gray-900'
            }`}
          >
            {isUrgent ? 'Review Now' : 'Leave Review'}
          </button>
        ) : (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              opportunity.status === REVIEW_STATUS.COMPLETED
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {opportunity.status === REVIEW_STATUS.COMPLETED ? 'Completed' : 'Expired'}
          </span>
        )}
      </div>
    </div>
  );
}


