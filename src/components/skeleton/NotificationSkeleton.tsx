import React from 'react';
import BaseSkeleton from './BaseSkeleton';

interface NotificationSkeletonProps {
  count?: number;
  className?: string;
}

export default function NotificationSkeleton({ count = 3, className = '' }: NotificationSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-start space-x-3 p-4">
          {/* Icon skeleton */}
          <BaseSkeleton 
            width={40} 
            height={40} 
            rounded="full" 
            className="flex-shrink-0"
          />
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            {/* Title and time row */}
            <div className="flex justify-between items-start">
              <BaseSkeleton width="70%" height={16} />
              <BaseSkeleton width={60} height={12} />
            </div>
            
            {/* Message */}
            <BaseSkeleton width="90%" height={14} />
            <BaseSkeleton width="60%" height={14} />
            
            {/* Action button (optional) */}
            {Math.random() > 0.5 && (
              <BaseSkeleton width={80} height={32} rounded="md" className="mt-2" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
