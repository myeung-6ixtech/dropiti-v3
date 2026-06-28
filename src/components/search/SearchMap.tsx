'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { GoogleMap, OverlayView } from '@react-google-maps/api';
import { useGoogleMapsLoader } from '@/lib/google-maps-loader';
import type { MapBounds } from '@/lib/listings-params';

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
  onReady?: (controls: {
    panTo: (id: string) => void;
    fitToBounds: (bounds: MapBounds) => void;
  }) => void;
  /** Fired on map idle with the visible viewport (debounced fetch in parent). */
  onBoundsChange?: (bounds: MapBounds) => void;
  /** When this changes (e.g. filters), fit map to markers once. */
  fitBoundsKey?: string;
  /** When this changes (e.g. pagination), fit map to the current page markers. */
  markerFitKey?: string;
  /** Pan/zoom map to a geocoded region (location filter apply). */
  regionFitBounds?: MapBounds | null;
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

function readMapBounds(map: google.maps.Map): MapBounds | null {
  const bounds = map.getBounds();
  if (!bounds) return null;
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  return {
    north: ne.lat(),
    south: sw.lat(),
    east: ne.lng(),
    west: sw.lng(),
  };
}

export default function SearchMap({
  properties,
  selectedId,
  hoveredId,
  onMarkerClick,
  onMarkerHover,
  onReady,
  onBoundsChange,
  fitBoundsKey = '',
  markerFitKey = '',
  regionFitBounds = null,
}: SearchMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const lastFilterFitKeyRef = useRef<string>('');
  const lastMarkerFitKeyRef = useRef<string>('');
  const lastRegionFitKeyRef = useRef<string>('');
  const hadRegionFitRef = useRef(false);
  const suppressNextIdleRef = useRef(false);

  const coords = useMemo(() => {
    const out: Record<string, LatLng> = {};
    for (const prop of properties) {
      const point = resolveCoords(prop);
      if (point) out[prop.id] = point;
    }
    return out;
  }, [properties]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useGoogleMapsLoader();

  const emitBounds = useCallback(() => {
    if (!mapRef.current || !onBoundsChange) return;
    const bounds = readMapBounds(mapRef.current);
    if (bounds) onBoundsChange(bounds);
  }, [onBoundsChange]);

  const fitMapToBounds = useCallback((bounds: MapBounds) => {
    if (!mapRef.current) return;
    const latLngBounds = new window.google.maps.LatLngBounds(
      { lat: bounds.south, lng: bounds.west },
      { lat: bounds.north, lng: bounds.east },
    );
    suppressNextIdleRef.current = true;
    mapRef.current.fitBounds(latLngBounds, { top: 48, bottom: 48, left: 48, right: 48 });
  }, []);

  const fitMapToMarkers = useCallback(() => {
    if (!mapRef.current || Object.keys(coords).length === 0) return;

    const entries = Object.values(coords);

    if (entries.length === 1) {
      suppressNextIdleRef.current = true;
      mapRef.current.panTo(entries[0]);
      mapRef.current.setZoom(15);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    entries.forEach((c) => bounds.extend(c));
    suppressNextIdleRef.current = true;
    mapRef.current.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
  }, [coords]);

  // Fit once when filters change.
  useEffect(() => {
    if (!isLoaded) return;
    if (fitBoundsKey === lastFilterFitKeyRef.current) return;
    if (Object.keys(coords).length === 0) return;

    lastFilterFitKeyRef.current = fitBoundsKey;
    fitMapToMarkers();
  }, [coords, fitBoundsKey, fitMapToMarkers, isLoaded]);

  // Fit when paginating within the same map area.
  useEffect(() => {
    if (!isLoaded || !markerFitKey) return;
    if (markerFitKey === lastMarkerFitKeyRef.current) return;
    if (Object.keys(coords).length === 0) return;

    lastMarkerFitKeyRef.current = markerFitKey;
    fitMapToMarkers();
  }, [coords, fitMapToMarkers, isLoaded, markerFitKey]);

  // Pan/zoom to geocoded region when location filter is applied.
  useEffect(() => {
    if (!isLoaded) return;
    if (!regionFitBounds) {
      if (hadRegionFitRef.current) {
        hadRegionFitRef.current = false;
        queueMicrotask(() => emitBounds());
      }
      lastRegionFitKeyRef.current = '';
      return;
    }

    hadRegionFitRef.current = true;
    const key = [
      regionFitBounds.north,
      regionFitBounds.south,
      regionFitBounds.east,
      regionFitBounds.west,
    ].join('|');
    if (key === lastRegionFitKeyRef.current) return;

    lastRegionFitKeyRef.current = key;
    fitMapToBounds(regionFitBounds);
  }, [emitBounds, fitMapToBounds, isLoaded, regionFitBounds]);

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      emitBounds();
    },
    [emitBounds],
  );

  const onMapIdle = useCallback(() => {
    if (suppressNextIdleRef.current) {
      suppressNextIdleRef.current = false;
      return;
    }
    emitBounds();
  }, [emitBounds]);

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

  const fitToBounds = useCallback(
    (bounds: MapBounds) => {
      fitMapToBounds(bounds);
    },
    [fitMapToBounds],
  );

  useEffect(() => {
    onReady?.({ panTo, fitToBounds });
  }, [panTo, fitToBounds, onReady]);

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
      onIdle={onMapIdle}
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
