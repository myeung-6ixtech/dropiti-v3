'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import PropertyCard from '@/components/PropertyCard';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import Link from 'next/link';
import { Property } from '@/types';
import { propertyCardClasses } from '@/styles/property-card';

export default function PropertiesPage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user's properties
  useEffect(() => {
    const fetchProperties = async () => {
      if (!isAuthenticated || !authUser?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching properties for user:', authUser.id);
        
        // Fetch properties for the current user
        const response = await propertiesAPI.getListings({
          limit: 50, // Get up to 50 properties
          landlord_firebase_uid: authUser.id, // Filter by current user's Firebase UID
        });

        console.log('Properties API response:', response);

        if (response.success && response.data) {
          // The API already transforms the data to match the Property interface
          setProperties(response.data);
          console.log('Properties set:', response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch properties');
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [isAuthenticated, authUser?.id]);

  // Filter properties based on search term
  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.details?.type as string)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-0">Properties</h1>
            <p className="text-gray-600 mt-1">Manage your property listings</p>
          </div>
          <Link href="/dashboard/add-property" className="btn-primary flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <button className="btn-outline-md">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <CenteredLoadingSpinner />
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Properties</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredProperties.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md">
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Properties Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No properties match your search criteria.' : "You haven't added any properties yet."}
              </p>
              {!searchTerm && (
                <Link
                  href="/dashboard/add-property"
                  className="btn-primary inline-flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {!isLoading && !error && filteredProperties.length > 0 && (
        <div className="flex-1 overflow-auto p-6">
          <div className={propertyCardClasses.grid.default}>
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isDashboard={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
