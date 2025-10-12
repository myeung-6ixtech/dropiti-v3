import React from 'react';
import BaseSkeleton from './BaseSkeleton';

interface ChatContactSkeletonProps {
  count?: number;
  className?: string;
}

export default function ChatContactSkeleton({ count = 3, className = '' }: ChatContactSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3">
          {/* Avatar skeleton */}
          <BaseSkeleton 
            width={48} 
            height={48} 
            rounded="full" 
            className="flex-shrink-0"
          />
          
          {/* Contact info skeleton */}
          <div className="flex-1 space-y-2">
            {/* Name and time row */}
            <div className="flex justify-between items-center">
              <BaseSkeleton width="60%" height={16} />
              <BaseSkeleton width={40} height={12} />
            </div>
            
            {/* Last message */}
            <BaseSkeleton width="80%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}
