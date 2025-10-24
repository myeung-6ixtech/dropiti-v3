import React from 'react';
import BaseSkeleton from './BaseSkeleton';

interface TenantProfileCardSkeletonProps {
  count?: number;
  className?: string;
}

export default function TenantProfileCardSkeleton({ count = 1, className = '' }: TenantProfileCardSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Status Badge Skeleton */}
          <div className="absolute top-3 right-3">
            <BaseSkeleton width={80} height={20} rounded="full" />
          </div>

          <div className="p-4">
            <div className="space-y-2">
              {/* User Header Skeleton */}
              <div className="flex items-start gap-3 pr-20">
                <div className="flex-shrink-0">
                  <BaseSkeleton width={48} height={48} rounded="full" />
                </div>
                <div className="flex-1 min-w-0">
                  <BaseSkeleton width="60%" height={14} className="mb-2" />
                  <BaseSkeleton width="80%" height={16} />
                </div>
              </div>

              {/* Description Skeleton */}
              <div>
                <BaseSkeleton width="100%" height={12} className="mb-1" />
                <BaseSkeleton width="70%" height={12} />
              </div>

              {/* Key Details Grid Skeleton */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <BaseSkeleton width="50%" height={12} className="mb-1" />
                  <BaseSkeleton width="90%" height={12} />
                </div>
                <div>
                  <BaseSkeleton width="60%" height={12} className="mb-1" />
                  <BaseSkeleton width="85%" height={12} />
                </div>
                <div>
                  <BaseSkeleton width="55%" height={12} className="mb-1" />
                  <BaseSkeleton width="80%" height={12} />
                </div>
                <div>
                  <BaseSkeleton width="45%" height={12} className="mb-1" />
                  <BaseSkeleton width="75%" height={12} />
                </div>
              </div>

              {/* Preferences Tags Skeleton */}
              <div className="pt-1 border-t border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  <BaseSkeleton width={60} height={20} rounded="md" />
                  <BaseSkeleton width={70} height={20} rounded="md" />
                  <BaseSkeleton width={50} height={20} rounded="md" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <BaseSkeleton width={120} height={12} />
              <div className="flex items-center gap-2">
                <BaseSkeleton width={80} height={28} rounded="md" />
                <BaseSkeleton width={70} height={28} rounded="md" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Grid version for marketplace listing
export function TenantProfileCardSkeletonGrid({ count = 12, className = '' }: TenantProfileCardSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <TenantProfileCardSkeleton key={index} count={1} />
      ))}
    </div>
  );
}
