'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import IncomingOffers from '@/components/common/IncomingOffers';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';

interface Property {
  id: string;
  property_uuid: string;
  title: string;
  location: string; // Changed from address to location
  price: number; // Changed from rental_price to price
  property_type: string;
  bedrooms: number; // Added bedrooms
  bathrooms: number; // Added bathrooms
}

export default function IncomingOffersPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const propertyUuid = Array.isArray(params.id) ? params.id[0] : params.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyUuid) {
        setError('Property ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching property details for:', propertyUuid);
        
        const response = await propertiesAPI.getPropertyByUuid(propertyUuid);
        
        if (response.success && response.data?.property) {
          // Extract property data from the nested response
          const propertyData = response.data.property;
          setProperty({
            id: propertyData.id,
            property_uuid: propertyData.property_uuid,
            title: propertyData.title,
            location: propertyData.location,
            price: propertyData.price,
            property_type: propertyData.details?.type || propertyData.type || 'Unknown',
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>
        
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Incoming Offers</h1>
          <div className="mt-2 space-y-1">
            <p className="text-gray-600">
              {property.title} • {property.location}
            </p>
            <p className="text-sm text-gray-500">
              {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''} • {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''} • {property.property_type} • ${property.price.toLocaleString()}/month
            </p>
          </div>
        </div>
      </div>

      {/* Incoming Offers Component */}
      <IncomingOffers
        recipientFirebaseUid={authUser.id}
        propertyUuid={property.property_uuid}
        title={`Offers for ${property.title}`}
        showPropertyInfo={false} // Don't show property info since it's already in the header
      />
    </div>
  );
}
