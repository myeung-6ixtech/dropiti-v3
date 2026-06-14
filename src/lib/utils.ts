/**
 * Utility functions for the Dropiti application
 */

import { twMerge } from 'tailwind-merge';
import { DEFAULT_AVATAR_URL } from '@/constants/images';
import { getMediaDisplayUrl, isNhostStorageUrl } from '@/lib/media-url';

/**
 * Utility function to merge Tailwind CSS classes
 * Handles conditional classes and deduplicates Tailwind classes
 */
export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(inputs.filter(Boolean).join(' '));
}

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

/** Capitalize first letter of each word (e.g. "eastern" -> "Eastern") */
export function capitalizeWords(str: string): string {
  if (!str || typeof str !== 'string') return str;
  return str.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Parse Hasura/jsonb address (object or JSON string) into a structured object. */
export function parsePropertyAddress(address: unknown): AddressObject | null {
  if (!address) return null;
  if (typeof address === 'string') {
    const trimmed = address.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as AddressObject;
        }
      } catch {
        return { addressLine1: trimmed };
      }
    }
    return { addressLine1: trimmed };
  }
  if (typeof address === 'object' && address !== null) {
    return address as AddressObject;
  }
  return null;
}

/**
 * Build a string Google Geocoder can resolve (district-level or full address).
 */
export function resolveGeocodingAddress(options: {
  address?: unknown;
  location?: string;
  showSpecificLocation?: boolean;
}): string {
  const parsed = parsePropertyAddress(options.address);
  const showSpecific = options.showSpecificLocation === true;

  if (parsed) {
    const district = parsed.district?.trim() || '';
    const country = parsed.country?.trim() || 'Hong Kong';
    const capDistrict = district ? capitalizeWords(district) : '';
    const capCountry = capitalizeWords(country);

    if (!showSpecific) {
      return capDistrict ? `${capDistrict}, ${capCountry}` : capCountry;
    }

    const line1 = (parsed.addressLine1 || '').trim();
    const parts = [line1, capDistrict, capCountry].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }

  const loc = options.location?.trim() || '';
  if (
    loc &&
    loc !== 'Address not specified' &&
    !loc.startsWith('{') &&
    !loc.startsWith('[')
  ) {
    return loc;
  }

  return 'Hong Kong';
}

/**
 * Safely formats an address for display
 * Handles both string addresses and address objects
 */
export function formatAddress(address: unknown): string {
  const addressObj = parsePropertyAddress(address);
  if (!addressObj) return 'Address not specified';

  const parts: string[] = [];
  if (addressObj.unit) parts.push(`Unit ${addressObj.unit}`);
  if (addressObj.floor) parts.push(`Floor ${addressObj.floor}`);
  if (addressObj.block) parts.push(addressObj.block);
  if (addressObj.buildingName) parts.push(addressObj.buildingName);
  if (addressObj.addressLine1) parts.push(addressObj.addressLine1);
  if (addressObj.addressLine2) parts.push(addressObj.addressLine2);
  if (addressObj.district) parts.push(capitalizeWords(addressObj.district));
  if (addressObj.state) parts.push(capitalizeWords(addressObj.state));
  if (addressObj.country) parts.push(capitalizeWords(addressObj.country));

  return parts.length > 0 ? parts.join(', ') : 'Address not specified';
}

/**
 * Safely formats a property location for display
 * This is an alias for formatAddress for consistency
 */
export function formatPropertyLocation(location: unknown): string {
  return formatAddress(location);
}

/** True for Nhost Storage / CDN URLs (`*.storage.<region>.nhost.run/v1/files/...`). */
export function isNhostStorageHostname(hostname: string): boolean {
  return hostname.endsWith('.nhost.run') && hostname.includes('.storage.');
}

const ALLOWED_REMOTE_IMAGE_HOSTNAMES = [
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'graph.facebook.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'placehold.co',
      's3.amazonaws.com',
      's3.us-east-1.amazonaws.com',
      's3.us-west-1.amazonaws.com',
      's3.us-west-2.amazonaws.com',
      's3.eu-west-1.amazonaws.com',
      's3.eu-central-1.amazonaws.com',
      's3.ap-southeast-1.amazonaws.com',
      's3.ap-northeast-1.amazonaws.com',
      's3.ap-south-1.amazonaws.com',
      'storage.googleapis.com',
      'firebasestorage.googleapis.com',
      'blob.core.windows.net',
      'cdn.digitaloceanspaces.com',
      'nyc3.digitaloceanspaces.com',
      'fra1.digitaloceanspaces.com',
      'sgp1.digitaloceanspaces.com',
      'www.gravatar.com',
      'gravatar.com',
] as const;

function isAllowedRemoteImageHostname(hostname: string): boolean {
  if (isNhostStorageHostname(hostname)) return true;
  if (ALLOWED_REMOTE_IMAGE_HOSTNAMES.includes(hostname as (typeof ALLOWED_REMOTE_IMAGE_HOSTNAMES)[number])) {
    return true;
  }
  if (hostname.includes('.s3.') && hostname.includes('.amazonaws.com')) return true;
  if (hostname.includes('.digitaloceanspaces.com')) return true;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * Resolve a remote image URL safe for `next/image` (allowed host + valid URL).
 */
const PROPERTY_IMAGE_PLACEHOLDER = '/images/placeholder.png';

/** Extract a single image URL from a string or storage object. */
function extractImageUrl(item: unknown): string | null {
  if (typeof item === 'string') {
    const trimmed = item.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>;
    for (const key of ['url', 'fileUrl', 'src', 'imageUrl', 'photo_url', 'publicUrl']) {
      const candidate = record[key];
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
  }
  return null;
}

/**
 * Parse Hasura `uploaded_images` (jsonb array, JSON string, or object map).
 * Returns deduplicated Nhost/storage URL strings.
 */
export function parseUploadedImages(value: unknown): string[] {
  const urls: string[] = [];
  const add = (item: unknown) => {
    const url = extractImageUrl(item);
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  };

  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) {
    value.forEach(add);
    return urls;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return parseUploadedImages(JSON.parse(trimmed) as unknown);
      } catch {
        add(trimmed);
        return urls;
      }
    }
    add(trimmed);
    return urls;
  }

  if (typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach(add);
    return urls;
  }

  return [];
}

export function getSafeRemoteImage(
  imageUrl?: string | null,
  fallbackUrl: string = DEFAULT_AVATAR_URL,
): string {
  if (!imageUrl || !imageUrl.trim()) {
    return fallbackUrl;
  }

  const trimmed = imageUrl.trim();

  if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
    return trimmed;
  }

  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  try {
    if (isNhostStorageUrl(trimmed)) {
      return getMediaDisplayUrl(trimmed);
    }

    const url = new URL(trimmed);
    if (isAllowedRemoteImageHostname(url.hostname)) {
      return trimmed;
    }
    console.warn(`Remote image hostname not allowed: ${url.hostname}`, { imageUrl: trimmed });
    return fallbackUrl;
  } catch {
    console.warn(`Invalid remote image URL: ${trimmed}`);
    return fallbackUrl;
  }
}

/**
 * Safely get profile image URL with fallback
 * @param imageUrl - The original image URL
 * @param fallbackUrl - Fallback image URL if the original is invalid
 * @returns Safe image URL or fallback
 */
export const getSafeProfileImage = (imageUrl?: string | null, fallbackUrl?: string): string => {
  return getSafeRemoteImage(imageUrl, fallbackUrl || DEFAULT_AVATAR_URL);
};

/** Safe URL for property gallery `next/image` (Nhost storage, etc.). */
export function getSafePropertyGalleryImage(
  imageUrl?: string | null,
  fallbackUrl: string = PROPERTY_IMAGE_PLACEHOLDER,
): string {
  return getSafeRemoteImage(imageUrl, fallbackUrl);
}

/** Gallery URLs for property detail — prefers `uploaded_images`, then display/image fallbacks. */
export function resolvePropertyGalleryImages(property: {
  uploaded_images?: unknown;
  display_image?: unknown;
  image_url?: unknown;
}): string[] {
  const uploaded = parseUploadedImages(property.uploaded_images);

  if (uploaded.length > 0) {
    return uploaded.map((url) => getSafePropertyGalleryImage(url));
  }

  const fallbacks = [property.display_image, property.image_url]
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter(Boolean)
    .map((url) => getSafePropertyGalleryImage(url));

  return fallbacks.length > 0 ? fallbacks : [PROPERTY_IMAGE_PLACEHOLDER];
}

/**
 * Check if an image URL is safe to use with Next.js Image component
 */
export const isImageUrlSafe = (imageUrl?: string | null): boolean => {
  if (!imageUrl?.trim()) return false;

  const trimmed = imageUrl.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('data:')) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return isAllowedRemoteImageHostname(url.hostname);
  } catch {
    return trimmed.startsWith('/') || trimmed.startsWith('./');
  }
};


/**
 * Get the total number of properties (all statuses) created by a user
 * @param landlordUserId - The Nhost user ID of the landlord
 * @returns Promise<number> - The count of all properties (drafts, published, archived, etc.)
 */
export async function getTotalPropertyCount(landlordUserId: string): Promise<number> {
  try {
    const { propertiesAPI } = await import('./api-client');
    
    // Fetch both published properties and drafts in parallel
    const [publishedResponse, draftsResponse] = await Promise.all([
      propertiesAPI.getListings({
        landlord_user_id: landlordUserId,
        limit: 1000
      }),
      propertiesAPI.getDrafts(landlordUserId)
    ]);
    
    let totalCount = 0;
    
    // Count published properties
    if (publishedResponse.success && publishedResponse.data) {
      const publishedProperties = Array.isArray(publishedResponse.data) ? publishedResponse.data : publishedResponse.data.properties || [];
      totalCount += publishedProperties.length;
    }
    
    // Count draft properties
    if (draftsResponse.success && draftsResponse.data) {
      const drafts = Array.isArray(draftsResponse.data) ? draftsResponse.data : [];
      totalCount += drafts.length;
    }
    return totalCount;
    
  } catch (error) {
    console.error('Error getting total property count:', error);
    return 0;
  }
}

/**
 * Get the count of properties with 'published' status for a user
 * @param landlordUserId - The Nhost user ID of the landlord
 * @returns Promise<number> - The count of published properties
 */
export async function getPublishedPropertyCountByStatus(landlordUserId: string): Promise<number> {
  try {
    const { propertiesAPI } = await import('./api-client');
    
    // First try the dedicated API endpoint for published property count
    try {
      const countResponse = await propertiesAPI.getPropertyCountByUser(landlordUserId);
      if (countResponse.success && countResponse.data) {
        console.log('getPublishedPropertyCountByStatus - Using dedicated API, count:', countResponse.data.count);
        return countResponse.data.count || 0;
      }
    } catch (countError) {
      console.warn('Dedicated count API failed, falling back to listings API:', countError);
    }
    
    // Fallback to getListings API if dedicated count API fails
    const response = await propertiesAPI.getListings({
      landlord_user_id: landlordUserId,
      limit: 1000
    });
    
    if (response.success && response.data) {
      const properties = Array.isArray(response.data) ? response.data : response.data.properties || [];
      
      console.log('getPublishedPropertyCountByStatus - All properties from listings:', properties.length);
      console.log('getPublishedPropertyCountByStatus - Property details:', properties.map((p: { id: string; status: string; available: boolean }) => ({ 
        id: p.id, 
        status: p.status, 
        available: p.available 
      })));
      
      // Filter for published properties - use status as single source of truth
      const publishedProperties = properties.filter((property: { status: string; available: boolean }) => 
        property.status === 'published'
      );
      
      console.log('getPublishedPropertyCountByStatus - Published properties after filtering:', publishedProperties.length);
      console.log('getPublishedPropertyCountByStatus - Published property details:', publishedProperties.map((p: { id: string; status: string; available: boolean }) => ({ 
        id: p.id, 
        status: p.status, 
        available: p.available 
      })));
      
      return publishedProperties.length;
    }
    
    console.warn('Failed to get published property count by status:', response.error);
    return 0;
  } catch (error) {
    console.error('Error getting published property count by status:', error);
    return 0;
  }
}

/**
 * Calculate the average rating received by a user from all reviews
 * @param userId - The Nhost user ID of the user
 * @returns Promise<{ averageRating: number; reviewCount: number }> - The average rating and total review count
 */
export async function getAverageUserRating(userId: string): Promise<{ averageRating: number; reviewCount: number }> {
  try {
    const { reviewsAPI } = await import('./api-client');
    
    // Fetch all reviews received by the user (where they are the reviewed user)
    const response = await reviewsAPI.getReviewsByUser({
      userId: userId,
      limit: 1000 // Get all reviews to calculate accurate average
    });
    
    if (response.success && response.data) {
      const reviews = Array.isArray(response.data) ? response.data : [response.data];
      
      // Filter for reviews where the user is the reviewed user (not the reviewer)
      const receivedReviews = reviews.filter((review: { revieweeUserId: string }) =>
        review.revieweeUserId === userId
      );
      
      if (receivedReviews.length === 0) {
        return { averageRating: 0, reviewCount: 0 };
      }
      
      // Calculate average rating
      const totalRating = receivedReviews.reduce((sum: number, review: { rating: number }) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / receivedReviews.length;
      
      return {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: receivedReviews.length
      };
    } else if (response.success && Array.isArray(response.data) && response.data.length === 0) {
      // Handle empty results gracefully
      return { averageRating: 0, reviewCount: 0 };
    }
    
    console.warn('Failed to get user reviews for rating calculation:', response.error);
    return { averageRating: 0, reviewCount: 0 };
  } catch (error) {
    console.error('Error calculating average user rating:', error);
    return { averageRating: 0, reviewCount: 0 };
  }
}

/**
 * Calculate the duration a user has been on the platform
 * @param joinDate - The date the user joined (string or Date)
 * @returns string - Formatted duration (e.g., "2 years", "6 months", "3 days")
 */
export function calculatePlatformDuration(joinDate: string | Date | undefined): string {
  if (!joinDate) {
    return 'Unknown';
  }
  
  try {
    const join = new Date(joinDate);
    const now = new Date();
    
    if (isNaN(join.getTime())) {
      return 'Invalid date';
    }
    
    const diffInMs = now.getTime() - join.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    
    if (diffInYears > 0) {
      return diffInYears === 1 ? '1 year' : `${diffInYears} years`;
    } else if (diffInMonths > 0) {
      return diffInMonths === 1 ? '1 month' : `${diffInMonths} months`;
    } else if (diffInDays > 0) {
      return diffInDays === 1 ? '1 day' : `${diffInDays} days`;
    } else {
      return 'Less than a day';
    }
  } catch (error) {
    console.error('Error calculating platform duration:', error);
    return 'Unknown';
  }
}
