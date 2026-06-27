import { propertiesAPI } from '@/lib/api-client';
import type { Property } from '@/types';
import type { PropertyResponse } from '@/types/property';
import { inferPinPrecisionFromListing } from '@/lib/infer-pin-precision';
import {
  applyLocationFilter,
  boundsCacheKey,
  buildListingsQueryParams,
  filterPropertiesInBounds,
  LISTINGS_MAP_FETCH_LIMIT,
  LISTINGS_PAGE_SIZE,
  MAP_LISTINGS_PAGE_SIZE,
  roundBounds,
  type MapBounds,
  type PublishedListingsParams,
  type SearchFilters,
} from '@/lib/listings-params';

export {
  applyLocationFilter,
  buildListingsQueryParams,
  boundsCacheKey,
  filterPropertiesInBounds,
  LISTINGS_MAP_FETCH_LIMIT,
  LISTINGS_PAGE_SIZE,
  MAP_LISTINGS_PAGE_SIZE,
  roundBounds,
  type MapBounds,
  type PublishedListingsParams,
  type SearchFilters,
};

function enrichListingCoords(properties: Property[]): Property[] {
  return properties.map((p) => ({
    ...p,
    pinPrecision: p.pinPrecision ?? inferPinPrecisionFromListing(p),
  }));
}

function toPropertyList(data: PropertyResponse['data'] | Property | Property[]): Property[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}

/** Fetch published listings via BFF → Nhost `get-listings` (or legacy Next route). */
export async function fetchPublishedListings(
  params: PublishedListingsParams,
): Promise<{
  success: boolean;
  properties: Property[];
  pagination?: PropertyResponse['pagination'];
  error?: string;
}> {
  const response = (await propertiesAPI.getListings(params)) as PropertyResponse & {
    error?: string;
  };

  if (!response.success || !response.data) {
    return {
      success: false,
      properties: [],
      pagination: response.pagination,
      error: response.error ?? 'Failed to load listings',
    };
  }

  return {
    success: true,
    properties: enrichListingCoords(toPropertyList(response.data)),
    pagination: response.pagination,
  };
}
