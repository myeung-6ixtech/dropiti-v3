import { PropertyData } from '@/types/property';

/**
 * Standardizes address data format for database storage
 * Ensures consistent structure between create and update operations
 */
export interface StandardizedAddress {
  unit?: string;
  block?: string;
  floor?: string;
  state?: string;
  country?: string;
  district?: string;
  addressLine1?: string;
  addressLine2?: string;
  building?: string;
  city?: string;
  showSpecificLocation?: boolean;
}

/**
 * Formats address data from PropertyData to standardized database format
 * Used for both creating new properties and updating existing ones
 */
export function formatAddressForDatabase(address: PropertyData['address']): StandardizedAddress {
  if (!address) {
    return {};
  }

  return {
    unit: address.unit || undefined,
    block: address.block || undefined,
    floor: address.floor || undefined,
    state: address.state || undefined,
    country: address.country || undefined,
    district: address.district || undefined,
    addressLine1: address.addressLine1 || undefined,
    addressLine2: address.addressLine2 || undefined,
    building: address.building || undefined,
    city: address.city || undefined,
    showSpecificLocation: address.showSpecificLocation || false,
  };
}

/**
 * Formats address data from API response to PropertyData format
 * Used when displaying address data in forms
 */
export function formatAddressFromDatabase(address: StandardizedAddress): PropertyData['address'] {
  if (!address) {
    return undefined;
  }

  return {
    unit: address.unit || undefined,
    block: address.block || undefined,
    floor: address.floor || undefined,
    state: address.state || undefined,
    country: address.country || undefined,
    district: address.district || undefined,
    addressLine1: address.addressLine1 || undefined,
    addressLine2: address.addressLine2 || undefined,
    building: address.building || undefined,
    city: address.city || undefined,
    showSpecificLocation: address.showSpecificLocation || false,
  };
}

/**
 * Validates if an address object has the minimum required fields
 * Returns true if address has at least some meaningful content
 */
export function hasValidAddressContent(address: StandardizedAddress): boolean {
  if (!address) return false;
  
  const requiredFields = ['city', 'state', 'country'];
  return requiredFields.some(field => address[field as keyof StandardizedAddress] && 
    String(address[field as keyof StandardizedAddress]).trim().length > 0);
}

/**
 * Creates a display string from address data for UI purposes
 * Useful for showing address in property cards or summaries
 */
export function createAddressDisplayString(address: StandardizedAddress): string {
  if (!address) return 'Address not specified';
  
  const parts = [];
  
  if (address.building) parts.push(address.building);
  if (address.block) parts.push(`Block ${address.block}`);
  if (address.unit) parts.push(`Unit ${address.unit}`);
  if (address.floor) parts.push(`Floor ${address.floor}`);
  if (address.addressLine1) parts.push(address.addressLine1);
  if (address.addressLine2) parts.push(address.addressLine2);
  if (address.city) parts.push(address.city);
  if (address.district) parts.push(address.district);
  if (address.state) parts.push(address.state);
  if (address.country) parts.push(address.country);
  
  return parts.length > 0 ? parts.join(', ') : 'Address not specified';
}
