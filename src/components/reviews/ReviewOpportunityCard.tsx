'use client';

import React from 'react';
import Image from 'next/image';
import { ReviewOpportunityCardProps } from '@/types/review';
import { REVIEW_TYPE_LABELS } from '@/types/review';
import { getSafeProfileImage } from '@/lib/utils';

export default function ReviewOpportunityCard({
  opportunity,
  onCreateReview
}: ReviewOpportunityCardProps) {



  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return 'Unknown';
    
    try {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Expired';
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day left';
      return `${diffDays} days left`;
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return 'Error';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'expired':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const isExpired = opportunity.reviewWindowEnd ? new Date(opportunity.reviewWindowEnd) < new Date() : false;
  const daysRemaining = getDaysRemaining(opportunity.reviewWindowEnd);

  return (
    <div className="dashboard-review-item">
      {/* Review Header - Similar to ReviewCard */}
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
              {REVIEW_TYPE_LABELS[opportunity.reviewType]}
            </p>
            <p className="text-xs mb-1 text-gray-400">
              {daysRemaining}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
          {opportunity.status}
        </span>
      </div>

      {/* Property Information - Similar to ReviewCard property section */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-medium text-gray-900 truncate mb-0">
              {opportunity.propertyTitle}
            </h5>
            <p className="text-sm text-gray-500 truncate mb-0">
              Review window ends: {opportunity.reviewWindowEnd ? new Date(opportunity.reviewWindowEnd).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Date not available'}
            </p>
          </div>
        </div>
      </div>

      {/* Review Actions - Similar to ReviewCard actions section */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Offer ID: {opportunity.offerId}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={onCreateReview}
          disabled={isExpired || opportunity.status === 'completed'}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            isExpired || opportunity.status === 'completed'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 active:bg-gray-900'
          }`}
        >
          {isExpired 
            ? 'Expired'
            : opportunity.status === 'completed'
            ? 'Completed'
            : 'Write Review'
          }
        </button>
      </div>
    </div>
  );
}
