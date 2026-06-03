import { formatPropertyLocation } from '@/lib/utils';
import type { Property } from '@/types';

/** Raw Hasura row shape from Nhost Functions `get-listings` / `get-property`. */
export type RawListingRow = {
  id: string | number;
  property_uuid?: string;
  title: string;
  description?: string;
  address?: unknown;
  rental_price?: number | null;
  num_bedroom?: number | null;
  num_bathroom?: number | null;
  display_image?: string | null;
  uploaded_images?: string[] | null;
  property_type?: string;
  furnished?: string | null;
  pets_allowed?: boolean | null;
  amenities?: string[] | null;
  availability_date?: string | null;
  created_at?: string;
};

/** Stable React key / map marker id (prefer `property_uuid`). */
export function getListingKey(
  p: { id?: string | number; property_uuid?: string },
  index?: number,
): string {
  const uuid = p.property_uuid?.trim();
  if (uuid) return uuid;
  if (p.id !== undefined && p.id !== null && p.id !== '') {
    return String(p.id);
  }
  return `listing-${index ?? 0}`;
}

function resolveListingIds(row: {
  id?: string | number;
  property_uuid?: string;
}): { id: string; property_uuid: string } {
  const propertyUuid = row.property_uuid?.trim();
  const id = String(propertyUuid ?? row.id ?? '');
  return {
    id,
    property_uuid: propertyUuid || id,
  };
}

export function isRawListingRow(value: unknown): value is RawListingRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  const hasId =
    (typeof row.id === 'string' && row.id.length > 0) ||
    (typeof row.id === 'number' && !Number.isNaN(row.id));
  const hasUuid =
    typeof row.property_uuid === 'string' && row.property_uuid.trim().length > 0;
  if (!hasId && !hasUuid) return false;

  const hasHasuraFields = 'rental_price' in row || 'num_bedroom' in row;
  const hasNormalizedPrice = 'price' in row && typeof row.price === 'number';
  const hasStringLocation =
    typeof row.location === 'string' && row.location.trim().length > 0;

  if (hasHasuraFields) return true;
  if (typeof row.location === 'object' && row.location !== null) return true;
  if (row.address && typeof row.address === 'object' && !hasStringLocation) {
    return true;
  }

  return !(hasNormalizedPrice && hasStringLocation);
}

/** Resolve a display location string from either API shape (string or JSON address). */
export function resolvePropertyLocation(property: {
  location?: unknown;
  address?: unknown;
}): string {
  if (typeof property.location === 'string' && property.location.trim()) {
    return property.location.trim();
  }
  if (property.location && typeof property.location === 'object') {
    return formatPropertyLocation(property.location);
  }
  if (typeof property.address === 'string' && property.address.trim()) {
    return property.address.trim();
  }
  if (property.address && typeof property.address === 'object') {
    return formatPropertyLocation(property.address);
  }
  return 'Location not specified';
}

/** Map Hasura listing row → frontend `Property` shape (legacy Next API + Nhost). */
export function normalizeListing(property: RawListingRow): Property {
  const location = resolvePropertyLocation(property);
  const ids = resolveListingIds(property);

  return {
    id: ids.id,
    property_uuid: ids.property_uuid,
    title: property.title,
    description: property.description ?? '',
    location,
    price: property.rental_price || 0,
    bedrooms: property.num_bedroom || 0,
    bathrooms: property.num_bathroom || 0,
    imageUrl: property.display_image || property.uploaded_images?.[0] || '',
    details: {
      type: property.property_type || 'residential',
      furnished: property.furnished || 'non-furnished',
      petsAllowed: property.pets_allowed || false,
      parking: false,
    },
    rules: [],
    amenities: property.amenities || [],
    minimumLease: 12,
    availableDate: property.availability_date ?? null,
    createdAt: property.created_at || new Date().toISOString(),
    updatedAt: property.created_at || new Date().toISOString(),
    ownerId: '',
  };
}

export function normalizeListings(items: unknown[]): Property[] {
  return items.map((item, index) => {
    if (isRawListingRow(item)) {
      return normalizeListing(item);
    }
    const row = item as Property & {
      id?: string | number;
      property_uuid?: string;
      address?: unknown;
      location?: unknown;
    };
    const ids = resolveListingIds(row);
    return {
      ...row,
      id: ids.id || getListingKey(row, index),
      property_uuid: ids.property_uuid || getListingKey(row, index),
      location: resolvePropertyLocation(row),
    };
  });
}
