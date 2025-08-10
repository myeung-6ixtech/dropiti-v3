/**
 * Utility functions for the Dropiti application
 */

/**
 * Safely formats an address for display
 * Handles both string addresses and address objects
 */
export function formatAddress(address: any): string {
  if (!address) return 'Address not specified';
  
  // If address is already a string, return it
  if (typeof address === 'string') return address;
  
  // If address is an object, format it
  if (typeof address === 'object') {
    const parts = [];
    
    // Check for all possible address fields
    if (address.unit) parts.push(`Unit ${address.unit}`);
    if (address.floor) parts.push(`Floor ${address.floor}`);
    if (address.block) parts.push(address.block);
    if (address.buildingName) parts.push(address.buildingName);
    if (address.addressLine1) parts.push(address.addressLine1);
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.district) parts.push(address.district);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);
    if (address.street) parts.push(address.street);
    if (address.apartmentEstate) parts.push(address.apartmentEstate);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not specified';
  }
  
  return 'Address not specified';
}

/**
 * Safely formats a property location for display
 * This is an alias for formatAddress for consistency
 */
export function formatPropertyLocation(location: any): string {
  return formatAddress(location);
}
