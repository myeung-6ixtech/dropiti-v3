'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import PropertyCard from '@/components/PropertyCard';
import ModernFilter from '@/components/search/ModernFilter';
import FilterTags from '@/components/search/FilterTags';
import ViewModeToggle, { ViewMode } from '@/components/search/ViewModeToggle';
import SearchMapView from '@/components/search/SearchMapView';
import Footer from '@/components/common/Footer';
import { PropertyCardSkeletonGrid } from '@/components/common/PropertyCardSkeleton';
import PullToRefreshWrapper from '@/components/common/PullToRefreshWrapper';
import { Property } from '@/types';
import { propertyCardClasses } from '@/styles/property-card';
import {
  applyLocationFilter,
  buildListingsQueryParams,
  fetchPublishedListings,
  LISTINGS_MAP_FETCH_LIMIT,
  LISTINGS_PAGE_SIZE,
  MAP_LISTINGS_PAGE_SIZE,
  type SearchFilters,
} from '@/lib/listings';
import { getListingKey } from '@/lib/normalize-listing';
import { useMapViewportListings } from '@/hooks/useMapViewportListings';
import { formatFilterPrice } from '@/lib/format-filter-price';
import SearchPagePlaceholder from './SearchPagePlaceholder';

export default function SearchPageContent({
  initialData,
  initialFilters,
}: {
  initialData?: { properties: Property[]; totalCount: number };
  initialFilters: SearchFilters;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [properties, setProperties] = useState<Property[]>(initialData?.properties ?? []);
  /** Full match set when list mode + location filter requires a bulk fetch. */
  const [bulkMatches, setBulkMatches] = useState<Property[]>(initialData?.properties ?? []);
  const [totalCount, setTotalCount] = useState(initialData?.totalCount ?? 0);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    setHasMounted(true);
    const mq = window.matchMedia('(min-width: 1024px)');
    setViewMode(mq.matches ? 'map' : 'list');

    const onChange = (event: MediaQueryListEvent) => {
      setViewMode(event.matches ? 'map' : 'list');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const [filters, setFilters] = useState(initialFilters);

  const [currentPage, setCurrentPage] = useState(1);

  const isMapMode = viewMode === 'map';
  const hasLocationFilter = Boolean(filters.location?.trim());
  /** List mode with text location filter — bulk fetch then paginate client-side. */
  const needsBulkFetch = hasLocationFilter && !isMapMode;

  const viewport = useMapViewportListings(filters, isMapMode);

  const totalPages = Math.max(1, Math.ceil(totalCount / LISTINGS_PAGE_SIZE));
  const startIndex = (currentPage - 1) * LISTINGS_PAGE_SIZE;
  const endIndex = Math.min(startIndex + LISTINGS_PAGE_SIZE, totalCount);

  const updateURL = useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams();
      if (newFilters.location) params.append('location', newFilters.location);
      if (newFilters.bedrooms) params.append('bedrooms', newFilters.bedrooms);
      if (newFilters.maxPrice) params.append('maxPrice', newFilters.maxPrice);

      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    setFilters({
      location: searchParams.get('location') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    });
  }, [searchParams]);

  const fetchProperties = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const paging = needsBulkFetch
          ? { limit: LISTINGS_MAP_FETCH_LIMIT, offset: 0 }
          : {
              limit: LISTINGS_PAGE_SIZE,
              offset: (page - 1) * LISTINGS_PAGE_SIZE,
            };

        const result = await fetchPublishedListings(
          buildListingsQueryParams(filters, paging),
        );

        if (!result.success) {
          setProperties([]);
          setBulkMatches([]);
          setTotalCount(0);
          return;
        }

        const matched = applyLocationFilter(
          result.properties,
          filters.location,
          Boolean(filters.location?.trim()),
        );

        if (needsBulkFetch) {
          setBulkMatches(matched);
          setTotalCount(matched.length);
        } else {
          setBulkMatches([]);
          setProperties(matched);
          setTotalCount(result.pagination?.total ?? matched.length);
        }
      } catch (error) {
        console.error('Search page: Failed to fetch properties:', error);
        setProperties([]);
        setBulkMatches([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, needsBulkFetch],
  );

  const refreshListings = useCallback(() => {
    return fetchProperties(needsBulkFetch ? 1 : currentPage);
  }, [fetchProperties, currentPage, needsBulkFetch]);

  const serverListPage = needsBulkFetch ? null : currentPage;

  useEffect(() => {
    if (isMapMode) return;

    const hasFilters = Boolean(filters.location || filters.bedrooms || filters.maxPrice);
    const hasUsablePrefetch =
      initialData != null &&
      initialData.properties.length > 0 &&
      !hasFilters &&
      !needsBulkFetch;
    if (hasUsablePrefetch) {
      return;
    }
    fetchProperties(needsBulkFetch ? 1 : currentPage);
  }, [fetchProperties, filters, needsBulkFetch, serverListPage, initialData, isMapMode, currentPage]);

  // Client-side list pagination over bulk fetch (map / location filter)
  useEffect(() => {
    if (!needsBulkFetch || viewMode !== 'list') return;
    setProperties(
      bulkMatches.slice(startIndex, startIndex + LISTINGS_PAGE_SIZE),
    );
  }, [needsBulkFetch, viewMode, bulkMatches, startIndex]);

  const handleFilterChange = (key: string, value: string) => {
    setCurrentPage(1);
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    setCurrentPage(1);
    const newFilters = { location: '', bedrooms: '', maxPrice: '' };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const removeFilter = (key: string) => {
    setCurrentPage(1);
    const newFilters = { ...filters, [key]: '' };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleViewModeToggle = (mode: ViewMode) => {
    setCurrentPage(1);
    setViewMode(mode);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getSearchSummary = () => {
    const criteria = [];
    if (filters.location) criteria.push(filters.location);
    if (filters.bedrooms) {
      const bedroomText =
        filters.bedrooms === '5'
          ? '5+ bedrooms'
          : `${filters.bedrooms} bedroom${filters.bedrooms === '1' ? '' : 's'}`;
      criteria.push(bedroomText);
    }
    if (filters.maxPrice) {
      criteria.push(`Under ${formatFilterPrice(filters.maxPrice)} HKD`);
    }
    return criteria.length > 0 ? criteria.join(' • ') : 'All properties';
  };

  if (!hasMounted) {
    return <SearchPagePlaceholder />;
  }

  const mapList = viewport.properties;
  const mapIsInitialLoad = viewport.isInitialLoad && mapList.length === 0;
  const displayCount = isMapMode ? viewport.totalCount : totalCount;
  const displayLoading = isMapMode ? mapIsInitialLoad : isLoading;
  const mapStartIndex =
    viewport.totalCount === 0 ? 0 : (viewport.currentPage - 1) * MAP_LISTINGS_PAGE_SIZE + 1;
  const mapEndIndex = Math.min(
    viewport.currentPage * MAP_LISTINGS_PAGE_SIZE,
    viewport.totalCount,
  );

  const titleBlock = (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-0">
        {displayLoading ? (
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        ) : (
          `${displayCount} Properties Found`
        )}
      </h2>
      <p className="text-gray-600 mb-0">{getSearchSummary()}</p>
      {!isMapMode && !isLoading && totalCount > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          Showing {startIndex + 1}-{endIndex} of {totalCount} properties
        </p>
      )}
      {isMapMode && !displayLoading && viewport.totalCount > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          Showing {mapStartIndex}-{mapEndIndex} of {viewport.totalCount} in this map area
        </p>
      )}
    </div>
  );

  const filterButton = (
    <button
      onClick={() => setIsFilterOpen(true)}
      className="inline-flex items-center px-4 py-2 border border-black text-gray-900 font-semibold rounded-lg hover:bg-black hover:text-white transition-all duration-200 shrink-0"
    >
      <svg
        className="h-4 w-4 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
        />
      </svg>
      Filter
    </button>
  );

  const viewToggleAndFilter = (
    <div className="flex items-center gap-3 shrink-0">
      <ViewModeToggle
        viewMode={viewMode}
        onToggle={handleViewModeToggle}
        className="w-auto shrink-0 flex justify-end"
      />
      {filterButton}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div
        className={
          isMapMode
            ? 'w-full px-0 lg:px-4 py-0 lg:py-4'
            : 'max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8'
        }
      >
        {/* Map mobile: title + view toggle */}
        {isMapMode && (
          <div className="px-4 pt-3 pb-3 border-b border-gray-100 bg-white lg:hidden">
            <div className="mb-3">{titleBlock}</div>
            <ViewModeToggle viewMode={viewMode} onToggle={handleViewModeToggle} />
          </div>
        )}

        <div className={isMapMode ? 'hidden lg:block' : ''}>
          <FilterTags
            filters={filters}
            onRemoveFilter={removeFilter}
            onClearAll={clearFilters}
          />
        </div>

        <div className="w-full">
          <div className="w-full">
            {/* Title + view toggle + filter (list: all sizes; map: desktop only) */}
            <div
              className={`flex items-start justify-between mb-6 ${isMapMode ? 'hidden lg:flex lg:mb-4' : ''}`}
            >
              {titleBlock}
              {viewToggleAndFilter}
            </div>

            {isMapMode && (
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden fixed top-[84px] right-4 z-40 flex items-center gap-1.5 px-3 py-2 bg-white rounded-full shadow-lg border border-gray-200 text-sm font-medium text-gray-900"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                  />
                </svg>
                Filter
              </button>
            )}

            {isMapMode ? (
              <SearchMapView
                properties={mapList}
                currentPage={viewport.currentPage}
                totalPages={viewport.totalPages}
                totalCount={viewport.totalCount}
                pageSize={MAP_LISTINGS_PAGE_SIZE}
                isViewportLoading={mapIsInitialLoad}
                isViewportRefreshing={viewport.isRefreshing}
                viewportError={viewport.error}
                onPageChange={viewport.goToPage}
                onBoundsChange={viewport.onBoundsChange}
                fitBoundsKey={`${viewport.fitBoundsKey}|map-page:${viewport.currentPage}`}
              />
            ) : isLoading ? (
              <PropertyCardSkeletonGrid count={LISTINGS_PAGE_SIZE} />
            ) : totalCount > 0 ? (
                <PullToRefreshWrapper onRefresh={refreshListings}>
                  <div className={propertyCardClasses.grid.search}>
                    {properties.map((property, index) => {
                      const propertyForCard = {
                        ...property,
                        property_uuid: property.property_uuid || property.id,
                      };

                      return (
                        <PropertyCard
                          key={getListingKey(property, index)}
                          property={propertyForCard}
                          onViewDetails={(uuid) => {
                            router.push(`/property/${uuid}`);
                          }}
                        />
                      );
                    })}
                  </div>

                  {totalCount > LISTINGS_PAGE_SIZE && (
                    <div className="mt-12 flex items-center justify-center">
                      <nav
                        className="flex items-center space-x-2"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === 1
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>

                        <div className="flex items-center space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                            (page) => {
                              const shouldShow =
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1);

                              if (!shouldShow) {
                                if (
                                  page === currentPage - 2 ||
                                  page === currentPage + 2
                                ) {
                                  return (
                                    <span
                                      key={page}
                                      className="px-3 py-2 text-gray-400"
                                    >
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
                            },
                          )}
                        </div>

                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === totalPages
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
                </PullToRefreshWrapper>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No properties found
                </h3>
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

      <ModernFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={() => {}}
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(false)}
      />

      {!isMapMode && <Footer />}
    </div>
  );
}
