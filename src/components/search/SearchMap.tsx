'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, OverlayView, useJsApiLoader } from '@react-google-maps/api';

export interface MapProperty {
  id: string;
  property_uuid: string;
  title: string;
  location: string;
  price: number;
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

type Libraries = ('places')[];
const LIBRARIES: Libraries = ['places'];

export default function SearchMap({
  properties,
  selectedId,
  hoveredId,
  onMarkerClick,
  onMarkerHover,
  onReady,
}: SearchMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [coords, setCoords] = useState<Record<string, LatLng>>({});
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const geocodeCacheRef = useRef<Record<string, LatLng>>({});

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const geocodeProperty = useCallback(
    async (property: MapProperty): Promise<LatLng | null> => {
      const cacheKey = property.location || property.title;
      if (geocodeCacheRef.current[cacheKey]) return geocodeCacheRef.current[cacheKey];

      if (!geocoderRef.current) return null;

      try {
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoderRef.current!.geocode({ address: property.location }, (results, status) => {
            if (status === 'OK' && results) resolve(results);
            else reject(new Error(status));
          });
        });

        if (result.length > 0) {
          const loc = result[0].geometry.location;
          const point = { lat: loc.lat(), lng: loc.lng() };
          geocodeCacheRef.current[cacheKey] = point;
          return point;
        }
      } catch {
        // geocoding failed for this property — skip it
      }
      return null;
    },
    [],
  );

  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.Geocoder) return;
    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    let cancelled = false;

    const geocodeAll = async () => {
      const newCoords: Record<string, LatLng> = {};
      // Process sequentially with small delay to respect rate limits
      for (const prop of properties) {
        if (cancelled) break;
        // Skip if already geocoded in this batch
        if (coords[prop.id]) {
          newCoords[prop.id] = coords[prop.id];
          continue;
        }
        const point = await geocodeProperty(prop);
        if (point) newCoords[prop.id] = point;
        // Small delay between requests
        await new Promise((r) => setTimeout(r, 120));
      }
      if (!cancelled) {
        setCoords((prev) => ({ ...prev, ...newCoords }));
      }
    };

    geocodeAll();
    return () => { cancelled = true; };
    // Only re-geocode when the property list itself changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, properties, geocodeProperty]);

  // Fit bounds when coords change
  useEffect(() => {
    if (!mapRef.current) return;
    const entries = Object.values(coords);
    if (entries.length === 0) return;

    if (entries.length === 1) {
      mapRef.current.panTo(entries[0]);
      mapRef.current.setZoom(15);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    entries.forEach((c) => bounds.extend(c));
    mapRef.current.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
  }, [coords]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback((id: string) => {
    const c = coords[id];
    if (c && mapRef.current) {
      mapRef.current.panTo(c);
      mapRef.current.setZoom(16);
    }
  }, [coords]);

  // Notify parent when panTo becomes available / updates
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

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={HONG_KONG_CENTER}
      zoom={12}
      onLoad={onMapLoad}
      options={MAP_OPTIONS}
    >
      {properties.map((prop) => {
        const c = coords[prop.id];
        if (!c) return null;

        const isSelected = selectedId === prop.id;
        const isHovered = hoveredId === prop.id;

        return (
          <OverlayView
            key={prop.id}
            position={c}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <button
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

