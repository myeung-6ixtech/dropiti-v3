'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import Link from 'next/link';

interface Property {
  id: string;
  property_uuid: string;
  title: string;
  description: string;
  location: string;
  address: string;
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
          const propertyData = response.data.property;
          setProperty({
            id: propertyData.id,
            property_uuid: propertyData.property_uuid,
            title: propertyData.title,
            description: propertyData.description,
            location: propertyData.location,
            address: propertyData.address,
            price: propertyData.price,
            property_type: propertyData.details?.type || propertyData.type || 'Unknown',
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
            is_public: propertyData.is_public || false,
            status: propertyData.status || (propertyData.is_public ? 'published' : 'draft'),
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
              <img
                src={property.display_image}
                alt={property.title}
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
    </div>
  );
}
