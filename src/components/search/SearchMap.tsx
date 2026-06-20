'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { GoogleMap, OverlayView, useJsApiLoader } from '@react-google-maps/api';

export interface MapProperty {
  id: string;
  property_uuid: string;
  title: string;
  location: string;
  price: number;
  latitude?: number | null;
  longitude?: number | null;
  pinPrecision?: 'exact' | 'approximate';
}

interface LatLng {
  lat: number;
  lng: number;
}

interface SearchMapProps {
  properties: MapProperty[];
  selectedId: string | null;
  hoveredId: string | null;
  onMarkerClick: (id: string) => void;
  onMarkerHover: (id: string | null) => void;
  onReady?: (controls: { panTo: (id: string) => void }) => void;
}

const HONG_KONG_CENTER: LatLng = { lat: 22.3193, lng: 114.1694 };

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  fullscreenControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  clickableIcons: false,
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};

const formatPrice = (price: number) => {
  if (price >= 1000) return `$${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`;
  return `$${price}`;
};

function resolveCoords(prop: MapProperty): LatLng | null {
  if (typeof prop.latitude === 'number' && typeof prop.longitude === 'number') {
    return { lat: prop.latitude, lng: prop.longitude };
  }
  return null;
}

export default function SearchMap({
  properties,
  selectedId,
  hoveredId,
  onMarkerClick,
  onMarkerHover,
  onReady,
}: SearchMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const lastFitSignatureRef = useRef<string>('');

  const coords = useMemo(() => {
    const out: Record<string, LatLng> = {};
    for (const prop of properties) {
      const point = resolveCoords(prop);
      if (point) out[prop.id] = point;
    }
    return out;
  }, [properties]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;
    const ids = Object.keys(coords).sort();
    if (ids.length === 0) return;

    const signature = ids
      .map((id) => {
        const c = coords[id];
        return `${id}:${c.lat.toFixed(6)},${c.lng.toFixed(6)}`;
      })
      .join('|');
    if (signature === lastFitSignatureRef.current) return;
    lastFitSignatureRef.current = signature;

    const entries = ids.map((id) => coords[id]);

    if (entries.length === 1) {
      mapRef.current.panTo(entries[0]);
      mapRef.current.setZoom(15);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    entries.forEach((c) => bounds.extend(c));
    mapRef.current.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
  }, [coords, isLoaded]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback(
    (id: string) => {
      const c = coords[id];
      if (c && mapRef.current) {
        mapRef.current.panTo(c);
        mapRef.current.setZoom(16);
      }
    },
    [coords],
  );

  useEffect(() => {
    onReady?.({ panTo });
  }, [panTo, onReady]);

  if (loadError || !apiKey) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Unable to load map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
      </div>
    );
  }

  const markersWithCoords = properties.filter((prop) => coords[prop.id]);

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={HONG_KONG_CENTER}
      zoom={12}
      onLoad={onMapLoad}
      options={MAP_OPTIONS}
    >
      {markersWithCoords.map((prop) => {
        const c = coords[prop.id];
        const isSelected = selectedId === prop.id;
        const isHovered = hoveredId === prop.id;
        const isApproximate = prop.pinPrecision === 'approximate';

        return (
          <OverlayView
            key={prop.id}
            position={c}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <button
              type="button"
              onClick={() => onMarkerClick(prop.id)}
              onMouseEnter={() => onMarkerHover(prop.id)}
              onMouseLeave={() => onMarkerHover(null)}
              className={`
                px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                shadow-md border transition-all duration-150 -translate-x-1/2 -translate-y-1/2
                cursor-pointer select-none
                ${isSelected
                  ? 'bg-gray-900 text-white border-gray-900 scale-110 z-10'
                  : isHovered
                    ? 'bg-gray-900 text-white border-gray-900 scale-105'
                    : isApproximate
                      ? 'bg-white text-gray-700 border-dashed border-gray-400 hover:scale-105'
                      : 'bg-white text-gray-900 border-gray-200 hover:scale-105'}
              `}
            >
              {formatPrice(prop.price)}
            </button>
          </OverlayView>
        );
      })}
    </GoogleMap>
  );
}
