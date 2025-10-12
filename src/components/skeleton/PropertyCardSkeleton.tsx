import React from 'react';
import BaseSkeleton from './BaseSkeleton';

interface PropertyCardSkeletonProps {
  count?: number;
  className?: string;
}

export default function PropertyCardSkeleton({ count = 1, className = '' }: PropertyCardSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Image skeleton */}
          <BaseSkeleton 
            width="100%" 
            height={200} 
            rounded="none"
          />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <BaseSkeleton width="80%" height={20} />
            
            {/* Location */}
            <BaseSkeleton width="60%" height={16} />
            
            {/* Price and details row */}
            <div className="flex justify-between items-center">
              <BaseSkeleton width={100} height={18} />
              <div className="flex space-x-2">
                <BaseSkeleton width={60} height={14} />
                <BaseSkeleton width={60} height={14} />
                <BaseSkeleton width={60} height={14} />
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <BaseSkeleton width="100%" height={14} />
              <BaseSkeleton width="70%" height={14} />
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <BaseSkeleton width={80} height={36} rounded="md" />
              <BaseSkeleton width={80} height={36} rounded="md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
