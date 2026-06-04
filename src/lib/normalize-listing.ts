import { formatPropertyLocation, parseUploadedImages } from '@/lib/utils';
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

  // Offers share property_uuid but must not be normalized as listings.
  if (
    'offer_status' in row ||
    'offer_key' in row ||
    'proposing_rent_price' in row ||
    ('initiator_user_id' in row && 'property_uuid' in row)
  ) {
    return false;
  }

  // Notifications have title/id but are not listings.
  if (
    'is_read' in row ||
    'is_archived' in row ||
    'type_id' in row
  ) {
    return false;
  }

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

/** `{ property, landlord }` from get-property-by-uuid (Next route + Nhost). */
export type PropertyDetailPayload = {
  property: Record<string, unknown>;
  landlord: Record<string, unknown> | null;
};

function rawListingToDetailProperty(row: RawListingRow): Record<string, unknown> {
  const ids = resolveListingIds(row);
  const location = resolvePropertyLocation(row);
  const displayImage = row.display_image || '';
  const uploaded = parseUploadedImages(row.uploaded_images);
  const status = (row as Record<string, unknown>).status as string | undefined;
  return {
    id: ids.id,
    property_uuid: ids.property_uuid,
    title: row.title,
    description: row.description ?? '',
    location,
    address: row.address,
    show_specific_location:
      (row as Record<string, unknown>).show_specific_location === true,
    price: row.rental_price || 0,
    bedrooms: row.num_bedroom || 0,
    bathrooms: row.num_bathroom || 0,
    num_bedroom: row.num_bedroom,
    num_bathroom: row.num_bathroom,
    image_url: displayImage || uploaded[0] || '',
    display_image: displayImage,
    uploaded_images: uploaded,
    available: status === 'published',
    status: status || 'draft',
    created_at: row.created_at,
    updated_at: row.created_at,
    details: {
      type: row.property_type || 'residential',
      furnished: row.furnished,
      petsAllowed: row.pets_allowed || false,
      parking: false,
    },
    amenities: row.amenities || [],
    minimum_lease: 12,
    available_date: row.availability_date,
    owner_id: (row as Record<string, unknown>).landlord_user_id,
  };
}

function normalizedListingToDetailProperty(row: Record<string, unknown>): Record<string, unknown> {
  const imageUrl = (row.imageUrl as string) || (row.image_url as string) || '';
  return {
    id: row.id,
    property_uuid: row.property_uuid ?? row.id,
    title: row.title,
    description: row.description ?? '',
    location: row.location,
    address: row.address,
    price: row.price,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    image_url: imageUrl,
    display_image: row.display_image ?? imageUrl,
    uploaded_images: (() => {
      const parsed = parseUploadedImages(row.uploaded_images);
      return parsed.length > 0 ? parsed : imageUrl ? [imageUrl] : [];
    })(),
    available: row.available,
    status: row.status,
    created_at: row.createdAt ?? row.created_at,
    updated_at: row.updatedAt ?? row.updated_at,
    details: row.details,
    amenities: row.amenities ?? [],
    minimum_lease: row.minimumLease ?? row.minimum_lease ?? 12,
    available_date: row.availableDate ?? row.available_date,
    owner_id: row.ownerId ?? row.owner_id,
  };
}

/** Ensure `uploaded_images` is a string[] and sync primary image fields. */
function enrichDetailProperty(property: Record<string, unknown>): Record<string, unknown> {
  const uploaded = parseUploadedImages(property.uploaded_images);
  const displayImage =
    (typeof property.display_image === 'string' && property.display_image.trim()) ||
    uploaded[0] ||
    '';
  const imageUrl =
    (typeof property.image_url === 'string' && property.image_url.trim()) ||
    displayImage ||
    uploaded[0] ||
    '';

  return {
    ...property,
    uploaded_images: uploaded,
    display_image: displayImage,
    image_url: imageUrl,
  };
}

/**
 * Normalize get-property-by-uuid responses to `{ property, landlord }`
 * (handles Nhost envelope, legacy Next route, or mistaken listing normalization).
 */
export function mapPropertyDetailResponse(data: unknown): PropertyDetailPayload | null {
  if (!data || typeof data !== 'object') return null;
  const row = data as Record<string, unknown>;

  if (row.property && typeof row.property === 'object') {
    return {
      property: enrichDetailProperty(row.property as Record<string, unknown>),
      landlord: (row.landlord as Record<string, unknown> | null) ?? null,
    };
  }

  if (isRawListingRow(data)) {
    return {
      property: enrichDetailProperty(rawListingToDetailProperty(data)),
      landlord: null,
    };
  }

  if (typeof row.title === 'string' && ('imageUrl' in row || 'image_url' in row)) {
    return {
      property: enrichDetailProperty(normalizedListingToDetailProperty(row)),
      landlord: null,
    };
  }

  return null;
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
