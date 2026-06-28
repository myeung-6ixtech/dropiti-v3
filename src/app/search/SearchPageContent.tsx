'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  buildListingsQueryParams,
  fetchPublishedListings,
  LISTINGS_PAGE_SIZE,
  MAP_LISTINGS_PAGE_SIZE,
  type MapBounds,
  type SearchFilters,
} from '@/lib/listings';
import { getListingKey } from '@/lib/normalize-listing';
import { useMapViewportListings } from '@/hooks/useMapViewportListings';
import { formatFilterPrice } from '@/lib/format-filter-price';
import { resolveSearchLocationBounds } from '@/lib/resolve-search-location-bounds';
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
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  const [currentPage, setCurrentPage] = useState(1);

  const pendingMapApplyRef = useRef<'region' | 'viewport' | null>(null);
  const pendingRegionBoundsRef = useRef<MapBounds | null>(null);
  const locationAppliedRef = useRef<string | null>(null);
  const prefetchConsumedRef = useRef(false);

  const isMapMode = viewMode === 'map';

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
    const next: SearchFilters = {
      location: searchParams.get('location') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    };
    setFilters(next);
    setDraftFilters(next);
  }, [searchParams]);

  /** After applied filters change, run queued map search (post viewport reset). */
  useEffect(() => {
    if (!isMapMode || !pendingMapApplyRef.current) return;

    const kind = pendingMapApplyRef.current;
    pendingMapApplyRef.current = null;

    if (kind === 'region' && pendingRegionBoundsRef.current) {
      viewport.applyMapSearch({ regionBounds: pendingRegionBoundsRef.current });
      pendingRegionBoundsRef.current = null;
      return;
    }

    viewport.applyMapSearch();
  }, [filters, isMapMode, viewport.applyMapSearch]);

  /** Initial / URL location in map mode — geocode region once per location. */
  useEffect(() => {
    if (!hasMounted || !isMapMode || pendingMapApplyRef.current) return;

    const location = filters.location?.trim() || '';
    if (!location || locationAppliedRef.current === location) return;

    locationAppliedRef.current = location;
    let cancelled = false;

    void resolveSearchLocationBounds(location).then((bounds) => {
      if (cancelled || !bounds) return;
      viewport.applyMapSearch({ regionBounds: bounds });
    });

    return () => {
      cancelled = true;
    };
  }, [hasMounted, isMapMode, filters.location, viewport.applyMapSearch]);

  useEffect(() => {
    if (!filters.location?.trim()) {
      locationAppliedRef.current = null;
    }
  }, [filters.location]);

  const fetchProperties = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const result = await fetchPublishedListings(
        buildListingsQueryParams(filters, {
          limit: LISTINGS_PAGE_SIZE,
          offset: (page - 1) * LISTINGS_PAGE_SIZE,
        }),
      );

      if (!result.success) {
        setProperties([]);
        setTotalCount(0);
        return;
      }

      setProperties(result.properties);
      setTotalCount(result.pagination?.total ?? result.properties.length);
    } catch (error) {
      console.error('Search page: Failed to fetch properties:', error);
      setProperties([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const refreshListings = useCallback(() => {
    return fetchProperties(currentPage);
  }, [fetchProperties, currentPage]);

  useEffect(() => {
    if (isMapMode) return;

    const hasFilters = Boolean(filters.location || filters.bedrooms || filters.maxPrice);
    const canUsePrefetch =
      !prefetchConsumedRef.current &&
      currentPage === 1 &&
      initialData != null &&
      initialData.properties.length > 0 &&
      !hasFilters;

    if (canUsePrefetch) {
      prefetchConsumedRef.current = true;
      return;
    }

    fetchProperties(currentPage);
  }, [fetchProperties, filters, initialData, isMapMode, currentPage]);

  const handleDraftFilterChange = (key: string, value: string) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = async () => {
    setCurrentPage(1);
    const next = { ...draftFilters };

    if (isMapMode) {
      const location = next.location?.trim();
      if (location) {
        pendingRegionBoundsRef.current = await resolveSearchLocationBounds(location);
        pendingMapApplyRef.current = 'region';
        locationAppliedRef.current = location;
      } else {
        pendingMapApplyRef.current = 'viewport';
        locationAppliedRef.current = null;
      }
    }

    setFilters(next);
    updateURL(next);
  };

  const clearFilters = () => {
    setCurrentPage(1);
    const empty: SearchFilters = { location: '', bedrooms: '', maxPrice: '' };
    setDraftFilters(empty);
    if (isMapMode) {
      pendingMapApplyRef.current = 'viewport';
      locationAppliedRef.current = null;
      pendingRegionBoundsRef.current = null;
    }
    setFilters(empty);
    updateURL(empty);
  };

  const removeFilter = async (key: string) => {
    setCurrentPage(1);
    const newFilters = { ...filters, [key]: '' };
    setDraftFilters(newFilters);

    if (isMapMode) {
      const location = newFilters.location?.trim();
      if (location) {
        pendingRegionBoundsRef.current = await resolveSearchLocationBounds(location);
        pendingMapApplyRef.current = 'region';
        locationAppliedRef.current = location;
      } else {
        pendingMapApplyRef.current = 'viewport';
        locationAppliedRef.current = null;
        pendingRegionBoundsRef.current = null;
      }
    }

    setFilters(newFilters);
    updateURL(newFilters);
  };

  const openFilterPanel = () => {
    setDraftFilters(filters);
    setIsFilterOpen(true);
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
          Showing {mapStartIndex}-{mapEndIndex} of {viewport.totalCount}
          {viewport.hasLocationRegion && viewport.locationLabel
            ? ` in ${viewport.locationLabel}`
            : ' in this map area'}
        </p>
      )}
    </div>
  );

  const filterButton = (
    <button
      onClick={openFilterPanel}
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
                onClick={openFilterPanel}
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
                hasLocationRegion={viewport.hasLocationRegion}
                locationLabel={viewport.locationLabel}
                regionFitBounds={viewport.regionFitBounds}
                onPageChange={viewport.goToPage}
                onBoundsChange={viewport.onBoundsChange}
                fitBoundsKey={viewport.fitBoundsKey}
                markerFitKey={viewport.markerFitKey}
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
        filters={draftFilters}
        onFilterChange={handleDraftFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={applyFilters}
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(false)}
      />

      {!isMapMode && <Footer />}
    </div>
  );
}
