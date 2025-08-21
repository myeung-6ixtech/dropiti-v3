'use client';

import React, { useState } from 'react';
import { StarIcon, HeartIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { getSafeProfileImage } from '@/lib/utils';
import { ReviewCardProps } from '@/types/review';

export default function ReviewCard({
  review,
  showPropertyInfo = false,
  showActions = false,
  onEdit,
  onDelete
}: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);

  const handleHelpful = async () => {
    if (isHelpful) return;
    
    try {
      const response = await fetch('/api/v1/reviews/mark-helpful', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewUuid: review.reviewUuid,
        }),
      });

      if (response.ok) {
        setIsHelpful(true);
        setHelpfulCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const getReviewTypeLabel = (type: string) => {
    switch (type) {
      case 'tenant_to_landlord':
        return 'Tenant Review';
      case 'landlord_to_tenant':
        return 'Landlord Review';
      case 'offer_review':
        return 'Offer Review';
      default:
        return 'Review';
    }
  };

  const renderStars = (rating: number) => {
    if (typeof rating !== 'number' || isNaN(rating)) {
      rating = 0;
    }
    
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Image
              src={getSafeProfileImage(
                review.reviewer?.photoUrl || review.reviewedUser?.photoUrl || undefined,
                '/images/Portrait_Placeholder.png'
              )}
              alt="Profile"
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
              {review.reviewer?.displayName || review.reviewedUser?.displayName || 'Anonymous'}
            </p>
            <p className="text-xs mb-1 text-gray-500">
              {getReviewTypeLabel(review.reviewType)}
            </p>
            <p className="text-xs mb-1 text-gray-400">
              {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : 'Unknown date'}
            </p>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-1">
          {renderStars(review.rating)}
          <span className="ml-2 text-sm font-medium text-gray-900">
            {typeof review.rating === 'number' ? review.rating.toFixed(1) : '0.0'}
          </span>
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        {review.title && (
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {review.title}
          </h4>
        )}
        {review.comment && (
          <p className="text-sm mb-1 text-gray-700 leading-relaxed">
            {review.comment}
          </p>
        )}
      </div>

      {/* Property Information */}
      {showPropertyInfo && review.property && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {review.property.photos && review.property.photos.length > 0 && review.property.photos[0] && (
              <div className="flex-shrink-0">
                <Image
                  src={review.property.photos[0]}
                  alt={review.property.title}
                  width={60}
                  height={60}
                  className="h-[60px] w-[60px] rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.png';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-gray-900 truncate">
                {review.property.title}
              </h5>
              <p className="text-sm text-gray-500 truncate">
                {review.property.location}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleHelpful}
            disabled={isHelpful}
            className={`flex items-center space-x-2 text-sm ${
              isHelpful
                ? 'text-blue-600 cursor-default'
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            } px-3 py-1 rounded-full transition-colors`}
          >
            {isHelpful ? (
              <HeartIconSolid className="h-4 w-4" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
            <span>
              {isHelpful ? 'Helpful' : 'Helpful'} ({helpfulCount})
            </span>
          </button>
        </div>

        {/* Edit/Delete Actions */}
        {showActions && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Edit review"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.reviewUuid)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete review"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
