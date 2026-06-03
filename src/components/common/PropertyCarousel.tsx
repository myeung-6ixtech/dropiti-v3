'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import PropertyCard from '@/components/PropertyCard';
import { Property } from '@/types';

interface PropertyCarouselProps {
  properties: (Property & {
    property_uuid?: string;
    address?: unknown;
    rental_price?: number;
    num_bedroom?: number;
    num_bathroom?: number;
    display_image?: string | null;
    property_type?: string;
  })[];
}

export default function PropertyCarousel({ properties }: PropertyCarouselProps) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const cardWidth = trackRef.current.querySelector('[data-carousel-item]')?.clientWidth ?? 300;
    const gap = 16;
    trackRef.current.scrollBy({
      left: direction === 'right' ? cardWidth + gap : -(cardWidth + gap),
      behavior: 'smooth',
    });
  };

  if (properties.length === 0) return null;

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {properties.map((property) => (
          <div
            key={property.property_uuid || property.id}
            data-carousel-item
            className="snap-start flex-none w-[82vw] sm:w-[320px] lg:w-[calc(25%-12px)]"
          >
            <PropertyCard
              property={property}
              onViewDetails={(uuid) => router.push(`/property/${uuid}`)}
            />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
      >
        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}
