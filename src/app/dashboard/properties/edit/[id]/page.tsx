'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import InlineEditPropertyView from '@/components/dashboard/InlineEditPropertyView';
import { useState, useEffect, useCallback } from 'react';
import { EditPropertyLoading } from './_components/edit-property-loading';
import { EditPropertyError } from './_components/edit-property-error';

export default function EditPropertyPage() {
  const params = useParams();
  const { user: authUser } = useAuth();
  const [property, setProperty] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await propertiesAPI.getPropertyByUuid(params.id as string);
      
      if (response.success && response.data?.property) {
        const propertyData = response.data.property;
        
        // Check if the current user owns this property
        if (authUser?.id && propertyData.owner_id !== authUser.id) {
          setError('You do not have permission to edit this property');
          return;
        }
        
        setProperty(propertyData);
      } else {
        setError('Failed to fetch property data');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to fetch property data');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, authUser?.id]);

  useEffect(() => {
    if (params.id) {
      fetchProperty();
    }
  }, [params.id, fetchProperty]);

  const handleSave = () => {
    // Property has been saved successfully - stay on edit page
    // No redirect needed - user can continue editing
  };



  if (isLoading) {
    return <EditPropertyLoading />;
  }

  if (error) {
    return <EditPropertyError error={error} />;
  }

  if (!property) {
    return <EditPropertyError error="The property you're looking for could not be found." type="not-found" />;
  }

  return (
    <InlineEditPropertyView
      propertyId={params.id as string}
      onSave={handleSave}
    />
  );
}
