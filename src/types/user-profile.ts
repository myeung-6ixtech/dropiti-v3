// ========================================
// USER PROFILE TYPES
// ========================================

import { Property } from './property';
import { Review } from './review';

// ========================================
// USER PROFILE COMPONENT PROPS
// ========================================

export interface UserListingsProps {
  userFirebaseUid: string;
}

export interface UserReviewsProps {
  userFirebaseUid: string;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiProperty {
  id: string;
  property_uuid: string;
  title: string;
  description: string;
  location: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  imageUrl?: string;
  details?: {
    type: string;
    furnished: string;
    petsAllowed: boolean;
    parking: boolean;
  };
  amenities?: string[];
  availableDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ========================================
// USER PROFILE DATA TRANSFORMATION
// ========================================

export interface UserProfileData {
  properties: Property[];
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
}

// ========================================
// PROPERTY CARD TRANSFORMATION
// ========================================

export interface PropertyCardTransformation extends Property {
  // PropertyCard expects these specific field names
  rental_price: number;
  num_bedroom: number;
  num_bathroom: number;
  display_image: string;
  property_type: string;
}

// ========================================
// REVIEW DISPLAY TYPES
// ========================================

export interface ReviewDisplayData {
  id: string;
  reviewUuid: string;
  reviewerFirebaseUid: string;
  revieweeFirebaseUid: string;
  reviewType: string;
  rating: number;
  title?: string;
  comment?: string;
  offerUuid?: string;
  propertyUuid?: string;
  isPublic: boolean;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    uuid: string;
    displayName: string;
    email: string;
    photoUrl?: string;
  };
  property?: {
    propertyUuid: string;
    title: string;
    location: string;
    rentalPrice: number;
    rentalPriceCurrency: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    photos: string[];
  };
}

// ========================================
// UTILITY TYPES
// ========================================

export type ReviewTypeLabel = 'Landlord Review' | 'Tenant Review' | 'Offer Review' | 'Review';

export interface ReviewTypeMapping {
  [key: string]: ReviewTypeLabel;
}

// ========================================
// CONSTANTS
// ========================================

export const USER_PROFILE_REVIEW_TYPE_LABELS: ReviewTypeMapping = {
  'landlord_review': 'Landlord Review',
  'tenant_review': 'Tenant Review',
  'offer_review': 'Offer Review',
  'tenant_to_landlord': 'Tenant Review',
  'landlord_to_tenant': 'Landlord Review',
};

// ========================================
// API FILTER TYPES
// ========================================

export interface UserListingsFilters {
  landlord_firebase_uid: string;
  limit?: number;
  offset?: number;
}

export interface UserReviewsFilters {
  userFirebaseUid: string;
  reviewType?: string;
  limit?: number;
  offset?: number;
}
