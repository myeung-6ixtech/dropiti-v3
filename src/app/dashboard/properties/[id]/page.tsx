'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, PencilIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';

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
            is_public: propertyData.available || false,
            status: propertyData.status || (propertyData.available ? 'published' : 'draft'),
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
      if (!window.google || !window.google.maps) {
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
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: addressString }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results[0]) {
          console.log('Geocoding successful:', results[0].formatted_address);
          
          const mapElement = document.getElementById('property-map');
          if (!mapElement) {
            console.error('Map element not found');
            return;
          }

          // Create map
          const map = new window.google.maps.Map(mapElement, {
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
          const marker = new window.google.maps.Marker({
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
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 16)
            }
          });

          // Create info window
          const infoWindow = new window.google.maps.InfoWindow({
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
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Property</h3>
          <p className="text-red-600 mb-4">{error || 'Property not found'}</p>
          <button
            onClick={() => router.back()}
            className="btn-danger"
          >
            Go Back
          </button>
        </div>
      </div>
    );
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              property.status === 'published' || property.is_public
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {property.status === 'published' || property.is_public ? 'Active' : 'Draft'}
            </div>
            
            {isOwner && (
              <Link
                href={`/dashboard/properties/edit/${property.property_uuid}`}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            )}
          </div>
        </div>
        
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
          <div className="mt-2 space-y-1">
            <p className="text-gray-600">
              {property.location}
            </p>
            <p className="text-sm text-gray-500">
              {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''} • {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''} • {property.property_type} • ${property.price.toLocaleString()}/month
            </p>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {property.display_image && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <Image
                src={property.display_image}
                alt={property.title}
                width={800}
                height={256}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium capitalize">{property.property_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rental Space</span>
                <span className="font-medium capitalize">{property.rental_space?.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bedrooms</span>
                <span className="font-medium">{property.bedrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bathrooms</span>
                <span className="font-medium">{property.bathrooms}</span>
              </div>
              {property.gross_area_size > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Area</span>
                  <span className="font-medium">{property.gross_area_size} {property.gross_area_size_unit}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Furnished</span>
                <span className="font-medium">{property.furnished ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pets Allowed</span>
                <span className="font-medium">{property.pets_allowed ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                ${property.price.toLocaleString()}
              </div>
              <div className="text-gray-600">per month</div>
            </div>
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <Link
                  href={`/dashboard/properties/edit/${property.property_uuid}`}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit Property</span>
                </Link>
                <Link
                  href={`/dashboard/properties/${property.property_uuid}/incoming-offers`}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span>View Offers</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Map Section */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPinIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Location</h2>
          </div>
          
          {property.location && (
            <div className="mb-4">
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Address:</span> {property.location}
              </p>
            </div>
          )}
          
          <div className="relative">
            <div 
              id="property-map" 
              className="w-full h-96 rounded-lg border border-gray-200 bg-gray-100"
              style={{ minHeight: '384px' }}
            >
              {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Google Maps API key not configured</p>
                    <p className="text-gray-400 text-xs mt-1">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables</p>
                  </div>
                </div>
              ) : mapError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPinIcon className="h-12 w-12 text-red-400 mx-auto mb-2" />
                    <p className="text-red-500 text-sm">Failed to load map</p>
                    <p className="text-gray-400 text-xs mt-1">{mapError}</p>
                  </div>
                </div>
              ) : !mapLoaded ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading map...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Map will appear here</p>
                    <p className="text-gray-400 text-xs mt-1">Initializing Google Maps...</p>
                  </div>
                </div>
              )}
            </div>
            
            {mapLoaded && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
              <div className="absolute top-2 right-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                <p className="text-xs text-gray-500">
                  Click marker for details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
