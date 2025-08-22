'use client';

import { useState, useEffect } from 'react';
import { HomeIcon } from '@heroicons/react/24/outline';
import { propertiesAPI } from '@/lib/api-client';
import PropertyCard from '@/components/PropertyCard';
import { Property } from '@/types';

interface UserListingsProps {
  userFirebaseUid: string;
}

interface ApiProperty {
  id: string;
  property_uuid: string;
  title: string;
  description: string;
  location: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  imageUrl?: string;
  details?: {
    type: string;
    furnished: string;
    petsAllowed: boolean;
    parking: boolean;
  };
  amenities?: string[];
  availableDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserListings({ userFirebaseUid }: UserListingsProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await propertiesAPI.getListings({
          landlord_firebase_uid: userFirebaseUid,
          limit: 20,
          offset: 0
        });
        
        if (response.success && response.data) {
          console.log('API Response data:', response.data);
          
          // Transform API property data to match Property interface
          const transformedProperties: Property[] = (response.data as ApiProperty[]).map((apiProperty) => {
            console.log('Processing API property:', apiProperty);
            
            const transformed = {
              id: apiProperty.id,
              property_uuid: apiProperty.property_uuid,
              title: apiProperty.title,
              description: apiProperty.description,
              location: apiProperty.location,
              price: apiProperty.price || 0,
              bedrooms: apiProperty.bedrooms || 0,
              bathrooms: apiProperty.bathrooms || 0,
              imageUrl: apiProperty.imageUrl || '',
              details: apiProperty.details || {},
              rules: [],
              amenities: apiProperty.amenities || [],
              minimumLease: 12,
              availableDate: apiProperty.availableDate || null,
              createdAt: apiProperty.createdAt || '',
              updatedAt: apiProperty.updatedAt || '',
              ownerId: userFirebaseUid
            };
            
            console.log('Transformed property:', transformed);
            return transformed;
          });
          
          setProperties(transformedProperties);
        } else {
          setError(response.error || 'Failed to load properties');
        }
      } catch (error) {
        console.error('Failed to fetch user properties:', error);
        setError('Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };

    if (userFirebaseUid) {
      fetchUserProperties();
    }
  }, [userFirebaseUid]);

  // Transform property data for PropertyCard component
  const transformPropertyForCard = (property: Property) => {
    const transformed = {
      ...property,
      // PropertyCard expects these specific field names
      rental_price: property.price,
      num_bedroom: property.bedrooms,
      num_bathroom: property.bathrooms,
      display_image: property.imageUrl,
      // Add property_type if available
      property_type: property.details?.type || 'residential'
    };
    
    console.log('PropertyCard transformation:', {
      original: property,
      transformed: transformed
    });
    
    return transformed;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <HomeIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Current Listings</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <HomeIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Current Listings</h2>
        </div>
        <div className="text-center py-8 text-red-500">
          <HomeIcon className="h-12 w-12 mx-auto mb-4 text-red-300" />
          <p className="text-lg font-medium">Error loading properties</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <HomeIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Current Listings</h2>
          <span className="text-sm text-gray-500">({properties.length})</span>
        </div>
        
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={transformPropertyForCard(property)}
                isDashboard={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HomeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No properties listed yet</p>
            <p className="text-sm">This user hasn't listed any properties for rent.</p>
          </div>
        )}
      </div>
    </>
  );
}
