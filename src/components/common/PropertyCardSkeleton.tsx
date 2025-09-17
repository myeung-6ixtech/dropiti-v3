import React from 'react';
import { propertyCardClasses } from '@/styles/property-card';

interface PropertyCardSkeletonProps {
  className?: string;
}

export default function PropertyCardSkeleton({ className = '' }: PropertyCardSkeletonProps) {
  return (
    <div className={`property-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Skeleton Image */}
      <div className={propertyCardClasses.skeleton.image}></div>
      
      {/* Skeleton Content */}
      <div className={propertyCardClasses.skeleton.content}>
        {/* Title */}
        <div className={propertyCardClasses.skeleton.title}></div>
        
        {/* Location */}
        <div className={`${propertyCardClasses.skeleton.feature} w-2/3`}></div>
        
        {/* Features Row */}
        <div className="flex items-center space-x-4 mt-3">
          <div className={`${propertyCardClasses.skeleton.feature} w-16`}></div>
          <div className={`${propertyCardClasses.skeleton.feature} w-16`}></div>
          <div className={`${propertyCardClasses.skeleton.feature} w-20`}></div>
        </div>
        
        {/* Price */}
        <div className={`${propertyCardClasses.skeleton.price} mt-4`}></div>
        
        {/* Action Button */}
        <div className="mt-4">
          <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton grid component for multiple cards
interface PropertyCardSkeletonGridProps {
  count?: number;
  className?: string;
}

export function PropertyCardSkeletonGrid({ count = 12, className = '' }: PropertyCardSkeletonGridProps) {
  return (
    <div className={`${propertyCardClasses.grid.search} ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}
