'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import Script from 'next/script';
import { PropertyDetailHeader } from './_components/property-detail-header';
import { PropertyGallery } from './_components/property-gallery';
import { PropertyDescriptionSection } from './_components/property-description-section';
import { PropertyAmenitiesSection } from './_components/property-amenities-section';
import { PropertyDetailsSidebar } from './_components/property-details-sidebar';
import { PropertyMapSection } from './_components/property-map-section';
import { PropertyErrorState } from './_components/property-error-state';

interface Property {
  id: string;
  property_uuid: string;
  title: string;
  description: string;
  location: string;
  address: string | object;
  price: number;
  property_type: string;
  rental_space: string;
  bedrooms: number;
  bathrooms: number;
  gross_area_size: number;
  gross_area_size_unit: string;
  furnished: boolean;
  pets_allowed: boolean;
  amenities: string[];
  display_image: string;
  uploaded_images: string[];
  is_public: boolean;
  status?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const propertyUuid = Array.isArray(params.id) ? params.id[0] : params.id;
  
  // Debug logging
  console.log('Property page params:', params);
  console.log('Extracted propertyUuid:', propertyUuid);
  console.log('propertyUuid type:', typeof propertyUuid);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyUuid || typeof propertyUuid !== 'string') {
        console.error('Invalid propertyUuid:', propertyUuid);
        setError('Property ID is required and must be a valid string');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching property details for:', propertyUuid);
        
        const response = await propertiesAPI.getPropertyByUuid(propertyUuid);
        
        if (response.success && response.data?.property) {
          const propertyData = response.data.property;
          setProperty({
            id: propertyData.id,
            property_uuid: propertyData.property_uuid,
            title: propertyData.title,
            description: propertyData.description,
            location: propertyData.location,
            address: propertyData.address,
            price: propertyData.price,
            property_type: propertyData.details?.type || 'Unknown',
            rental_space: propertyData.rental_space || 'entire-apartment',
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            gross_area_size: propertyData.gross_area_size || 0,
            gross_area_size_unit: propertyData.gross_area_size_unit || 'sqft',
            furnished: propertyData.furnished || false,
            pets_allowed: propertyData.pets_allowed || false,
            amenities: propertyData.amenities || [],
            display_image: propertyData.display_image || '',
            uploaded_images: propertyData.uploaded_images || [],
            is_public: propertyData.is_public ?? false,
            status: propertyData.status || 'draft',
            created_at: propertyData.created_at,
            updated_at: propertyData.updated_at,
            owner_id: propertyData.owner_id,
          });
          console.log('Property details fetched:', propertyData);
        } else {
          throw new Error(response.error || 'Failed to fetch property details');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyUuid]);

  // Initialize Google Map
  const initializeMap = useCallback(() => {
    if (!property || !mapLoaded || typeof window === 'undefined') {
      console.log('Map initialization skipped:', { property: !!property, mapLoaded, window: typeof window });
      return;
    }

    try {
      console.log('Initializing Google Map for property:', property.title);
      
      // Check if Google Maps API is loaded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).google || !(window as any).google.maps) {
        console.error('Google Maps API not loaded');
        return;
      }

      // Handle address - could be string or object
      let addressString = '';
      if (typeof property.address === 'string') {
        addressString = property.address;
      } else if (property.address && typeof property.address === 'object') {
        // If it's an object, try to construct address string
        const addr = property.address as Record<string, string>;
        const parts = [];
        if (addr.street) parts.push(addr.street);
        if (addr.district) parts.push(addr.district);
        if (addr.city) parts.push(addr.city);
        if (addr.country) parts.push(addr.country);
        addressString = parts.join(', ');
      }

      if (!addressString) {
        console.error('No address found for property');
        return;
      }

      console.log('Geocoding address:', addressString);

      // Geocode the address
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const geocoder = new (window as any).google.maps.Geocoder();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      geocoder.geocode({ address: addressString }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          console.log('Geocoding successful:', results[0].formatted_address);
          
          const mapElement = document.getElementById('property-map');
          if (!mapElement) {
            console.error('Map element not found');
            return;
          }

          // Create map
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const map = new (window as any).google.maps.Map(mapElement, {
            zoom: 15,
            center: results[0].geometry.location,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          // Create custom marker
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const marker = new (window as any).google.maps.Marker({
            position: results[0].geometry.location,
            map: map,
            title: property.title,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
                  <path d="M16 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#ffffff"/>
                </svg>
              `),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              scaledSize: new (window as any).google.maps.Size(32, 32),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              anchor: new (window as any).google.maps.Point(16, 16)
            }
          });

          // Create info window
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${property.title}</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${addressString}</p>
              </div>
            `
          });

          // Add click listener to marker
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          console.log('Map initialized successfully');
        } else {
          console.error('Geocoding failed:', status);
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [property, mapLoaded]);

  // Initialize map when property and map are loaded
  useEffect(() => {
    if (property && mapLoaded) {
      initializeMap();
    }
  }, [property, mapLoaded, initializeMap]);

  if (loading) {
    return <CenteredLoadingSpinner />;
  }

  if (error || !property) {
    return <PropertyErrorState error={error} />;
  }

  if (!authUser?.id) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  // Check if user owns this property
  const isOwner = authUser.id === property.owner_id;

  return (
    <>
      {/* Google Maps Script */}
      {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          onLoad={() => {
            console.log('Google Maps script loaded successfully');
            setMapLoaded(true);
            setMapError(null);
          }}
          onError={(e) => {
            console.error('Google Maps script failed to load:', e);
            setMapLoaded(false);
            setMapError('Failed to load Google Maps');
          }}
          strategy="afterInteractive"
        />
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PropertyDetailHeader property={property} isOwner={isOwner} />

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <PropertyGallery
              displayImage={property.display_image}
              title={property.title}
            />

            <PropertyDescriptionSection description={property.description} />

            <PropertyAmenitiesSection amenities={property.amenities} />
          </div>

          {/* Sidebar */}
          <PropertyDetailsSidebar property={property} isOwner={isOwner} />
        </div>

        <PropertyMapSection
          location={property.location}
          mapLoaded={mapLoaded}
          mapError={mapError}
          hasApiKey={!!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        />
      </div>
    </>
  );
}
