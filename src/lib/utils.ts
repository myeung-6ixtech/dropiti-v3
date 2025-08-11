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

/**
 * Safely get profile image URL with fallback
 * @param imageUrl - The original image URL
 * @param fallbackUrl - Fallback image URL if the original is invalid
 * @returns Safe image URL or fallback
 */
export const getSafeProfileImage = (imageUrl?: string | null, fallbackUrl?: string): string => {
  if (!imageUrl) {
    return fallbackUrl || '/images/default-avatar.png';
  }

  // Check if the URL is valid
  try {
    const url = new URL(imageUrl);
    
    // Allow common profile image hostnames
    const allowedHostnames = [
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'graph.facebook.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'placehold.co'
    ];

    if (allowedHostnames.includes(url.hostname)) {
      return imageUrl;
    }

    // If it's a relative URL or localhost, allow it
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.protocol === 'data:') {
      return imageUrl;
    }

    // If it's a relative path, allow it
    if (!url.hostname) {
      return imageUrl;
    }

    // For other external URLs, return fallback
    console.warn(`Profile image hostname not allowed: ${url.hostname}`);
    return fallbackUrl || '/images/default-avatar.png';
  } catch {
    // If URL parsing fails, it might be a relative path
    if (imageUrl.startsWith('/') || imageUrl.startsWith('./')) {
      return imageUrl;
    }
    
    console.warn(`Invalid profile image URL: ${imageUrl}`);
    return fallbackUrl || '/images/default-avatar.png';
  }
};

/**
 * Check if an image URL is safe to use with Next.js Image component
 * @param imageUrl - The image URL to check
 * @returns boolean indicating if the URL is safe
 */
export const isImageUrlSafe = (imageUrl?: string | null): boolean => {
  if (!imageUrl) return false;

  try {
    const url = new URL(imageUrl);
    
    const allowedHostnames = [
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'graph.facebook.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'placehold.co'
    ];

    return allowedHostnames.includes(url.hostname) || 
           url.hostname === 'localhost' || 
           url.hostname === '127.0.0.1' || 
           url.protocol === 'data:' ||
           !url.hostname; // Relative paths
  } catch {
    // If URL parsing fails, it might be a relative path
    return imageUrl.startsWith('/') || imageUrl.startsWith('./');
  }
};
