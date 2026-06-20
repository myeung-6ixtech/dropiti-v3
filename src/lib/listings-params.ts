import type { Property } from '@/types';

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
