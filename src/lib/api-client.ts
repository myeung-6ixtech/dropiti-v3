import axios from 'axios';
import { PropertyDataForAPI, CreateUserInput, UpdateUserInput } from '@/types';
import type { RealEstateUserRow } from '@/lib/ensureUserProfile';
import {
  CreateReviewInput,
  UpdateReviewInput,
  type Review,
  type ReviewOpportunity,
  type ReviewType,
} from '@/types/review';
import { CreateOfferInput, CounterOfferInput } from '@/types/offer';
import { StandardizedAddress, formatAddressForDatabase } from '@/utils/addressFormatter';
import { nhost } from '@/lib/nhost';
import {
  isRawListingRow,
  normalizeListing,
  normalizeListings,
  mapPropertyDetailResponse,
} from '@/lib/normalize-listing';
import {
  isOfferItemsPayload,
  isRawOfferRow,
  normalizeOffer,
  normalizeOffers,
} from '@/lib/normalize-offer';
import {
  isNotificationItemsPayload,
  isRawNotificationRow,
  normalizeNotification,
  normalizeNotifications,
} from '@/lib/normalize-notification';

function isListingItemsPayload(items: unknown[]): boolean {
  return items.length > 0 && items.some(isRawListingRow);
}

function mapRawOfferToReviewOpportunity(
  offer: Record<string, unknown>,
  userId: string,
): ReviewOpportunity {
  const isInitiator = offer.initiator_user_id === userId;
  return {
    id: String(offer.id ?? ''),
    offerId: String(offer.offerId ?? offer.id ?? ''),
    offerUuid: String(offer.offerUuid ?? offer.offer_uuid ?? offer.offer_key ?? offer.id ?? ''),
    propertyUuid: String(offer.propertyUuid ?? offer.property_uuid ?? ''),
    propertyTitle: String(offer.propertyTitle ?? 'Property'),
    otherPartyName: String(offer.otherPartyName ?? 'Unknown User'),
    otherPartyPhotoUrl: offer.otherPartyPhotoUrl as string | undefined,
    otherPartyId: String(
      offer.otherPartyId ??
        (isInitiator ? offer.recipient_user_id : offer.initiator_user_id) ??
        '',
    ),
    reviewType:
      (offer.reviewType as ReviewOpportunity['reviewType']) ??
      (isInitiator ? 'tenant_to_landlord' : 'landlord_to_tenant'),
    reviewWindowEnd: String(
      offer.reviewWindowEnd ?? offer.review_window_end ?? offer.updated_at ?? new Date().toISOString(),
    ),
    status: String(offer.status ?? 'pending'),
  };
}

function parseReviewOpportunitiesData(data: unknown, userId: string): ReviewOpportunity[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((row) => {
      if (typeof row !== 'object' || row === null) return mapRawOfferToReviewOpportunity({}, userId);
      const record = row as Record<string, unknown>;
      if ('propertyTitle' in record && 'reviewWindowEnd' in record) {
        return record as unknown as ReviewOpportunity;
      }
      return mapRawOfferToReviewOpportunity(record, userId);
    });
  }
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.opportunities)) {
      return parseReviewOpportunitiesData(obj.opportunities, userId);
    }
    if (Array.isArray(obj.items)) {
      return parseReviewOpportunitiesData(obj.items, userId);
    }
  }
  return [];
}

function mapRawReviewRow(row: Record<string, unknown>): Review {
  const createdAt = String(row.createdAt ?? row.created_at ?? new Date().toISOString());
  return {
    id: String(row.id ?? row.review_uuid ?? ''),
    reviewUuid: String(row.reviewUuid ?? row.review_uuid ?? row.id ?? ''),
    reviewerUserId: String(row.reviewerUserId ?? row.reviewer_user_id ?? ''),
    revieweeUserId: String(row.revieweeUserId ?? row.reviewee_user_id ?? ''),
    reviewType: (row.reviewType ?? row.review_type ?? 'offer_review') as ReviewType,
    rating: Number(row.rating ?? 0),
    title: (row.title as string | undefined) ?? undefined,
    comment: (row.comment as string | undefined) ?? undefined,
    offerUuid: (row.offerUuid ?? row.offer_uuid) as string | undefined,
    propertyUuid: (row.propertyUuid ?? row.property_uuid) as string | undefined,
    isPublic: Boolean(row.isPublic ?? row.is_public ?? true),
    isVerified: Boolean(row.isVerified ?? row.is_verified ?? false),
    helpfulCount: Number(row.helpfulCount ?? row.helpful_count ?? 0),
    createdAt,
    updatedAt: String(row.updatedAt ?? row.updated_at ?? createdAt),
    reviewer: (row.reviewer as Review['reviewer']) ?? undefined,
    reviewee: (row.reviewee as Review['reviewee']) ?? undefined,
    property: (row.property as Review['property']) ?? undefined,
  };
}

function parseReviewsByUserData(data: unknown): Review[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((row) => {
      if (typeof row !== 'object' || row === null) return mapRawReviewRow({});
      const record = row as Record<string, unknown>;
      if ('reviewUuid' in record && 'createdAt' in record) {
        return record as unknown as Review;
      }
      return mapRawReviewRow(record);
    });
  }
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      return parseReviewsByUserData(obj.items);
    }
  }
  return [];
}

// All requests route via BFF → Nhost Functions
const apiClient = axios.create({
  baseURL: '/api/v1/bff/functions/client',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    // Axios interprets a leading slash as an absolute path, bypassing baseURL.
    // Strip any accidental leading slashes so all paths are relative to baseURL.
    if (config.url?.startsWith('/')) {
      config.url = config.url.slice(1);
    }
    if (typeof window !== 'undefined') {
      const token = nhost.auth.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as Record<string, unknown> | undefined;
    if (body && typeof body === 'object' && 'ok' in body) {
      if (body.ok === true) {
        const data = body.data as Record<string, unknown> | unknown;
        if (data && typeof data === 'object' && 'items' in (data as object)) {
          const wrapped = data as { items: unknown[]; pagination?: unknown };
          const items = Array.isArray(wrapped.items) ? wrapped.items : [];
          if (isListingItemsPayload(items)) {
            response.data = {
              success: true,
              data: normalizeListings(items),
              pagination: wrapped.pagination,
            };
          } else if (isOfferItemsPayload(items)) {
            response.data = {
              success: true,
              data: normalizeOffers(items),
              pagination: wrapped.pagination,
            };
          } else if (isNotificationItemsPayload(items)) {
            response.data = {
              success: true,
              data: normalizeNotifications(items),
              pagination: wrapped.pagination,
            };
          } else {
            response.data = {
              success: true,
              data: items,
              pagination: wrapped.pagination,
            };
          }
        } else if (
          data &&
          typeof data === 'object' &&
          'property' in (data as object) &&
          typeof (data as { property?: unknown }).property === 'object'
        ) {
          response.data = { success: true, data: body.data };
        } else if (isRawListingRow(data)) {
          response.data = { success: true, data: normalizeListing(data) };
        } else if (isRawOfferRow(data)) {
          response.data = { success: true, data: normalizeOffer(data) };
        } else if (isRawNotificationRow(data)) {
          response.data = { success: true, data: normalizeNotification(data) };
        } else {
          response.data = { success: true, data: body.data };
        }
      } else if (body.ok === false) {
        return Promise.reject(
          Object.assign(new Error(String(body.error ?? 'Request failed')), {
            response: { ...response, data: { success: false, error: body.error } },
          })
        );
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
    }
    return Promise.reject(error);
  }
);

// Helper function to transform PropertyData to API format
const transformPropertyData = async (propertyData: PropertyDataForAPI, ownerId: string, isDraft: boolean = false) => {
  // Use the utility function to ensure consistent address structure
  const addressObject = formatAddressForDatabase(propertyData.address);

  // Build a human-readable location string for display purposes
  const addressParts = [];
  if (propertyData.address?.building) addressParts.push(propertyData.address.building);
  if (propertyData.address?.addressLine1) addressParts.push(propertyData.address.addressLine1);
  if (propertyData.address?.addressLine2) addressParts.push(propertyData.address.addressLine2);
  if (propertyData.address?.district) addressParts.push(propertyData.address.district);
  if (propertyData.address?.state) addressParts.push(propertyData.address.state);
  if (propertyData.address?.country) addressParts.push(propertyData.address.country);
  
  const location = addressParts.join(', ');

  // Build details object
  const details: Record<string, unknown> = {
    propertyType: propertyData.propertyType,
    residentialType: propertyData.residentialType,
    rentalSpace: propertyData.rentalSpace,
    unit: propertyData.address?.unit,
    floor: propertyData.address?.floor,
    block: propertyData.address?.block,
    building: propertyData.address?.building,
    grossArea: propertyData.unitDetails?.grossArea,
    netArea: propertyData.unitDetails?.netArea,
    furnished: propertyData.unitDetails?.furnished,
    petsAllowed: propertyData.unitDetails?.petsAllowed,
  };

  // Handle photo uploads
  let imageUrl = '';
  if (propertyData.photos && propertyData.photos.length > 0) {
    // Photos are already uploaded to S3, use the first one as main image
    imageUrl = propertyData.photos[0] || '';
    
    // Store all photo URLs in details for future use
    details.photoUrls = propertyData.photos;
  }

  return {
    title: propertyData.rentalDetails?.listingName || 'Property Listing',
    description: propertyData.rentalDetails?.listingDescription || 'Property description',
    location, // Human-readable string for display
    address: addressObject, // Structured JSON object for search
    price: propertyData.rentalDetails?.rentalPrice || 0,
    bedrooms: propertyData.unitDetails?.bedrooms || 0,
    bathrooms: propertyData.unitDetails?.bathrooms || 0,
    imageUrl,
    photos: propertyData.photos || [], // Pass photos array to API
    details,
    rules: [], // Can be added in future steps
    amenities: propertyData.amenities || [],
    minimumLease: 12, // Default to 12 months
    availableDate: propertyData.rentalDetails?.availableDate 
      ? new Date(propertyData.rentalDetails.availableDate).toISOString()
      : null,
    ownerId,
    isDraft, // Include draft flag
  };
};

// Properties API
export const propertiesAPI = {
  // Get all properties with filters and pagination
  getListings: async (params?: {
    limit?: number;
    offset?: number;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    type?: string;
    landlord_user_id?: string; // Add landlord filter parameter
  }) => {
    const response = await apiClient.get('/properties/get-listings', { params });
    return response.data;
  },

  // Get a single property by ID
  getProperty: async (id: string) => {
    const response = await apiClient.get('/properties/get-property', { 
      params: { id } 
    });
    return response.data;
  },

  // Get a single property by UUID
  getPropertyByUuid: async (propertyUuid: string) => {
    if (!propertyUuid) {
      throw new Error('Property UUID is required');
    }
    
    if (typeof propertyUuid !== 'string') {
      throw new Error('Property UUID must be a string');
    }
    
    try {
      const response = await apiClient.get('properties/get-property-by-uuid', { params: { uuid: propertyUuid } });
      const body = response.data as Record<string, unknown>;
      const payload =
        body?.success === true ? body.data : body?.data ?? body;
      const detail = mapPropertyDetailResponse(payload);
      if (detail) {
        return { success: true, data: detail };
      }
      if (body?.success === false) {
        return {
          success: false,
          error: String(body.error ?? 'Failed to load property'),
        };
      }
      return {
        success: false,
        error: 'Invalid property response',
      };
    } catch (error) {
      console.error('Error fetching property by UUID:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as { response?: { data?: unknown; status?: number } })?.response?.data,
        status: (error as { response?: { data?: unknown; status?: number } })?.response?.status,
        config: (error as { config?: unknown })?.config
      });
      throw error;
    }
  },

  // Create a new property (supports drafts)
  createProperty: async (propertyData: PropertyDataForAPI, ownerId: string, isDraft: boolean = false) => {
    const transformedData = await transformPropertyData(propertyData, ownerId);
    transformedData.isDraft = isDraft;
    
    const response = await apiClient.post('/properties/create-property', transformedData);
    return response.data;
  },

  // Update an existing property — PATCH with flat body { property_uuid, ...updates }
  updateProperty: async (id: string, updates: {
    title?: string;
    description?: string;
    address?: StandardizedAddress;
    property_type?: string;
    rental_space?: string;
    num_bedroom?: number;
    num_bathroom?: number;
    gross_area_size?: number;
    gross_area_size_unit?: string;
    furnished?: string;
    pets_allowed?: boolean;
    amenities?: string[];
    display_image?: string;
    uploaded_images?: string[];
    rental_price?: number;
    rental_price_currency?: string;
    availability_date?: string | null;
    status?: string;
    photos?: string[]; // For backward compatibility
  }) => {
    const response = await apiClient.patch('properties/update-property', { property_uuid: id, ...updates });
    return response.data;
  },

  // Get user's drafts — JWT-scoped, no landlordId needed
  getDrafts: async (_landlordId?: string) => {
    const response = await apiClient.get('properties/get-drafts');
    return response.data;
  },

  // Publish draft
  publishDraft: async (propertyUuid: string) => {
    const response = await apiClient.post('properties/publish-draft', { property_uuid: propertyUuid });
    return response.data;
  },

  // Delete draft
  deleteDraft: async (propertyUuid: string) => {
    const response = await apiClient.delete('properties/delete-draft', { params: { property_uuid: propertyUuid } });
    return response.data;
  },

  // Update property status
  updatePropertyStatus: async (propertyUuid: string, status: 'draft' | 'published' | 'archived' | 'expired') => {
    return propertiesAPI.updateProperty(propertyUuid, { status });
  },

  // Publish property (set to published status)
  publishProperty: async (propertyUuid: string) => {
    return propertiesAPI.updatePropertyStatus(propertyUuid, 'published');
  },

  // Unpublish property (set to draft status)
  unpublishProperty: async (propertyUuid: string) => {
    return propertiesAPI.updatePropertyStatus(propertyUuid, 'draft');
  },

  // Get total count of published properties by user — JWT-scoped
  getPropertyCountByUser: async (_landlordUserId?: string) => {
    try {
      const response = await apiClient.get('properties/get-property-count-by-user');
      return response.data;
    } catch (error) {
      console.error("Get property count by user error:", error);
      throw error;
    }
  },
};

/**
 * Normalise a raw user row coming from either:
 *   - Legacy v3 Next route:  { success: true, data: RealEstateUserRow }
 *   - Nhost Functions (after interceptor unwrap): { success: true, data: <row> }
 */
function parseUserProfileResponse(body: unknown):
  | { success: true; data: RealEstateUserRow }
  | { success: false; notFound: true }
  | { success: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Empty response' };
  }
  const b = body as Record<string, unknown>;
  if (b.success === true && b.data && typeof b.data === 'object') {
    return { success: true, data: b.data as RealEstateUserRow };
  }
  if (b.success === false) {
    const msg = (b.error as string | undefined) ?? 'Failed to retrieve user';
    return { success: false, error: msg };
  }
  // Direct row object (no success wrapper — older interceptor path)
  if ('nhost_user_id' in b || 'uuid' in b) {
    return { success: true, data: b as unknown as RealEstateUserRow };
  }
  return { success: false, error: 'Unexpected response shape' };
}

function normalizeUserApiResult(
  parsed:
    | { success: true; data: RealEstateUserRow }
    | { success: false; notFound: true }
    | { success: false; error: string },
): { success: boolean; data?: RealEstateUserRow; error?: string; notFound?: boolean } {
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }
  if ('notFound' in parsed && parsed.notFound) {
    return { success: false, notFound: true };
  }
  if ('error' in parsed) {
    return { success: false, error: parsed.error };
  }
  return { success: false };
}

// Users API
export const usersAPI = {
  // Create a new user
  createUser: async (userData: CreateUserInput) => {
    try {
      const response = await apiClient.post('/users/create-user', userData);
      return normalizeUserApiResult(parseUserProfileResponse(response.data));
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data?: { error?: string }; status: number } };
        // User already exists — treat as recoverable
        if (axiosError.response.status === 409) {
          return { success: false, error: axiosError.response.data?.error, conflict: true as const };
        }
      }
      console.error('Create user error:', error);
      throw error;
    }
  },

  /** Lookup by Nhost auth id (`real_estate_user.nhost_user_id`). Used for session + `/user/[id]`. */
  getUserByNhostUserId: async (
    nhostUserId: string,
  ): Promise<
    | { success: true; data: RealEstateUserRow }
    | { success: false; notFound: true }
    | { success: false; error: string; unauthorized?: boolean }
  > => {
    try {
      const response = await apiClient.get('/users/get-user-by-id', {
        params: { nhost_user_id: nhostUserId },
      });
      return parseUserProfileResponse(response.data);
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data?: { error?: string; ok?: boolean }; status: number } };
        if (axiosError.response.status === 404) {
          return { success: false, notFound: true };
        }
        if (axiosError.response.status === 401) {
          return { success: false, error: 'Unauthorized', unauthorized: true };
        }
        return {
          success: false,
          error: axiosError.response.data?.error || 'Failed to retrieve user',
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve user',
      };
    }
  },

  // Get user by numeric Hasura PK (legacy / admin use)
  getUserById: async (userId: string) => {
    try {
      const response = await apiClient.get('/users/get-user-by-id', {
        params: { id: userId },
      });
      return parseUserProfileResponse(response.data);
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  // Update user profile — flat PATCH body, JWT-scoped
  updateUser: async (_userId: string, updates: UpdateUserInput) => {
    try {
      const body: Record<string, unknown> = { ...updates };
      if (Array.isArray(body.languages)) {
        body.languages = JSON.stringify(body.languages);
      }
      for (const key of ['preferences', 'notification_settings', 'privacy_settings'] as const) {
        if (body[key] && typeof body[key] === 'object') {
          body[key] = JSON.stringify(body[key]);
        }
      }
      const response = await apiClient.patch('/users/update-user', body);
      const parsed = parseUserProfileResponse(response.data);
      if (parsed.success) {
        return { success: true as const, data: parsed.data };
      }
      return {
        success: false as const,
        error: 'error' in parsed ? parsed.error : 'Failed to update user',
      };
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Delete user (soft delete)
  deleteUser: async (userId: string) => {
    try {
      const response = await apiClient.delete('/users/delete-user', {
        params: { id: userId },
      });
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },
};

// Tenants API — BFF → Nhost `client/tenants` + `client/tenants/profile` when FUNCTIONS_URL is set
export const tenantsAPI = {
  /** JWT user's own profile (api-doc-v2: GET without `nhost_user_id`). */
  getMyTenantProfile: async () => {
    const response = await apiClient.get('/tenants/profile');
    return response.data;
  },
  /** Profile by Nhost auth id (`real_estate_tenant_profile.user_id`). */
  getTenantProfile: async (nhostUserId: string) => {
    const response = await apiClient.get('/tenants/profile', {
      params: { nhost_user_id: nhostUserId },
    });
    return response.data;
  },
  upsertTenantProfile: async (
    payload: Record<string, unknown> & { user_nhost_user_id: string },
  ) => {
    const { user_nhost_user_id, tenant_privacy_settings, privacy_settings, ...rest } =
      payload;
    const body: Record<string, unknown> = {
      ...rest,
      user_nhost_user_id,
      privacy_settings: privacy_settings ?? tenant_privacy_settings ?? {},
    };
    const response = await apiClient.post('/tenants/profile', body);
    return response.data;
  },
  updateTenantProfile: async (_nhostUserId: string, updates: Record<string, unknown>) => {
    const { tenant_privacy_settings, privacy_settings, ...rest } = updates;
    const body: Record<string, unknown> = {
      ...rest,
      ...(privacy_settings !== undefined || tenant_privacy_settings !== undefined
        ? { privacy_settings: privacy_settings ?? tenant_privacy_settings }
        : {}),
    };
    const response = await apiClient.patch('tenants/profile', body);
    return response.data;
  },
  getTenantProfiles: async (
    params: {
      limit?: number;
      offset?: number;
      budget_min?: string;
      budget_max?: string;
      location?: string;
      move_in_date?: string;
      property_type?: string;
      status?: string;
    } = {},
  ) => {
    const response = await apiClient.get('/tenants', { params });
    return response.data;
  },
};

// Offers API
export const offersAPI = {
  // Create a new offer
  createOffer: async (offerData: CreateOfferInput) => {
    try {
      const response = await apiClient.post('/offers/create-offer', offerData);
      return response.data;
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  },

  // Get offers by recipient (landlord)
  getOffersByRecipient: async (recipientUserId: string, propertyUuid?: string) => {
    try {
      const params: Record<string, string> = { recipientUserId };
      if (propertyUuid) params.propertyUuid = propertyUuid;
      const response = await apiClient.get('offers/get-offers-by-id', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching offers by recipient:', error);
      throw error;
    }
  },

  // Get offers by initiator (tenant)
  getOffersByInitiator: async (initiatorUserId: string) => {
    try {
      const response = await apiClient.get('offers/get-offers-by-initiator', { params: { initiatorUserId } });
      return response.data;
    } catch (error) {
      console.error('Error fetching offers by initiator:', error);
      throw error;
    }
  },

  // Accept an offer
  acceptOffer: async (offerId: string, currentUserId: string) => {
    try {
      const response = await apiClient.post('/offers/accept-offer', {
        offerId,
        currentUserId
      });
      return response.data;
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  },

  // Reject an offer
  rejectOffer: async (offerId: string, currentUserId: string, reason?: string) => {
    try {
      const response = await apiClient.post('/offers/reject-offer', {
        offerId,
        currentUserId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting offer:', error);
      throw error;
    }
  },

  // Counter an offer
  counterOffer: async (offerId: string, currentUserId: string, counterData: CounterOfferInput) => {
    try {
      const response = await apiClient.post('/offers/counter-offer', {
        offerId,
        currentUserId,
        counterData
      });
      return response.data;
    } catch (error) {
      console.error('Error countering offer:', error);
      throw error;
    }
  },

  // Withdraw an offer
  withdrawOffer: async (offerId: string, currentUserId: string, reason?: string) => {
    try {
      const response = await apiClient.post('/offers/withdraw-offer', {
        offerId,
        currentUserId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      throw error;
    }
  },

  // Get offer action history
  getOfferActions: async (offerId: string) => {
    try {
      const response = await apiClient.get('offers/get-offer-actions', { params: { offerId } });
      return response.data;
    } catch (error) {
      console.error('Error fetching offer actions:', error);
      throw error;
    }
  },

  // Get review opportunities for a user
  getReviewOpportunities: async (userId: string) => {
    try {
      const response = await apiClient.get('/offers/get-review-opportunities', {
        params: { user_id: userId },
      });
      const body = response.data as { success?: boolean; data?: unknown; error?: string };
      const opportunities = parseReviewOpportunitiesData(body?.data, userId);
      return {
        success: body?.success !== false,
        data: { opportunities },
        error: body?.error,
      };
    } catch (error) {
      console.error('Error fetching review opportunities:', error);
      throw error;
    }
  },

  // Create a review
  createReview: async (reviewData: {
    offerId: string;
    offerUuid: string;
    reviewType: string;
    rating: number;
    comment: string;
    reviewerId: string;
    revieweeUserId: string;
    propertyUuid: string;
  }) => {
    try {
      const response = await apiClient.post('/reviews/create-review', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get negotiation state
  getNegotiationState: async (offerId: string, currentUserId: string) => {
    try {
      const response = await apiClient.get('offers/get-negotiation-state', { params: { offerId, currentUserId } });
      return response.data;
    } catch (error) {
      console.error('Error fetching negotiation state:', error);
      throw error;
    }
  },
};

// Notifications API — all JWT-scoped; userId params accepted for backwards-compat but ignored by Nhost
export const notificationsAPI = {
  getNotifications: async (_userId?: string, filters?: {
    isRead?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      const params: Record<string, string | number> = {};
      if (filters?.isRead !== undefined) params.isRead = filters.isRead.toString();
      if (filters?.category) params.category = filters.category;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;
      const response = await apiClient.get('notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  getUnreadCount: async (_userId?: string) => {
    try {
      const response = await apiClient.get('notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await apiClient.post('notifications/mark-read', { notificationId });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async (_userId?: string) => {
    try {
      const response = await apiClient.post('notifications/mark-all-read', {});
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  archiveNotification: async (notificationId: string) => {
    try {
      const response = await apiClient.post('notifications/archive', { notificationId });
      return response.data;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  },
};

// Reviews API
export const reviewsAPI = {
  // Create a new review
  createReview: async (reviewData: CreateReviewInput) => {
    try {
      console.log('API Client: Creating review:', reviewData);
      const response = await apiClient.post('/reviews/create-review', reviewData);
      console.log('API Client: Review creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Client: Create review error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
      }
      throw error;
    }
  },

  // Get reviews by user (either as reviewer or reviewed)
  getReviewsByUser: async (params: {
    userId: string;
    reviewType?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      console.log('API Client: Fetching reviews for user:', params);
      const response = await apiClient.get('/reviews/get-reviews-by-user', { params });
      const body = response.data as {
        success?: boolean;
        data?: unknown;
        total?: number;
        message?: string;
        error?: string;
      };
      const reviews = parseReviewsByUserData(body?.data);
      console.log('API Client: Reviews response:', { count: reviews.length });
      return {
        success: body?.success !== false,
        data: reviews,
        total: body?.total ?? reviews.length,
        message: body?.message,
        error: body?.error,
      };
    } catch (error) {
      console.error('API Client: Get reviews by user error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
        
        // If it's a 500 error, return empty results instead of throwing
        if (axiosError.response.status === 500) {
          console.warn('API Client: Returning empty results due to 500 error (likely empty database)');
          return {
            success: true,
            data: [],
            total: 0,
            message: 'No reviews found for this user'
          };
        }
      }
      throw error;
    }
  },

  // Get reviews by property
  getReviewsByProperty: async (params: {
    propertyUuid: string;
    reviewType?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      console.log('API Client: Fetching reviews for property:', params);
      const response = await apiClient.get('/reviews/get-reviews-by-property', { params });
      console.log('API Client: Property reviews response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Client: Get reviews by property error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
        
        // If it's a 500 error, return empty results instead of throwing
        if (axiosError.response.status === 500) {
          console.warn('API Client: Returning empty results due to 500 error (likely empty database)');
          return {
            success: true,
            data: [],
            total: 0,
            message: 'No reviews found for this property'
          };
        }
      }
      throw error;
    }
  },

  /** Update a review — PATCH body { reviewId: number, ...updateData } */
  updateReview: async (reviewId: string | number, updateData: UpdateReviewInput) => {
    try {
      const response = await apiClient.patch('reviews/update-review', {
        reviewId: parseInt(String(reviewId), 10),
        ...updateData,
      });
      return response.data;
    } catch (error) {
      console.error('API Client: Update review error:', error);
      throw error;
    }
  },

  /** Delete a review — DELETE ?reviewId=<number> */
  deleteReview: async (reviewId: string | number) => {
    try {
      const response = await apiClient.delete('reviews/delete-review', {
        params: { reviewId: parseInt(String(reviewId), 10) },
      });
      return response.data;
    } catch (error) {
      console.error('API Client: Delete review error:', error);
      throw error;
    }
  },

  /** Mark a review as helpful — POST body { reviewId: number } */
  markReviewHelpful: async (reviewId: string | number) => {
    try {
      const response = await apiClient.post('reviews/mark-helpful', {
        reviewId: parseInt(String(reviewId), 10),
      });
      return response.data;
    } catch (error) {
      console.error('API Client: Mark review helpful error:', error);
      throw error;
    }
  },
};

export default apiClient;
