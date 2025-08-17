'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import InlineEditPropertyView from '@/components/dashboard/InlineEditPropertyView';
import { useState, useEffect, useCallback } from 'react';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
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
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Property Not Found</h2>
            <p className="text-yellow-700 mb-4">The property you're looking for could not be found.</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InlineEditPropertyView
      propertyId={params.id as string}
      onSave={handleSave}
    />
  );
}
