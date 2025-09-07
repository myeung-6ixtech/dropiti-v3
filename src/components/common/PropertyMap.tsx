'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useState, useCallback } from 'react';

interface PropertyMapProps {
  address: string;
  location?: string;
  className?: string;
  disableGeocoding?: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 22.3193, // Hong Kong coordinates as default
  lng: 114.1694,
};

const PropertyMap: React.FC<PropertyMapProps> = ({ address, location, className = '', disableGeocoding = false }) => {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Check if API key is available
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Use the useJsApiLoader hook to manage API loading
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries: ['places'],
  });

  // Geocode address to get coordinates
  const geocodeAddress = useCallback(async (addressString: string) => {
    if (!window.google?.maps?.Geocoder) {
      setGeocodingError('Google Maps not loaded');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address: addressString }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (results.length > 0) {
        const location = results[0].geometry.location;
        setMapCenter({
          lat: location.lat(),
          lng: location.lng(),
        });
        setGeocodingError(null);
      } else {
        setGeocodingError('Address not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      
      // Handle specific geocoding errors
      if (error instanceof Error) {
        if (error.message.includes('REQUEST_DENIED')) {
          setGeocodingError('Geocoding API access denied. Please check API key permissions.');
        } else if (error.message.includes('OVER_QUERY_LIMIT')) {
          setGeocodingError('Geocoding quota exceeded. Please try again later.');
        } else if (error.message.includes('ZERO_RESULTS')) {
          setGeocodingError('Address not found. Showing default location.');
        } else {
          setGeocodingError('Failed to geocode address. Showing default location.');
        }
      } else {
        setGeocodingError('Failed to geocode address. Showing default location.');
      }
      
      // Keep the default center (Hong Kong) when geocoding fails
      console.log('Using default location due to geocoding failure');
    }
  }, []);

  // Handle map load
  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    
    // Only geocode if not disabled and API is loaded
    if (!disableGeocoding && isLoaded) {
      const addressToGeocode = address || location || '';
      if (addressToGeocode) {
        geocodeAddress(addressToGeocode);
      }
    } else {
      console.log('Geocoding disabled or API not loaded, using default location');
    }
  }, [address, location, geocodeAddress, disableGeocoding, isLoaded]);

  // Handle API loading errors
  if (loadError) {
    console.error('Google Maps load error:', loadError);
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
          <Marker
            position={mapCenter}
            title={address || location || 'Property Location'}
          />
        )}
      </GoogleMap>
      
      {geocodingError && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Map loaded with default location</p>
            <p className="text-sm text-gray-500">{geocodingError}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
