import type { Property } from '@/types';

export const LISTINGS_PAGE_SIZE = 12;
export const MAP_LISTINGS_PAGE_SIZE = 10;
/** Nhost `get-listings` max page size (see `parsePagination` in functions). */
export const LISTINGS_MAP_FETCH_LIMIT = 100;

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/** Default viewport for initial map-mode fetch (Hong Kong + Macau). */
export const DEFAULT_HK_MAP_BOUNDS: MapBounds = {
  north: 22.56,
  south: 22.08,
  east: 114.41,
  west: 113.83,
};

export type PublishedListingsParams = {
  limit?: number;
  offset?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  type?: string;
  landlord_user_id?: string;
  north?: number;
  south?: number;
  east?: number;
  west?: number;
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
  bounds?: MapBounds,
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

  if (bounds) {
    params.north = bounds.north;
    params.south = bounds.south;
    params.east = bounds.east;
    params.west = bounds.west;
  }

  return params;
}

/** Round bounds for cache keys / refetch hysteresis (~1 km grid). */
export function roundBounds(bounds: MapBounds, decimals = 2): MapBounds {
  const round = (n: number) =>
    Math.round(n * 10 ** decimals) / 10 ** decimals;
  return {
    north: round(bounds.north),
    south: round(bounds.south),
    east: round(bounds.east),
    west: round(bounds.west),
  };
}

export function expandMapBounds(bounds: MapBounds, paddingRatio = 0.5): MapBounds {
  const latPadding = (bounds.north - bounds.south) * paddingRatio;
  const lngPadding = (bounds.east - bounds.west) * paddingRatio;

  return {
    north: Math.min(90, bounds.north + latPadding),
    south: Math.max(-90, bounds.south - latPadding),
    east: bounds.east + lngPadding,
    west: bounds.west - lngPadding,
  };
}

export function boundsContains(outer: MapBounds, inner: MapBounds): boolean {
  return (
    inner.north <= outer.north &&
    inner.south >= outer.south &&
    inner.east <= outer.east &&
    inner.west >= outer.west
  );
}

export function boundsCacheKey(
  bounds: MapBounds,
  filters: Pick<SearchFilters, 'bedrooms' | 'maxPrice' | 'location'>,
): string {
  const b = roundBounds(bounds);
  return [
    b.north,
    b.south,
    b.east,
    b.west,
    filters.location?.trim() || '',
    filters.bedrooms?.trim() || '',
    filters.maxPrice?.trim() || '',
  ].join('|');
}

/** Client-side fallback when API bbox is unavailable. */
export function filterPropertiesInBounds(
  properties: Property[],
  bounds: MapBounds,
): Property[] {
  return properties.filter((p) => {
    if (typeof p.latitude !== 'number' || typeof p.longitude !== 'number') {
      return false;
    }
    return (
      p.latitude >= bounds.south &&
      p.latitude <= bounds.north &&
      p.longitude >= bounds.west &&
      p.longitude <= bounds.east
    );
  });
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
