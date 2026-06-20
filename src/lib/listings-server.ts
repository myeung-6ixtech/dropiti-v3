import {
  buildListingsQueryParams,
  LISTINGS_PAGE_SIZE,
  type SearchFilters,
} from '@/lib/listings-params';
import { normalizeListings } from '@/lib/normalize-listing';
import type { Property } from '@/types';

export type SearchPrefetchResult = {
  properties: Property[];
  totalCount: number;
};

/** Server-side prefetch for `/search` RSC (public get-listings). */
export async function prefetchSearchListings(
  filters: Pick<SearchFilters, 'location' | 'bedrooms' | 'maxPrice'>,
): Promise<SearchPrefetchResult | null> {
  const baseUrl = process.env.NEXT_PUBLIC_FUNCTIONS_URL?.replace(/\/$/, '');
  if (!baseUrl) return null;

  const params = buildListingsQueryParams(filters, {
    limit: LISTINGS_PAGE_SIZE,
    offset: 0,
  });
  const search = new URLSearchParams();
  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.offset != null) search.set('offset', String(params.offset));
  if (params.location) search.set('location', params.location);
  if (params.maxPrice != null) search.set('maxPrice', String(params.maxPrice));
  if (params.bedrooms != null) search.set('bedrooms', String(params.bedrooms));

  try {
    const res = await fetch(
      `${baseUrl}/v1/client/properties/get-listings?${search.toString()}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;

    const body = (await res.json()) as {
      ok?: boolean;
      data?: { items?: unknown[]; pagination?: { total?: number } };
    };
    if (body.ok !== true || !body.data) return null;

    const items = body.data.items ?? [];
    if (items.length === 0) return null;

    const total = body.data.pagination?.total ?? items.length;

    return {
      properties: normalizeListings(items),
      totalCount: total,
    };
  } catch {
    return null;
  }
}
