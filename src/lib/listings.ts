import { propertiesAPI } from '@/lib/api-client';
import type { Property } from '@/types';
import type { PropertyResponse } from '@/types/property';
import { inferPinPrecisionFromListing } from '@/lib/infer-pin-precision';

export const LISTINGS_PAGE_SIZE = 12;
/** Nhost `get-listings` max page size (see `parsePagination` in functions). */
export const LISTINGS_MAP_FETCH_LIMIT = 100;

export type PublishedListingsParams = {
  limit?: number;
  offset?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  type?: string;
  landlord_user_id?: string;
};

export type SearchFilters = {
  location: string;
  bedrooms: string;
  maxPrice: string;
};

/** Build query params for `GET .../properties/get-listings`. */
export function buildListingsQueryParams(
  filters: Pick<SearchFilters, 'bedrooms' | 'maxPrice' | 'location'>,
  paging: { limit: number; offset: number },
): PublishedListingsParams {
  const params: PublishedListingsParams = {
    limit: paging.limit,
    offset: paging.offset,
  };

  const location = filters.location?.trim();
  if (location) {
    params.location = location;
  }

  const maxPrice = filters.maxPrice?.trim() ? parseInt(filters.maxPrice, 10) : NaN;
  if (!Number.isNaN(maxPrice)) {
    params.maxPrice = maxPrice;
  }

  const bedrooms = filters.bedrooms?.trim() ? parseInt(filters.bedrooms, 10) : NaN;
  if (!Number.isNaN(bedrooms)) {
    // Nhost applies num_bedroom _gte; use 5 for "5+" filter value
    params.bedrooms = bedrooms;
  }

  return params;
}

/** Location text search — server-side when Nhost `location` param is set; client fallback otherwise. */
export function applyLocationFilter(
  properties: Property[],
  location?: string,
  serverFiltered = false,
): Property[] {
  if (serverFiltered) return properties;
  const term = location?.trim().toLowerCase();
  if (!term) return properties;

  return properties.filter((property) => {
    const loc = (property.location || '').toLowerCase();
    const title = (property.title || '').toLowerCase();
    return loc.includes(term) || title.includes(term);
  });
}

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
