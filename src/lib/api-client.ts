import axios from 'axios';
import { PropertyDataForAPI, CreateUserInput, User } from '@/types';
import { CreateReviewInput, UpdateReviewInput } from '@/types/review';
import { CreateOfferInput, CounterOfferInput } from '@/types/offer';
import { StandardizedAddress, formatAddressForDatabase } from '@/utils/addressFormatter';

// Base API configuration
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // You can add authentication headers here
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // Redirect to login or refresh token
    }
    return Promise.reject(error);
  }
);

// Helper function to transform PropertyData to API format
const transformPropertyData = async (propertyData: PropertyDataForAPI, ownerId: string) => {
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
    details,
    rules: [], // Can be added in future steps
    amenities: propertyData.amenities || [],
    minimumLease: 12, // Default to 12 months
    availableDate: propertyData.rentalDetails?.availableDate 
      ? new Date(propertyData.rentalDetails.availableDate).toISOString()
      : null,
    ownerId,
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
    landlord_firebase_uid?: string; // Add landlord filter parameter
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
    const response = await apiClient.get('/properties/get-property-by-uuid', { 
      params: { property_uuid: propertyUuid } 
    });
    return response.data;
  },

  // Create a new property
  createProperty: async (propertyData: PropertyDataForAPI, ownerId: string) => {
    const transformedData = await transformPropertyData(propertyData, ownerId);
    const response = await apiClient.post('/properties/create-property', transformedData);
    return response.data;
  },

  // Update an existing property
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
    is_public?: boolean;
    photos?: string[]; // For backward compatibility
  }) => {
    const response = await apiClient.put('/properties/update-property', { id, updates });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  // Create a new user
  createUser: async (userData: CreateUserInput) => {
    try {
      const response = await apiClient.post('/users/create-user', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // Get user by Firebase UID
  getUserByFirebaseUid: async (firebaseUid: string) => {
    try {
      console.log('API Client: Fetching user by Firebase UID:', firebaseUid);
      const response = await apiClient.get('/users/get-user-by-id', { 
        params: { firebase_uid: firebaseUid } 
      });
      console.log('API Client: Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get user by Firebase UID error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
      }
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: string) => {
    try {
      const response = await apiClient.get('/users/get-user-by-id', { 
        params: { id: userId } 
      });
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  // Get user by UUID
  getUserByUuid: async (userUuid: string) => {
    try {
      console.log('API Client: Fetching user by UUID:', userUuid);
      const response = await apiClient.get('/users/get-user-by-uuid', { 
        params: { uuid: userUuid } 
      });
      console.log('API Client: Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get user by UUID error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
      }
      throw error;
    }
  },

  // Update user profile
  updateUser: async (userId: string, updates: Partial<User>) => {
    try {
      console.log('API Client: Updating user:', userId, 'with updates:', updates);
      const response = await apiClient.put('/users/update-user', { id: userId, updates });
      console.log('API Client: Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
      }
      throw error;
    }
  },

  // Delete user (soft delete)
  deleteUser: async (userId: string) => {
    try {
      const response = await apiClient.delete('/users/delete-user', { 
        params: { id: userId } 
      });
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
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
      console.error('Error creating offer:', error);
      throw error;
    }
  },

  // Get offers by recipient (landlord)
  getOffersByRecipient: async (recipientFirebaseUid: string, propertyUuid?: string) => {
    try {
      const url = propertyUuid 
        ? `/offers/get-offers-by-id?recipientFirebaseUid=${recipientFirebaseUid}&propertyUuid=${propertyUuid}`
        : `/offers/get-offers-by-id?recipientFirebaseUid=${recipientFirebaseUid}`;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching offers by recipient:', error);
      throw error;
    }
  },

  // Get offers by initiator (tenant)
  getOffersByInitiator: async (initiatorFirebaseUid: string) => {
    try {
      const response = await apiClient.get(`/offers/get-offers-by-initiator?initiatorFirebaseUid=${initiatorFirebaseUid}`);
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
      const response = await apiClient.get(`/offers/get-offer-actions?offerId=${offerId}`);
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
        params: { user_id: userId } 
      });
      return response.data;
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
    reviewedUserId: string;
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
      const response = await apiClient.get(`/offers/get-negotiation-state?offerId=${offerId}&currentUserId=${currentUserId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching negotiation state:', error);
      throw error;
    }
  },
};

// Search API (placeholder for future endpoints)
export const searchAPI = {
  // Search properties with advanced filters
      searchProperties: async (searchParams: {
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      bedrooms?: number;
      type?: string;
      limit?: number;
      offset?: number;
    }) => {
    const response = await apiClient.post('/search/properties', searchParams);
    return response.data;
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
    userFirebaseUid: string;
    reviewType?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      console.log('API Client: Fetching reviews for user:', params);
      const response = await apiClient.get('/reviews/get-reviews-by-user', { params });
      console.log('API Client: Reviews response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Client: Get reviews by user error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
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
      }
      throw error;
    }
  },

  // Update a review
  updateReview: async (reviewUuid: string, updateData: UpdateReviewInput) => {
    try {
      console.log('API Client: Updating review:', { reviewUuid, updateData });
      const response = await apiClient.put(`/reviews/update-review?reviewUuid=${reviewUuid}`, updateData);
      console.log('API Client: Review update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Client: Update review error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
      }
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewUuid: string) => {
    try {
      console.log('API Client: Deleting review:', reviewUuid);
      const response = await apiClient.delete(`/reviews/delete-review?reviewUuid=${reviewUuid}`);
      console.log('API Client: Review deletion response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Client: Delete review error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
      }
      throw error;
    }
  },

  // Mark a review as helpful
  markReviewHelpful: async (reviewUuid: string) => {
    try {
      console.log('API Client: Marking review as helpful:', reviewUuid);
      const response = await apiClient.post(`/reviews/mark-helpful?reviewUuid=${reviewUuid}`);
      console.log('API Client: Mark helpful response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Client: Mark review helpful error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
      }
      throw error;
    }
  },
};

export default apiClient;
