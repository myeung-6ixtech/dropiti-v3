'use client';

import { useState, useEffect, useCallback } from 'react';
import { propertiesAPI } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';

import PropertyCard from '@/components/PropertyCard';
import ModernFilter from '@/components/search/ModernFilter';
import FilterTags from '@/components/search/FilterTags';
import Footer from '@/components/common/Footer';
import { PropertyCardSkeletonGrid } from '@/components/common/PropertyCardSkeleton';
import { Property } from '@/types';
import { propertyCardClasses } from '@/styles/property-card';

// The API returns data in the Property interface format (already transformed)
// So we can use the Property interface directly
export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Add filter panel state
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
    setIsLoading(true);
    try {
      // Simple approach: fetch all listings and filter client-side
      const apiParams = {
        limit: 100, // Fetch more properties for better filtering
        offset: 0,
      };

      console.log('Search page: Fetching all properties for client-side filtering');
      
      const response = await propertiesAPI.getListings(apiParams);
      
      if (response.success && response.data) {
        let allProperties = Array.isArray(response.data) ? response.data : [response.data];
        
        // Simple client-side filtering: check if location contains the search term
        if (filters.location && filters.location.trim()) {
          const searchTerm = filters.location.toLowerCase().trim();
          console.log('Search page: Filtering properties for location:', searchTerm);
          
          allProperties = allProperties.filter((property: { location?: string; title?: string }) => {
            const location = (property.location || '').toLowerCase();
            const matches = location.includes(searchTerm);
            
            if (!matches) {
              console.log('Search page: Filtered out property:', {
                title: property.title,
                location: property.location,
                reason: 'Location does not contain search term'
              });
            }
            
            return matches;
          });
          
          console.log('Search page: After filtering, properties count:', allProperties.length);
        }
        
        setFilteredProperties(allProperties);
      } else {
        console.error('Search page: API returned error:', response.error);
        setFilteredProperties([]);
      }
    } catch (error) {
      console.error('Search page: Failed to fetch properties:', error);
      setFilteredProperties([]);
    } finally {
      setIsLoading(false);
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

  const removeFilter = (key: string) => {
    const newFilters = {
      ...filters,
      [key]: '',
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const applyFilters = () => {
    // The filtering is now handled by the API call, so this function is no longer needed
    // filterProperties(); 
  };

  // Pagination navigation functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of results when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  // Get search summary for display
  const getSearchSummary = () => {
    const criteria = [];
    if (filters.location) criteria.push(filters.location);
    if (filters.bedrooms) criteria.push(`${filters.bedrooms}+ bedrooms`);
    if (filters.maxPrice) criteria.push(`Under ${parseInt(filters.maxPrice).toLocaleString()} HKD`);
    
    return criteria.length > 0 ? criteria.join(' • ') : 'All properties';
  };

  return (
    <div className="min-h-screen bg-white">
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

        {/* Filter Tags - Modern filter display */}
        <FilterTags
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearAll={clearFilters}
        />

        {/* Filters and Results */}
        <div className="w-full">
          {/* Results - Full width since filter is now an overlay */}
          <div className="w-full">
            {/* Results Header with Filter Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-0">
                  {isLoading ? (
                    <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                  ) : (
                    `${filteredProperties.length} Properties Found`
                  )}
                </h2>
                <p className="text-gray-600">
                  {getSearchSummary()}
                </p>
                {!isLoading && filteredProperties.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
                  </p>
                )}
              </div>
              
              {/* Filter Button moved to top right */}
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-black text-gray-900 font-semibold rounded-lg hover:bg-black hover:text-white transition-all duration-200"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filter
              </button>
            </div>

            {/* Properties Grid */}
            {isLoading ? (
              <PropertyCardSkeletonGrid count={12} />
            ) : filteredProperties.length > 0 ? (
              <div className={propertyCardClasses.grid.search}>
                {paginatedProperties.map((property) => {    
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

            {/* Pagination */}
            {filteredProperties.length > itemsPerPage && (
              <div className="mt-12 flex items-center justify-center">
                <nav className="flex items-center space-x-2" aria-label="Pagination">
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      const shouldShow = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      
                      if (!shouldShow) {
                        // Show ellipsis for gaps
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-3 py-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
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
