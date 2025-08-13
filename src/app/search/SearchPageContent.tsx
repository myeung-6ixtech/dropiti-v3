'use client';

import { useState, useEffect, useCallback } from 'react';
import { propertiesAPI } from '@/lib/api-client';
import { useSearchParams, useRouter } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import ModernFilter from '@/components/search/ModernFilter';
import Footer from '@/components/common/Footer';
import { Property } from '@/types';
import { MagnifyingGlassIcon, MapPinIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

// The API returns data in the Property interface format (already transformed)
// So we can use the Property interface directly
export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Add filter panel state
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Update URL when filters change
  const updateURL = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (newFilters.location) params.append('location', newFilters.location);
    if (newFilters.bedrooms) params.append('bedrooms', newFilters.bedrooms);
    if (newFilters.maxPrice) params.append('maxPrice', newFilters.maxPrice);
    
    const newURL = `/search?${params.toString()}`;
    console.log('Search page: Updating URL to:', newURL, 'with filters:', newFilters);
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Initialize filters from URL params when component mounts
  useEffect(() => {
    const urlLocation = searchParams.get('location');
    const urlBedrooms = searchParams.get('bedrooms');
    const urlMaxPrice = searchParams.get('maxPrice');
    
    console.log('Search page: URL params received:', { urlLocation, urlBedrooms, urlMaxPrice });
    
    const newFilters = {
      location: urlLocation || '',
      bedrooms: urlBedrooms || '',
      maxPrice: urlMaxPrice || '',
    };
    
    console.log('Search page: Setting initial filters:', newFilters);
    setFilters(newFilters);
  }, [searchParams]);

  const fetchProperties = useCallback(async () => {
    try {
      // Build API parameters from URL search params and filters
      const apiParams: {
        limit: number;
        offset: number;
        location?: string;
        maxPrice?: number;
        bedrooms?: number;
      } = {
        limit: 50,
        offset: 0,
      };

      // Add filters to API call if they exist
      if (filters.location) {
        apiParams.location = filters.location;
      }
      if (filters.maxPrice) {
        apiParams.maxPrice = parseInt(filters.maxPrice);
      }
      if (filters.bedrooms) {
        apiParams.bedrooms = parseInt(filters.bedrooms);
      }

      console.log('Search page: Fetching properties with API params:', apiParams);
      console.log('Search page: Current filters state:', filters);
      
      const response = await propertiesAPI.getListings(apiParams);
      
      console.log('Search page: API Response received:', response);
      console.log('Search page: Response success:', response.success);
      console.log('Search page: Response data type:', typeof response.data);
      console.log('Search page: Response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      
      if (response.success && response.data) {
        console.log('Search page: Setting filtered properties:', response.data);
        setFilteredProperties(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        console.error('Search page: API returned error:', response.error);
        console.log('Search page: Setting empty array due to API error');
        setFilteredProperties([]);
      }
    } catch (error) {
      console.error('Search page: Failed to fetch properties:', error);
      console.log('Search page: Setting empty array due to fetch error');
      setFilteredProperties([]);
    }
  }, [filters]);

  // Fetch properties from API
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Remove the duplicate filterProperties function since we're now filtering at the API level
  // useEffect(() => {
  //   filterProperties();
  // }, [filters, properties, filterProperties]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      location: '',
      bedrooms: '',
      maxPrice: '',
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const applyFilters = () => {
    // The filtering is now handled by the API call, so this function is no longer needed
    // filterProperties(); 
  };

  // Get search summary for display
  const getSearchSummary = () => {
    const criteria = [];
    if (filters.location) criteria.push(filters.location);
    if (filters.bedrooms) criteria.push(`${filters.bedrooms}+ bedrooms`);
    if (filters.maxPrice) criteria.push(`Under ${parseInt(filters.maxPrice).toLocaleString()} HKD`);
    
    return criteria.length > 0 ? criteria.join(' • ') : 'All properties';
  };

  // if (loading) { // Removed loading state
  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
  //         <div className="animate-pulse">
  //           <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
  //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //             {[...Array(6)].map((_, i) => (
  //               <div key={i} className="bg-white rounded-lg shadow-sm p-6">
  //                 <div className="h-48 bg-gray-200 rounded mb-4"></div>
  //                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  //                 <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
  //                 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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

        {/* Search Summary - Show current search criteria */}
        {(filters.location || filters.bedrooms || filters.maxPrice) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-blue-700">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  <span className="font-medium">Search Results for:</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-blue-600">
                  {filters.location && (
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{filters.location}</span>
                    </div>
                  )}
                  {filters.bedrooms && (
                    <div className="flex items-center space-x-1">
                      <HomeIcon className="h-4 w-4" />
                      <span>{filters.bedrooms}+ bedrooms</span>
                    </div>
                  )}
                  {filters.maxPrice && (
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span>Under {parseInt(filters.maxPrice).toLocaleString()} HKD</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
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
                  {getSearchSummary()}
                </p>
              </div>
              
              {/* Filter Button moved to top right */}
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="btn-outline-md"
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
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear all filters
                </button>
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
