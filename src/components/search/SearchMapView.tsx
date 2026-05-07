'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import PropertyCard from '@/components/PropertyCard';
import SearchMap from './SearchMap';
import MapBottomSheet from './MapBottomSheet';
import { useHaptic } from '@/hooks/useHaptic';

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

  // Lock body scroll on mobile so only the bottom sheet scrolls
  useEffect(() => {
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isMobile]);

  const mapProperties = useMemo(
    () =>
      properties.map((p) => ({
        id: p.id,
        property_uuid: p.property_uuid || p.id,
        title: p.title,
        location: p.location,
        price: p.price,
      })),
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

  const cardList = properties.map((property) => {
    const isSelected = selectedId === property.id;
    const isHovered = hoveredId === property.id;
    return (
      <div
        key={property.id}
        ref={(el) => { cardRefs.current[property.id] = el; }}
        onMouseEnter={() => handleCardHover(property.id)}
        onMouseLeave={() => handleCardHover(null)}
        onClick={() => handleCardClick(property.id)}
        className={`
          rounded-xl transition-all duration-200 cursor-pointer
          ${isHovered
            ? 'ring-2 ring-gray-400 ring-offset-1'
            : ''}
        `}
      >
        <PropertyCard
          property={{
            ...property,
            property_uuid: property.property_uuid || property.id,
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

  /* ── Mobile: full-screen map + bottom sheet ── */
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

  /* ── Desktop: cards left (40%) | map right (60%) ── */
  return (
    <div className="flex flex-row h-[calc(100vh-180px)] min-h-[500px] w-full gap-0">
      {/* Left: scrollable 2-col card grid */}
      <div className="w-[40%] h-full overflow-y-auto pr-4 pb-20">
        <div className="grid grid-cols-2 gap-4">
          {cardList}
        </div>
      </div>

      {/* Right: sticky map */}
      <div className="w-[60%] h-full sticky top-0 rounded-xl overflow-hidden border border-gray-200">
        {mapElement}
      </div>
    </div>
  );
}
