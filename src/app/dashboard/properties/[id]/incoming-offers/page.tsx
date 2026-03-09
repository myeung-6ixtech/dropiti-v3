'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import IncomingOffers from '@/components/common/IncomingOffers';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import { IncomingOffersHeader } from './_components/incoming-offers-header';
import { PropertyErrorState } from '../../[id]/_components/property-error-state';

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
    return <PropertyErrorState error={error} />;
  }

  if (!authUser?.id) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <IncomingOffersHeader property={property} />

      {/* Incoming Offers Component */}
      <IncomingOffers
        recipientUserId={authUser.id}
        propertyUuid={property.property_uuid}
        title={`Offers for ${property.title}`}
        showPropertyInfo={false}
      />
    </div>
  );
}
