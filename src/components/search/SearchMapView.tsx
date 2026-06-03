'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import PropertyCard from '@/components/PropertyCard';
import SearchMap from './SearchMap';
import MapBottomSheet from './MapBottomSheet';
import { useHaptic } from '@/hooks/useHaptic';
import { getListingKey } from '@/lib/normalize-listing';

interface SearchMapViewProps {
  properties: (Property & { property_uuid?: string })[];
}

export default function SearchMapView({ properties }: SearchMapViewProps) {
  const router = useRouter();
  const { tap } = useHaptic();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
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

  const cardList = properties.map((property, index) => {
    const listingKey = getListingKey(property, index);
    const propertyUuid = property.property_uuid || String(property.id ?? listingKey);
    const isSelected = selectedId === listingKey;
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
  });

  const mapElement = (
    <SearchMap
      properties={mapProperties}
      selectedId={selectedId}
      hoveredId={hoveredId}
      onMarkerClick={handleMarkerClick}
      onMarkerHover={handleMarkerHover}
      onReady={handleMapReady}
    />
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 top-16 z-10">
        <div className="absolute inset-0">{mapElement}</div>
        <MapBottomSheet>
          <p className="text-sm text-gray-500 mb-3 px-1">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
          <div className="flex flex-col gap-4 pb-4">{cardList}</div>
        </MapBottomSheet>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-[calc(100vh-180px)] min-h-[500px] w-full gap-0">
      <div className="w-[40%] h-full overflow-y-auto pr-4 pb-20">
        <div className="grid grid-cols-2 gap-4">{cardList}</div>
      </div>

      <div className="w-[60%] h-full sticky top-0 rounded-xl overflow-hidden border border-gray-200">
        {mapElement}
      </div>
    </div>
  );
}
