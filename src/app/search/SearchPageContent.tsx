'use client';

import { useState, useEffect, useCallback } from 'react';
import { propertiesAPI } from '@/lib/api-client';
import { useSearchParams, useRouter } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import ModernFilter from '@/components/search/ModernFilter';
import Footer from '@/components/common/Footer';
import { Property } from '@/types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// The API returns data in the Property interface format (already transformed)
// So we can use the Property interface directly
export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Add filter panel state
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getListings({
        limit: 50, // Adjust based on your needs
        offset: 0,
        location: filters.location || undefined,
        minPrice: undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
      });
      
      if (response.success) {
        console.log(response.data);
        setProperties(response.data);
        setFilteredProperties(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      // Fallback to empty array or show error message
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch properties from API
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filterProperties = useCallback(() => {
    let filtered = [...properties];

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by bedrooms
    if (filters.bedrooms) {
      filtered = filtered.filter(property =>
        property.bedrooms >= parseInt(filters.bedrooms)
      );
    }

    // Filter by max price
    if (filters.maxPrice) {
      filtered = filtered.filter(property =>
        property.price <= parseInt(filters.maxPrice)
      );
    }

    setFilteredProperties(filtered);
  }, [filters, properties]);

  useEffect(() => {
    filterProperties();
  }, [filters, properties, filterProperties]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      bedrooms: '',
      maxPrice: '',
    });
  };

  const applyFilters = () => {
    filterProperties();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Home
          </h1>
          <p className="text-gray-600">
            Discover amazing properties in your preferred location
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Filters and Results */}
        <div className="w-full">
          {/* Results - Full width since filter is now an overlay */}
          <div className="w-full">
            {/* Results Header with Filter Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredProperties.length} Properties Found
                </h2>
                <p className="text-gray-600">
                  Showing results for your search criteria
                </p>
              </div>
              
              {/* Filter Button moved to top right */}
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filter
              </button>
            </div>

            {/* Properties Grid */}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => {    
                  // The API already transforms the data, so we can use it directly
                  // Just ensure we have the property_uuid for navigation
                  const propertyForCard = {
                    ...property,
                    // Ensure property_uuid is available for navigation
                    property_uuid: property.property_uuid || property.id,
                  };
                  
                  // Debug: Log the final property data
                  console.log('Final propertyForCard:', propertyForCard);
                  
                  return (
                    <PropertyCard
                      key={property.id}
                      property={propertyForCard}
                      onViewDetails={(uuid) => {
                        // Handle navigation to property detail page using property_uuid
                        router.push(`/property/${uuid}`);
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ModernFilter Overlay - Doesn't affect main layout */}
      <ModernFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={applyFilters}
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
