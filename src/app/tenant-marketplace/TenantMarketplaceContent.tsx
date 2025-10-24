'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { tenantsAPI } from '@/lib/api-client';

import TenantProfileCard from '@/components/tenant-profile/TenantProfileCard';
import TenantMarketplaceFilter from '@/components/tenant-marketplace/TenantMarketplaceFilter';
import TenantFilterTags from '@/components/tenant-marketplace/TenantFilterTags';
import Footer from '@/components/common/Footer';
import { TenantProfileCardSkeletonGrid } from '@/components/skeleton';
import { TenantProfileData } from '@/types/tenant';

interface TenantProfileWithUser extends TenantProfileData {
  user?: {
    firebase_uid: string;
    display_name?: string;
    name?: string;
    photo_url?: string;
    avatar?: string;
    email?: string;
    rating?: number;
    review_count?: number;
  } | null;
}

export default function TenantMarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuth();
  
  const [tenantProfiles, setTenantProfiles] = useState<TenantProfileWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    budget_min: searchParams.get('budget_min') || '',
    budget_max: searchParams.get('budget_max') || '',
    location: searchParams.get('location') || '',
    move_in_date: searchParams.get('move_in_date') || '',
    property_type: searchParams.get('property_type') || '',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Calculate pagination values
  const totalPages = Math.ceil(tenantProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProfiles = tenantProfiles.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (newFilters.budget_min) params.append('budget_min', newFilters.budget_min);
    if (newFilters.budget_max) params.append('budget_max', newFilters.budget_max);
    if (newFilters.location) params.append('location', newFilters.location);
    if (newFilters.move_in_date) params.append('move_in_date', newFilters.move_in_date);
    if (newFilters.property_type) params.append('property_type', newFilters.property_type);
    
    const newURL = `/tenant-marketplace?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Initialize filters from URL params when component mounts
  useEffect(() => {
    const urlBudgetMin = searchParams.get('budget_min');
    const urlBudgetMax = searchParams.get('budget_max');
    const urlLocation = searchParams.get('location');
    const urlMoveInDate = searchParams.get('move_in_date');
    const urlPropertyType = searchParams.get('property_type');
    
    const newFilters = {
      budget_min: urlBudgetMin || '',
      budget_max: urlBudgetMax || '',
      location: urlLocation || '',
      move_in_date: urlMoveInDate || '',
      property_type: urlPropertyType || '',
    };
    
    setFilters(newFilters);
  }, [searchParams]);

  const fetchTenantProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        limit: 100,
        offset: 0,
        ...(filters.budget_min && { budget_min: filters.budget_min }),
        ...(filters.budget_max && { budget_max: filters.budget_max }),
        ...(filters.location && { location: filters.location }),
        ...(filters.move_in_date && { move_in_date: filters.move_in_date }),
        ...(filters.property_type && { property_type: filters.property_type }),
      };
      console.log('[TenantMarketplace Client] Fetching with params:', params);
      const result = await tenantsAPI.getTenantProfiles(params);
      console.log('[TenantMarketplace Client] API result:', result);
      
      if (result.success && result.data) {
        if (Array.isArray(result.data) && result.data.length > 0) {
          console.log('[TenantMarketplace Client] First result snapshot:', {
            tenant_uuid: result.data[0]?.tenant_uuid,
            user_firebase_uid: result.data[0]?.user_firebase_uid,
            user: result.data[0]?.user ? {
              firebase_uid: result.data[0]?.user?.firebase_uid,
              display_name: result.data[0]?.user?.display_name,
              name: result.data[0]?.user?.name,
              avatar: result.data[0]?.user?.avatar,
              photo_url: result.data[0]?.user?.photo_url,
            } : null,
          });
        }
        setTenantProfiles(result.data);
      } else {
        console.error('Failed to fetch tenant profiles:', result.error);
        setTenantProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching tenant profiles:', error);
      setTenantProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch tenant profiles from API
  useEffect(() => {
    fetchTenantProfiles();
  }, [fetchTenantProfiles]);

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
      budget_min: '',
      budget_max: '',
      location: '',
      move_in_date: '',
      property_type: '',
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const removeFilter = (key: string) => {
    if (key === 'budget') {
      // Remove both budget filters
      const newFilters = {
        ...filters,
        budget_min: '',
        budget_max: '',
      };
      setFilters(newFilters);
      updateURL(newFilters);
    } else {
      const newFilters = {
        ...filters,
        [key]: '',
      };
      setFilters(newFilters);
      updateURL(newFilters);
    }
  };

  const applyFilters = () => {
    // Filtering is handled by the API call
  };

  // Pagination navigation functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
    if (filters.budget_min && filters.budget_max) {
      criteria.push(`Budget: ${parseInt(filters.budget_min).toLocaleString()} - ${parseInt(filters.budget_max).toLocaleString()} HKD`);
    } else if (filters.budget_min) {
      criteria.push(`Min Budget: ${parseInt(filters.budget_min).toLocaleString()} HKD`);
    } else if (filters.budget_max) {
      criteria.push(`Max Budget: ${parseInt(filters.budget_max).toLocaleString()} HKD`);
    }
    if (filters.location) criteria.push(`Location: ${filters.location}`);
    if (filters.move_in_date) criteria.push(`Move-in: ${filters.move_in_date}`);
    if (filters.property_type) criteria.push(`Type: ${filters.property_type}`);
    
    return criteria.length > 0 ? criteria.join(' • ') : 'All tenant profiles';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tenant Marketplace
          </h1>
          <p className="text-gray-600">
            Discover qualified tenants looking for rental properties
          </p>
        </div>

        {/* Filter Tags */}
        <TenantFilterTags
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearAll={clearFilters}
        />

        {/* Filters and Results */}
        <div className="w-full">
          <div className="w-full">
            {/* Results Header with Filter Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-0">
                  {isLoading ? (
                    <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                  ) : (
                    `${tenantProfiles.length} Tenant Profiles Found`
                  )}
                </h2>
                <p className="text-gray-600">
                  {getSearchSummary()}
                </p>
                {!isLoading && tenantProfiles.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Showing {startIndex + 1}-{Math.min(endIndex, tenantProfiles.length)} of {tenantProfiles.length} profiles
                  </p>
                )}
              </div>
              
              {/* Filter Button */}
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

            {/* Authentication Notice */}
            {!isAuthenticated && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Sign in to contact tenants</h3>
                    <p className="text-sm text-blue-700">Create an account to message tenants and share your properties</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tenant Profiles Grid */}
            {isLoading ? (
              <TenantProfileCardSkeletonGrid count={12} />
            ) : tenantProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedProfiles.map((profile) => (
                  <TenantProfileCard
                    key={profile.tenant_uuid}
                    data={profile}
                    user={profile.user}
                    currentUserId={currentUser?.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tenant profiles found</h3>
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
            {tenantProfiles.length > itemsPerPage && (
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
                      const shouldShow = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      
                      if (!shouldShow) {
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

      {/* Filter Overlay */}
      <TenantMarketplaceFilter
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
