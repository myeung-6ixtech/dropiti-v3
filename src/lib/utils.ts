/**
 * Utility functions for the Dropiti application
 */

// Address interface for type safety
interface AddressObject {
  unit?: string;
  floor?: string;
  block?: string;
  buildingName?: string;
  addressLine1?: string;
  addressLine2?: string;
  district?: string;
  state?: string;
  country?: string;
  street?: string;
  apartmentEstate?: string;
}

/**
 * Safely formats an address for display
 * Handles both string addresses and address objects
 */
export function formatAddress(address: unknown): string {
  if (!address) return 'Address not specified';

  // If address is already a string, return it
  if (typeof address === 'string') return address;

  // If address is an object, format it
  if (typeof address === 'object' && address !== null) {
    const addressObj = address as AddressObject;
    const parts = [];

    // Check for all possible address fields
    if (addressObj.unit) parts.push(`Unit ${addressObj.unit}`);
    if (addressObj.floor) parts.push(`Floor ${addressObj.floor}`);
    if (addressObj.block) parts.push(addressObj.block);
    if (addressObj.buildingName) parts.push(addressObj.buildingName);
    if (addressObj.addressLine1) parts.push(addressObj.addressLine1);
    if (addressObj.addressLine2) parts.push(addressObj.addressLine2);
    if (addressObj.district) parts.push(addressObj.district);
    if (addressObj.state) parts.push(addressObj.state);
    if (addressObj.country) parts.push(addressObj.country);
    if (addressObj.street) parts.push(addressObj.street);
    if (addressObj.apartmentEstate) parts.push(addressObj.apartmentEstate);

    return parts.length > 0 ? parts.join(', ') : 'Address not specified';
  }

  return 'Address not specified';
}

/**
 * Safely formats a property location for display
 * This is an alias for formatAddress for consistency
 */
export function formatPropertyLocation(location: unknown): string {
  return formatAddress(location);
}
