import type { Property } from '@/types';

/** Client-side pin precision inference (mirrors nhost resolver policy). */
export function inferPinPrecisionFromListing(property: {
  show_specific_location?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  location?: string;
  address?: unknown;
}): 'exact' | 'approximate' {
  if (property.latitude == null || property.longitude == null) {
    return 'approximate';
  }

  const showSpecific = Boolean(property.show_specific_location);
  const addr = property.address;
  let hasStreet = false;

  if (addr && typeof addr === 'object' && !Array.isArray(addr)) {
    const row = addr as Record<string, unknown>;
    const street =
      (typeof row.addressLine1 === 'string' && row.addressLine1.trim()) ||
      (typeof row.street === 'string' && row.street.trim());
    hasStreet = Boolean(street);
  } else if (typeof addr === 'string' && addr.trim()) {
    hasStreet = true;
  }

  if (showSpecific && hasStreet) return 'exact';
  return 'approximate';
}
