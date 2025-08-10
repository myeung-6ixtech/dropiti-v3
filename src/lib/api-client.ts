import axios from 'axios';

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

  // Create a new property
      createProperty: async (propertyData: {
      title: string;
      description: string;
      location: string;
      price: number;
      bedrooms: number;
      bathrooms: number;
      imageUrl?: string;
      details?: Record<string, unknown>;
      rules?: string[];
      amenities?: string[];
      minimumLease?: number;
      availableDate?: string | null;
      ownerId: string;
    }) => {
    const response = await apiClient.post('/properties/create-property', propertyData);
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

// Users API (placeholder for future endpoints)
export const usersAPI = {
  // Get user profile
  getProfile: async (userId: string) => {
    const response = await apiClient.get(`/users/profile?userId=${userId}`);
    return response.data;
  },

  // Update user profile
      updateProfile: async (userId: string, updates: {
      name?: string;
      email?: string;
      avatar?: string;
      location?: string;
      about?: string;
      languages?: string[];
      responseTime?: string;
    }) => {
    const response = await apiClient.put(`/users/profile`, { userId, updates });
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
