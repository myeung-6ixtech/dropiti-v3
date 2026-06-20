'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Property } from '@/types';
import {
  boundsCacheKey,
  buildListingsQueryParams,
  DEFAULT_HK_MAP_BOUNDS,
  LISTINGS_MAP_FETCH_LIMIT,
  type MapBounds,
  type SearchFilters,
} from '@/lib/listings-params';
import { listingsBoundsCache } from '@/lib/listings-bounds-cache';
import { fetchPublishedListings } from '@/lib/listings';

const DEBOUNCE_MS = 400;

type ViewportListingsState = {
  properties: Property[];
  isLoading: boolean;
  isInitialLoad: boolean;
  onBoundsChange: (bounds: MapBounds) => void;
  /** Changes when filters change — triggers one-time map fit in SearchMap. */
  fitBoundsKey: string;
};

export function useMapViewportListings(
  filters: SearchFilters,
  enabled: boolean,
): ViewportListingsState {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const lastFetchedKeyRef = useRef<string | null>(null);
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
    lastFetchedKeyRef.current = null;
    setProperties([]);
    setIsInitialLoad(true);
    listingsBoundsCache.clear();
  }, [filterKey]);

  useEffect(() => {
    if (!enabled) return;
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [enabled, filterKey]);

  const fetchForBounds = useCallback(
    async (bounds: MapBounds) => {
      if (!enabled) return;

      const cacheKey = boundsCacheKey(bounds, filters);
      if (cacheKey === lastFetchedKeyRef.current) return;

      const cached = listingsBoundsCache.get(cacheKey);
      if (cached) {
        lastFetchedKeyRef.current = cacheKey;
        setProperties(cached);
        setIsInitialLoad(false);
        return;
      }

      const requestId = ++requestIdRef.current;
      setIsLoading(true);

      try {
        const result = await fetchPublishedListings(
          buildListingsQueryParams(
            filters,
            { limit: LISTINGS_MAP_FETCH_LIMIT, offset: 0 },
            bounds,
          ),
        );

        if (requestId !== requestIdRef.current) return;

        if (result.success) {
          listingsBoundsCache.set(cacheKey, result.properties);
          lastFetchedKeyRef.current = cacheKey;
          setProperties(result.properties);
        } else {
          setProperties([]);
        }
      } catch {
        if (requestId === requestIdRef.current) {
          setProperties([]);
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

  /** Bootstrap listings before map idle (avoids chicken-and-egg with SearchMap mount). */
  useEffect(() => {
    if (!enabled) return;
    void fetchForBounds(DEFAULT_HK_MAP_BOUNDS);
  }, [enabled, filterKey, fetchForBounds]);

  const onBoundsChange = useCallback(
    (bounds: MapBounds) => {
      if (!enabled) return;

      const cacheKey = boundsCacheKey(bounds, filters);
      if (cacheKey === lastFetchedKeyRef.current) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void fetchForBounds(bounds);
      }, DEBOUNCE_MS);
    },
    [enabled, filters, fetchForBounds],
  );

  return {
    properties,
    isLoading,
    isInitialLoad,
    onBoundsChange,
    fitBoundsKey: filterKey,
  };
}
