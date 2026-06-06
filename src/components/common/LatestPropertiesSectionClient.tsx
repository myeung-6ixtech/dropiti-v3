'use client';

import { useEffect, useState } from 'react';
import type { Property } from '@/types';
import { fetchPublishedListings } from '@/lib/listings';
import PropertyCarousel from './PropertyCarousel';
import { PropertyCardSkeletonGrid } from '@/components/common/PropertyCardSkeleton';

export default function LatestPropertiesSectionClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const result = await fetchPublishedListings({ limit: 4, offset: 0 });
        if (cancelled) return;
        setProperties(result.success ? result.properties : []);
      } catch (error) {
        console.error('[LatestPropertiesSection] Failed to load listings:', error);
        if (!cancelled) setProperties([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-purple-600 mb-1 uppercase tracking-wide">
              Latest Listings
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Recently added properties
            </h2>
          </div>
          <PropertyCardSkeletonGrid count={8} />
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-purple-600 mb-1 uppercase tracking-wide">
            Latest Listings
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Recently added properties
          </h2>
          <p className="mt-2 text-base text-gray-500">
            Fresh listings — updated in real time as landlords publish.
          </p>
        </div>

        <PropertyCarousel properties={properties} />
      </div>
    </section>
  );
}
