'use client';

import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMapsLoader } from '@/lib/google-maps-loader';
import { useState, useCallback, useMemo } from 'react';
import { parsePropertyAddress, resolveGeocodingAddress } from '@/lib/utils';

interface PropertyMapProps {
  address?: unknown;
  location?: string;
  showSpecificLocation?: boolean;
  className?: string;
  disableGeocoding?: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 22.3193,
  lng: 114.1694,
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  address,
  location,
  showSpecificLocation,
  className = '',
  disableGeocoding = false,
}) => {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const geocodingQueries = useMemo(() => {
    const primary = resolveGeocodingAddress({
      address,
      location,
      showSpecificLocation,
    });
    const queries = [primary];
    const parsed = parsePropertyAddress(address);
    const district = parsed?.district?.trim() || '';
    if (district) {
      queries.push(`${district}, Hong Kong`);
    }
    if (!queries.includes('Hong Kong')) {
      queries.push('Hong Kong');
    }
    return [...new Set(queries.filter(Boolean))];
  }, [address, location, showSpecificLocation]);

  const { isLoaded, loadError } = useGoogleMapsLoader();

  const geocodeAddress = useCallback(async (queries: string[]) => {
    if (!window.google?.maps?.Geocoder) {
      setGeocodingError('Google Maps not loaded');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    for (const addressString of queries) {
      try {
        const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address: addressString }, (results, status) => {
            if (status === 'OK' && results?.length) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });

        const point = results[0].geometry.location;
        setMapCenter({ lat: point.lat(), lng: point.lng() });
        setGeocodingError(null);
        return;
      } catch {
        continue;
      }
    }

    setMapCenter(defaultCenter);
    setGeocodingError(null);
  }, []);

  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);

    if (!disableGeocoding && isLoaded && geocodingQueries.length > 0) {
      geocodeAddress(geocodingQueries);
    }
  }, [disableGeocoding, isLoaded, geocodingQueries, geocodeAddress]);

  if (loadError) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Unable to load map</p>
            <p className="text-sm text-gray-500">Failed to load Google Maps API</p>
          </div>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Unable to load map</p>
            <p className="text-sm text-gray-500">Google Maps API key not configured</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  const markerTitle =
    resolveGeocodingAddress({ address, location, showSpecificLocation }) ||
    location ||
    'Property Location';

  return (
    <div className={`relative ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={15}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {isMapLoaded && (
          <Marker position={mapCenter} title={markerTitle} />
        )}
      </GoogleMap>

      {geocodingError && (
        <div className="absolute bottom-2 left-2 right-2 rounded-md bg-white/90 px-3 py-2 shadow-sm">
          <p className="text-xs text-gray-500">{geocodingError}</p>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
