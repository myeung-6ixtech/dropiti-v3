'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Property } from '@/types';
import {
  boundsContains,
  boundsCacheKey,
  buildListingsQueryParams,
  expandMapBounds,
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
  onBoundsChange: (bounds: MapBounds) => void;
  goToPage: (page: number) => void;
  /** Changes when filters change — triggers one-time map fit in SearchMap. */
  fitBoundsKey: string;
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

  const lastFetchedKeyRef = useRef<string | null>(null);
  const fetchedBoundsRef = useRef<MapBounds | null>(null);
  const activeQueryBoundsRef = useRef<MapBounds | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const filterKey = useMemo(
    () =>
      [filters.location, filters.bedrooms, filters.maxPrice]
        .map((v) => v?.trim() || '')
        .join('|'),
    [filters.location, filters.bedrooms, filters.maxPrice],
  );

  useEffect(() => {
    requestIdRef.current += 1;
    lastFetchedKeyRef.current = null;
    fetchedBoundsRef.current = null;
    activeQueryBoundsRef.current = null;
    setProperties([]);
    setTotalCount(0);
    setCurrentPage(1);
    setIsInitialLoad(true);
    setError(null);
    listingsBoundsCache.clear();
  }, [filterKey]);

  useEffect(() => {
    if (!enabled) return;
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [enabled, filterKey]);

  const fetchForQueryBounds = useCallback(
    async (queryBounds: MapBounds, page: number) => {
      if (!enabled) return;

      const cacheKey = `${boundsCacheKey(queryBounds, filters)}|page:${page}`;
      if (cacheKey === lastFetchedKeyRef.current) return;

      const cached = listingsBoundsCache.get(cacheKey);
      if (cached) {
        requestIdRef.current += 1;
        lastFetchedKeyRef.current = cacheKey;
        fetchedBoundsRef.current = queryBounds;
        activeQueryBoundsRef.current = queryBounds;
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
          fetchedBoundsRef.current = queryBounds;
          activeQueryBoundsRef.current = queryBounds;
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

  const onBoundsChange = useCallback(
    (bounds: MapBounds) => {
      if (!enabled) return;

      if (fetchedBoundsRef.current && boundsContains(fetchedBoundsRef.current, bounds)) {
        return;
      }

      const queryBounds = expandMapBounds(bounds);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void fetchForQueryBounds(queryBounds, 1);
      }, DEBOUNCE_MS);
    },
    [enabled, fetchForQueryBounds],
  );

  const goToPage = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, Math.max(1, Math.ceil(totalCount / MAP_LISTINGS_PAGE_SIZE))));
      const queryBounds = activeQueryBoundsRef.current;
      if (!enabled || !queryBounds || nextPage === currentPage) return;
      void fetchForQueryBounds(queryBounds, nextPage);
    },
    [currentPage, enabled, fetchForQueryBounds, totalCount],
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
    onBoundsChange,
    goToPage,
    fitBoundsKey: filterKey,
  };
}
