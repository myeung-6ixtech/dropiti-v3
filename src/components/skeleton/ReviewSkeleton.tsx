import React from 'react';
import BaseSkeleton from './BaseSkeleton';

interface ReviewSkeletonProps {
  count?: number;
  className?: string;
}

export default function ReviewSkeleton({ count = 3, className = '' }: ReviewSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
          <div className="flex items-start space-x-3 mb-3">
            {/* Avatar skeleton */}
            <BaseSkeleton 
              width={40} 
              height={40} 
              rounded="full"
            />
            
            <div className="flex-1 min-w-0">
              {/* Reviewer name and badge */}
              <div className="flex items-center space-x-2 mb-1">
                <BaseSkeleton width={120} height={16} />
                <BaseSkeleton width={80} height={20} rounded="full" />
              </div>
              
              {/* Star rating */}
              <div className="flex items-center space-x-1 mb-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <BaseSkeleton key={i} width={12} height={12} rounded="none" />
                  ))}
                </div>
                <BaseSkeleton width={30} height={12} />
              </div>
              
              {/* Date and property */}
              <div className="flex items-center space-x-2 mb-2">
                <BaseSkeleton width={100} height={12} />
                <BaseSkeleton width={150} height={12} />
              </div>
            </div>
          </div>
          
          {/* Review title */}
          <BaseSkeleton width="60%" height={16} className="mb-2" />
          
          {/* Review comment */}
          <div className="space-y-2">
            <BaseSkeleton width="100%" height={14} />
            <BaseSkeleton width="90%" height={14} />
            <BaseSkeleton width="75%" height={14} />
          </div>
          
          {/* Property card skeleton */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <BaseSkeleton width={64} height={64} rounded="lg" />
              <div className="flex-1">
                <BaseSkeleton width="80%" height={14} className="mb-1" />
                <BaseSkeleton width="60%" height={12} className="mb-1" />
                <BaseSkeleton width="40%" height={12} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
