'use client';

import React from 'react';
import { ClockIcon, UserIcon, BuildingOfficeIcon, StarIcon } from '@heroicons/react/24/outline';
import { ReviewOpportunityCardProps } from '@/types/review';

export default function ReviewOpportunityCard({
  opportunity,
  onCreateReview
}: ReviewOpportunityCardProps) {


  const getReviewTypeIcon = (type: string) => {
    switch (type) {
      case 'tenant_to_landlord':
        return <BuildingOfficeIcon className="h-6 w-6 text-gray-700" />;
      case 'landlord_to_tenant':
        return <UserIcon className="h-6 w-6 text-gray-700" />;
      default:
        return <StarIcon className="h-6 w-6 text-gray-700" />;
    }
  };

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

  // Safe offerId display
  const getSafeOfferId = (offerId: string | number | undefined) => {
    if (!offerId) return 'Unknown';
    try {
      const idString = String(offerId);
      return idString.length > 8 ? idString.slice(-8) : idString;
    } catch (error) {
      console.error('Error formatting offer ID:', error);
      return 'Unknown';
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Left side - Property and Review Info */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1 p-2 bg-gray-50 rounded-lg">
              {getReviewTypeIcon(opportunity.reviewType)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                {opportunity.propertyTitle}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                <UserIcon className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Review for: {opportunity.otherPartyName}</span>
              </div>
            </div>
          </div>
          
          {/* Review window info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-medium text-gray-500">Window ends:</span>
                <span className="ml-2 text-gray-700 block sm:inline">{daysRemaining}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-500 font-medium">Date:</span>
              <span className="text-gray-700 text-xs sm:text-sm">
                {opportunity.reviewWindowEnd ? new Date(opportunity.reviewWindowEnd).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit'
                }) : 'Date not available'}
              </span>
            </div>
            <div className="flex items-center space-x-3 sm:col-span-2 lg:col-span-1">
              <span className="text-gray-500 font-medium">Offer ID:</span>
              <span className="text-gray-700 font-mono text-xs sm:text-sm">{getSafeOfferId(opportunity.offerId)}</span>
            </div>
          </div>
        </div>

        {/* Right side - Status and Action */}
        <div className="flex flex-col items-start lg:items-end gap-4 lg:ml-6">
          {/* Divider for larger screens */}
          <div className="hidden lg:block w-px h-16 bg-gray-200 self-center"></div>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(opportunity.status)}`}>
            {opportunity.status}
          </span>
          
          {/* Action Button */}
          <button
            onClick={onCreateReview}
            disabled={isExpired || opportunity.status === 'completed'}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
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
    </div>
  );
}
