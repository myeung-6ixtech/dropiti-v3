import axios from 'axios';
import { PropertyDataForAPI, CreateUserInput, User } from '@/types';

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
  // Build location string from address components
  const addressParts = [];
  if (propertyData.address?.buildingName) addressParts.push(propertyData.address.buildingName);
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
    buildingName: propertyData.address?.buildingName,
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
    title: propertyData.rentalDetails?.listingName || 'New Property Listing',
    description: propertyData.rentalDetails?.listingDescription || 'Property description',
    location,
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
    location?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    imageUrl?: string;
    details?: Record<string, unknown>;
    rules?: string[];
    amenities?: string[];
    minimumLease?: number;
    availableDate?: string | null;
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
  // Get offers (incoming or outgoing)
  getOffers: async (params: {
    userId: string;
    type: 'incoming' | 'outgoing';
    limit?: number;
    offset?: number;
  }) => {
    const response = await apiClient.get('/offers/get-offers', { params });
    return response.data;
  },

  // Create a new offer
  createOffer: async (offerData: {
    propertyId: string;
    userId: string;
    amount: number;
    message: string;
  }) => {
    const response = await apiClient.post('/offers/create-offer', offerData);
    return response.data;
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

export default apiClient;
