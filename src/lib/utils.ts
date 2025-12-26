/**
 * Utility functions for the Dropiti application
 */

import { twMerge } from 'tailwind-merge';

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
    return fallbackUrl || '/images/Portrait_Placeholder.png';
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
      'placehold.co',
      // S3 and cloud storage hostnames
      's3.amazonaws.com',
      's3.us-east-1.amazonaws.com',
      's3.us-west-1.amazonaws.com',
      's3.us-west-2.amazonaws.com',
      's3.eu-west-1.amazonaws.com',
      's3.eu-central-1.amazonaws.com',
      's3.ap-southeast-1.amazonaws.com',
      's3.ap-northeast-1.amazonaws.com',
      's3.ap-south-1.amazonaws.com',
      // Generic S3 patterns
      '*.amazonaws.com',
      // Other cloud providers
      'storage.googleapis.com',
      'firebasestorage.googleapis.com',
      'blob.core.windows.net',
      'cdn.digitaloceanspaces.com',
      'nyc3.digitaloceanspaces.com',
      'fra1.digitaloceanspaces.com',
      'sgp1.digitaloceanspaces.com'
    ];

    // Check if the hostname is in the allowed list
    if (allowedHostnames.includes(url.hostname)) {
      return imageUrl;
    }

    // Check for S3-like patterns (bucket-name.s3.region.amazonaws.com)
    if (url.hostname.includes('.s3.') && url.hostname.includes('.amazonaws.com')) {
      return imageUrl;
    }

    // Check for DigitalOcean Spaces patterns
    if (url.hostname.includes('.digitaloceanspaces.com')) {
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

    // For other external URLs, log and return fallback
    console.warn(`Profile image hostname not allowed: ${url.hostname}`, { imageUrl });
    return fallbackUrl || '/images/Portrait_Placeholder.png';
  } catch (error) {
    // If URL parsing fails, it might be a relative path
    if (imageUrl.startsWith('/') || imageUrl.startsWith('./')) {
      return imageUrl;
    }
    
    // Log the error for debugging
    console.warn(`Invalid profile image URL: ${imageUrl}`, { error });
    return fallbackUrl || '/images/Portrait_Placeholder.png';
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
      'placehold.co',
      // S3 and cloud storage hostnames
      's3.amazonaws.com',
      's3.us-east-1.amazonaws.com',
      's3.us-west-1.amazonaws.com',
      's3.us-west-2.amazonaws.com',
      's3.eu-west-1.amazonaws.com',
      's3.eu-central-1.amazonaws.com',
      's3.ap-southeast-1.amazonaws.com',
      's3.ap-northeast-1.amazonaws.com',
      's3.ap-south-1.amazonaws.com',
      // Other cloud providers
      'storage.googleapis.com',
      'firebasestorage.googleapis.com',
      'blob.core.windows.net',
      'cdn.digitaloceanspaces.com',
      'nyc3.digitaloceanspaces.com',
      'fra1.digitaloceanspaces.com',
      'sgp1.digitaloceanspaces.com'
    ];

    // Check if the hostname is in the allowed list
    if (allowedHostnames.includes(url.hostname)) {
      return true;
    }

    // Check for S3-like patterns (bucket-name.s3.region.amazonaws.com)
    if (url.hostname.includes('.s3.') && url.hostname.includes('.amazonaws.com')) {
      return true;
    }

    // Check for DigitalOcean Spaces patterns
    if (url.hostname.includes('.digitaloceanspaces.com')) {
      return true;
    }

    return url.hostname === 'localhost' || 
           url.hostname === '127.0.0.1' || 
           url.protocol === 'data:' ||
           !url.hostname; // Relative paths
  } catch {
    // If URL parsing fails, it might be a relative path
    return imageUrl.startsWith('/') || imageUrl.startsWith('./');
  }
};


/**
 * Get the total number of properties (all statuses) created by a user
 * @param landlordFirebaseUid - The Firebase UID of the landlord
 * @returns Promise<number> - The count of all properties (drafts, published, archived, etc.)
 */
export async function getTotalPropertyCount(landlordFirebaseUid: string): Promise<number> {
  try {
    const { propertiesAPI } = await import('./api-client');
    
    // Fetch both published properties and drafts in parallel
    const [publishedResponse, draftsResponse] = await Promise.all([
      propertiesAPI.getListings({
        landlord_firebase_uid: landlordFirebaseUid,
        limit: 1000
      }),
      propertiesAPI.getDrafts(landlordFirebaseUid)
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
 * @param landlordFirebaseUid - The Firebase UID of the landlord
 * @returns Promise<number> - The count of published properties
 */
export async function getPublishedPropertyCountByStatus(landlordFirebaseUid: string): Promise<number> {
  try {
    const { propertiesAPI } = await import('./api-client');
    
    // First try the dedicated API endpoint for published property count
    try {
      const countResponse = await propertiesAPI.getPropertyCountByUser(landlordFirebaseUid);
      if (countResponse.success && countResponse.data) {
        console.log('getPublishedPropertyCountByStatus - Using dedicated API, count:', countResponse.data.count);
        return countResponse.data.count || 0;
      }
    } catch (countError) {
      console.warn('Dedicated count API failed, falling back to listings API:', countError);
    }
    
    // Fallback to getListings API if dedicated count API fails
    const response = await propertiesAPI.getListings({
      landlord_firebase_uid: landlordFirebaseUid,
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
 * @param userFirebaseUid - The Firebase UID of the user
 * @returns Promise<{ averageRating: number; reviewCount: number }> - The average rating and total review count
 */
export async function getAverageUserRating(userFirebaseUid: string): Promise<{ averageRating: number; reviewCount: number }> {
  try {
    const { reviewsAPI } = await import('./api-client');
    
    // Fetch all reviews received by the user (where they are the reviewed user)
    const response = await reviewsAPI.getReviewsByUser({
      userFirebaseUid: userFirebaseUid,
      limit: 1000 // Get all reviews to calculate accurate average
    });
    
    if (response.success && response.data) {
      const reviews = Array.isArray(response.data) ? response.data : [response.data];
      
      // Filter for reviews where the user is the reviewed user (not the reviewer)
      const receivedReviews = reviews.filter((review: { revieweeFirebaseUid: string }) => 
        review.revieweeFirebaseUid === userFirebaseUid
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
