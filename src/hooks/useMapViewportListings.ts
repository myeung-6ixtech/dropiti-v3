'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Property } from '@/types';
import {
  boundsCacheKey,
  buildListingsQueryParams,
  MAP_LISTINGS_PAGE_SIZE,
  type MapBounds,
  type SearchFilters,
} from '@/lib/listings-params';
import { listingsBoundsCache } from '@/lib/listings-bounds-cache';
import { fetchPublishedListings } from '@/lib/listings';

const DEBOUNCE_MS = 400;

type ViewportListingsState = {
  properties: Property[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isInitialLoad: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLocationRegion: boolean;
  locationLabel: string;
  regionFitBounds: MapBounds | null;
  onBoundsChange: (bounds: MapBounds) => void;
  goToPage: (page: number) => void;
  applyMapSearch: (opts?: { regionBounds?: MapBounds | null }) => void;
  fitBoundsKey: string;
  markerFitKey: string;
};

export function useMapViewportListings(
  filters: SearchFilters,
  enabled: boolean,
): ViewportListingsState {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleAreaKey, setVisibleAreaKey] = useState('');
  const [regionFitBounds, setRegionFitBounds] = useState<MapBounds | null>(null);
  const [isRegionSearch, setIsRegionSearch] = useState(false);

  const lastFetchedKeyRef = useRef<string | null>(null);
  const lastVisibleAreaKeyRef = useRef<string | null>(null);
  const activeVisibleBoundsRef = useRef<MapBounds | null>(null);
  const locationRegionBoundsRef = useRef<MapBounds | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const filterKey = useMemo(
    () =>
      [filters.location, filters.bedrooms, filters.maxPrice]
        .map((v) => v?.trim() || '')
        .join('|'),
    [filters.location, filters.bedrooms, filters.maxPrice],
  );

  const resetViewportState = useCallback(() => {
    requestIdRef.current += 1;
    lastFetchedKeyRef.current = null;
    lastVisibleAreaKeyRef.current = null;
    activeVisibleBoundsRef.current = null;
    locationRegionBoundsRef.current = null;
    setProperties([]);
    setTotalCount(0);
    setCurrentPage(1);
    setVisibleAreaKey('');
    setRegionFitBounds(null);
    setIsRegionSearch(false);
    setIsInitialLoad(true);
    setError(null);
    listingsBoundsCache.clear();
  }, []);

  useEffect(() => {
    resetViewportState();
  }, [filterKey, resetViewportState]);

  useEffect(() => {
    if (!enabled) return;
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [enabled, filterKey]);

  const fetchForBounds = useCallback(
    async (queryBounds: MapBounds, page: number, visibleBoundsForKey?: MapBounds) => {
      if (!enabled) return;

      const areaKey = boundsCacheKey(queryBounds, filters);
      const cacheKey = `${areaKey}|page:${page}`;
      if (cacheKey === lastFetchedKeyRef.current) return;

      const cached = listingsBoundsCache.get(cacheKey);
      if (cached) {
        requestIdRef.current += 1;
        lastFetchedKeyRef.current = cacheKey;
        lastVisibleAreaKeyRef.current = areaKey;
        if (visibleBoundsForKey) {
          activeVisibleBoundsRef.current = visibleBoundsForKey;
        }
        setVisibleAreaKey(areaKey);
        setProperties(cached.properties);
        setTotalCount(cached.totalCount);
        setCurrentPage(page);
        setIsLoading(false);
        setIsInitialLoad(false);
        setError(null);
        return;
      }

      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchPublishedListings(
          buildListingsQueryParams(
            filters,
            {
              limit: MAP_LISTINGS_PAGE_SIZE,
              offset: (page - 1) * MAP_LISTINGS_PAGE_SIZE,
            },
            queryBounds,
          ),
        );

        if (requestId !== requestIdRef.current) return;

        if (result.success) {
          const nextTotalCount = result.pagination?.total ?? result.properties.length;
          listingsBoundsCache.set(cacheKey, {
            properties: result.properties,
            totalCount: nextTotalCount,
          });
          lastFetchedKeyRef.current = cacheKey;
          lastVisibleAreaKeyRef.current = areaKey;
          if (visibleBoundsForKey) {
            activeVisibleBoundsRef.current = visibleBoundsForKey;
          }
          setVisibleAreaKey(areaKey);
          setProperties(result.properties);
          setTotalCount(nextTotalCount);
          setCurrentPage(page);
        } else {
          setError(result.error ?? 'Unable to refresh listings for this map area.');
        }
      } catch {
        if (requestId === requestIdRef.current) {
          setError('Unable to refresh listings for this map area.');
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsInitialLoad(false);
        }
      }
    },
    [enabled, filters],
  );

  const getActiveQueryBounds = useCallback((): MapBounds | null => {
    if (locationRegionBoundsRef.current) {
      return locationRegionBoundsRef.current;
    }
    return activeVisibleBoundsRef.current;
  }, []);

  const onBoundsChange = useCallback(
    (bounds: MapBounds) => {
      if (!enabled) return;
      // Region search owns fetching while a location filter is active.
      if (locationRegionBoundsRef.current || filters.location?.trim()) return;

      const areaKey = boundsCacheKey(bounds, filters);
      if (areaKey === lastVisibleAreaKeyRef.current) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void fetchForBounds(bounds, 1, bounds);
      }, DEBOUNCE_MS);
    },
    [enabled, filters, fetchForBounds],
  );

  const goToPage = useCallback(
    (page: number) => {
      const queryBounds = getActiveQueryBounds();
      if (!enabled || !queryBounds) return;

      const maxPage = Math.max(1, Math.ceil(totalCount / MAP_LISTINGS_PAGE_SIZE));
      const nextPage = Math.max(1, Math.min(page, maxPage));
      if (nextPage === currentPage) return;

      void fetchForBounds(queryBounds, nextPage, activeVisibleBoundsRef.current ?? queryBounds);
    },
    [currentPage, enabled, fetchForBounds, getActiveQueryBounds, totalCount],
  );

  const applyMapSearch = useCallback(
    (opts?: { regionBounds?: MapBounds | null }) => {
      if (!enabled) return;

      lastFetchedKeyRef.current = null;

      if (opts?.regionBounds) {
        locationRegionBoundsRef.current = opts.regionBounds;
        setRegionFitBounds(opts.regionBounds);
        setIsRegionSearch(true);
        void fetchForBounds(opts.regionBounds, 1, opts.regionBounds);
        return;
      }

      locationRegionBoundsRef.current = null;
      setRegionFitBounds(null);
      setIsRegionSearch(false);

      const visible = activeVisibleBoundsRef.current;
      if (visible) {
        void fetchForBounds(visible, 1, visible);
      }
    },
    [enabled, fetchForBounds],
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / MAP_LISTINGS_PAGE_SIZE));

  return {
    properties,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    isInitialLoad,
    isRefreshing: isLoading && !isInitialLoad,
    error,
    hasLocationRegion: isRegionSearch && Boolean(filters.location?.trim()),
    locationLabel: filters.location?.trim() || '',
    regionFitBounds,
    onBoundsChange,
    goToPage,
    applyMapSearch,
    fitBoundsKey: filterKey,
    markerFitKey: `${visibleAreaKey}|page:${currentPage}`,
  };
}
