'use client';

import { useState, useEffect, useCallback } from 'react';
import { propertiesAPI } from '@/lib/api-client';
import { useSearchParams, useRouter } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import ModernFilter from '@/components/search/ModernFilter';
import Footer from '@/components/common/Footer';
import { Property } from '@/types';

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Home
          </h1>
          <p className="text-gray-600">
            Discover amazing properties in your preferred location
          </p>
        </div>

        {/* Filters and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ModernFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              onApplyFilters={applyFilters}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredProperties.length} Properties Found
                </h2>
                <p className="text-gray-600">
                  Showing results for your search criteria
                </p>
              </div>
            </div>

            {/* Properties Grid */}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onViewDetails={(id) => {
                      // Handle navigation to property detail page
                      router.push(`/property/${id}`);
                    }}
                  />
                ))}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
