import { propertiesAPI } from '@/lib/api-client';
import type { Property } from '@/types';
import type { PropertyResponse } from '@/types/property';

export const LISTINGS_PAGE_SIZE = 12;
/** Nhost `get-listings` max page size (see `parsePagination` in functions). */
export const LISTINGS_MAP_FETCH_LIMIT = 100;

export type PublishedListingsParams = {
  limit?: number;
  offset?: number;
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
  filters: Pick<SearchFilters, 'bedrooms' | 'maxPrice'>,
  paging: { limit: number; offset: number },
): PublishedListingsParams {
  const params: PublishedListingsParams = {
    limit: paging.limit,
    offset: paging.offset,
  };

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

/** Location text search is not on Nhost — filter client-side after fetch. */
export function applyLocationFilter(
  properties: Property[],
  location?: string,
): Property[] {
  const term = location?.trim().toLowerCase();
  if (!term) return properties;

  return properties.filter((property) => {
    const loc = (property.location || '').toLowerCase();
    const title = (property.title || '').toLowerCase();
    return loc.includes(term) || title.includes(term);
  });
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
    properties: toPropertyList(response.data),
    pagination: response.pagination,
  };
}
