'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import PropertyCard from '@/components/PropertyCard';
import SearchMap from './SearchMap';
import MapBottomSheet from './MapBottomSheet';
import { useHaptic } from '@/hooks/useHaptic';
import { getListingKey } from '@/lib/normalize-listing';
import type { MapBounds } from '@/lib/listings-params';
import PropertyCardSkeleton from '@/components/common/PropertyCardSkeleton';

interface SearchMapViewProps {
  properties: (Property & { property_uuid?: string })[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  isViewportLoading?: boolean;
  isViewportRefreshing?: boolean;
  viewportError?: string | null;
  hasLocationRegion?: boolean;
  locationLabel?: string;
  regionFitBounds?: MapBounds | null;
  onPageChange: (page: number) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  fitBoundsKey: string;
  markerFitKey: string;
}

export default function SearchMapViewInner({
  properties,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  isViewportLoading = false,
  isViewportRefreshing = false,
  viewportError = null,
  hasLocationRegion = false,
  locationLabel = '',
  regionFitBounds = null,
  onPageChange,
  onBoundsChange,
  fitBoundsKey,
  markerFitKey,
}: SearchMapViewProps) {
  const router = useRouter();
  const { tap } = useHaptic();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const mapControlsRef = useRef<{ panTo: (id: string) => void } | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile]);

  useEffect(() => {
    setSelectedId(null);
    setHoveredId(null);
  }, [markerFitKey, properties]);

  useEffect(() => {
    listContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const mapProperties = useMemo(
    () =>
      properties.map((p, index) => {
        const listingKey = getListingKey(p, index);
        return {
          id: listingKey,
          property_uuid: p.property_uuid || String(p.id ?? listingKey),
          title: p.title,
          location: p.location,
          price: p.price,
          latitude: p.latitude,
          longitude: p.longitude,
          pinPrecision: p.pinPrecision,
        };
      }),
    [properties],
  );

  const handleMapReady = useCallback((controls: { panTo: (id: string) => void }) => {
    mapControlsRef.current = controls;
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    tap('light');
    setSelectedId(id);
    const el = cardRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [tap]);

  const handleCardClick = useCallback((id: string) => {
    setSelectedId(id);
    mapControlsRef.current?.panTo(id);
  }, []);

  const handleMarkerHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const handleCardHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const mapSkeletons = Array.from({ length: 4 }, (_, i) => (
    <PropertyCardSkeleton key={`map-skeleton-${i}`} />
  ));

  const emptyMessage = hasLocationRegion && locationLabel
    ? `No properties found in ${locationLabel}. Try adjusting bedrooms or price filters.`
    : 'No properties in this map area. Try zooming out or panning to another district.';

  const cardList =
    properties.length === 0 && isViewportLoading ? (
      mapSkeletons
    ) : properties.length === 0 ? (
      <div className="col-span-2 py-8 text-center text-gray-500 text-sm">
        {emptyMessage}
      </div>
    ) : (
      properties.map((property, index) => {
        const listingKey = getListingKey(property, index);
        const propertyUuid = property.property_uuid || String(property.id ?? listingKey);
        const isHovered = hoveredId === listingKey;

        return (
          <div
            key={listingKey}
            ref={(el) => {
              cardRefs.current[listingKey] = el;
            }}
            onMouseEnter={() => handleCardHover(listingKey)}
            onMouseLeave={() => handleCardHover(null)}
            onClick={() => handleCardClick(listingKey)}
            className={`
              rounded-xl transition-all duration-200 cursor-pointer
              ${isHovered ? 'ring-2 ring-gray-400 ring-offset-1' : ''}
            `}
          >
            <PropertyCard
              property={{
                ...property,
                property_uuid: propertyUuid,
              }}
              onViewDetails={(uuid) => router.push(`/property/${uuid}`)}
            />
          </div>
        );
      })
    );

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  const paginationControls =
    totalPages > 1 ? (
      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-xs text-gray-500">
          Showing {startIndex}-{endIndex} of {totalCount} properties in this area
        </p>
        <nav className="flex items-center space-x-2" aria-label="Map listings pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isViewportRefreshing}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 1 || isViewportRefreshing
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <span className="px-3 py-2 text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isViewportRefreshing}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === totalPages || isViewportRefreshing
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </nav>
      </div>
    ) : null;

  const mapElement = (
    <SearchMap
      properties={mapProperties}
      selectedId={selectedId}
      hoveredId={hoveredId}
      onMarkerClick={handleMarkerClick}
      onMarkerHover={handleMarkerHover}
      onReady={handleMapReady}
      onBoundsChange={onBoundsChange}
      fitBoundsKey={fitBoundsKey}
      markerFitKey={markerFitKey}
      regionFitBounds={regionFitBounds}
    />
  );

  const statusPill =
    isViewportRefreshing || viewportError ? (
      <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-800 shadow-lg ring-1 ring-gray-200 backdrop-blur">
        {isViewportRefreshing ? 'Searching this area...' : viewportError}
      </div>
    ) : null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 top-16 z-10">
        <div className="absolute inset-0">{mapElement}</div>
        {statusPill}
        <MapBottomSheet>
          <div className="flex flex-col gap-4 pb-4">
            <div className="grid grid-cols-1 gap-4">{cardList}</div>
            {paginationControls}
          </div>
        </MapBottomSheet>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-[calc(100vh-180px)] min-h-[500px] w-full gap-0">
      <div className="w-[40%] h-full overflow-y-auto pr-4 pb-20" ref={listContainerRef}>
        <div className="grid grid-cols-2 gap-4">{cardList}</div>
        {paginationControls}
      </div>

      <div className="relative w-[60%] h-full sticky top-0 rounded-xl overflow-hidden border border-gray-200">
        {mapElement}
        {statusPill}
      </div>
    </div>
  );
}
