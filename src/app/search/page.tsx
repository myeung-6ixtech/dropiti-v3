'use client';

import { useState, useEffect, useCallback } from 'react';
import { propertiesAPI } from '@/lib/api-client';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import ModernFilter from '@/components/search/ModernFilter';
import Footer from '@/components/common/Footer';
import { Property } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1180px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header with Filter Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Search Properties</h1>
            <p className="mt-2 text-lg text-gray-600">
              {loading 
                ? "Loading properties..." 
                : `Found ${filteredProperties.length} properties matching your criteria`
              }
            </p>
          </div>
          
          {/* Modern Filter Button */}
          <ModernFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            onApplyFilters={applyFilters}
          />
        </div>

        {/* Properties Grid - 3 columns */}
        {loading ? (
          // Skeleton loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                {/* Image skeleton */}
                <div className="h-48 w-full bg-gray-200"></div>
                
                {/* Content skeleton */}
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  
                  {/* Features skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                  
                  {/* Price skeleton */}
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  
                  {/* Button skeleton */}
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="animate-fade-in">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-gray-500">
              {properties.length === 0 
                ? "No properties are available at the moment. Please check back later."
                : "Try adjusting your search criteria or clear the filters."
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
