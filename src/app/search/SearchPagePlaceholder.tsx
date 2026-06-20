'use client';

import ViewModeToggle from '@/components/search/ViewModeToggle';
import { PropertyCardSkeletonGrid } from '@/components/common/PropertyCardSkeleton';
import { LISTINGS_PAGE_SIZE } from '@/lib/listings-params';

/** Static shell — identical on server and first client paint (avoids hydration mismatch). */
export default function SearchPagePlaceholder() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-5">
          <ViewModeToggle viewMode="list" onToggle={() => {}} />
        </div>
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
        <PropertyCardSkeletonGrid count={LISTINGS_PAGE_SIZE} />
      </div>
    </div>
  );
}
