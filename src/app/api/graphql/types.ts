// Common GraphQL response types
export interface GraphQLResponse<T = any> {
    data?: T;
    errors?: GraphQLError[];
  }
  
  export interface GraphQLError {
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }
  
  // Hasura specific types
  export interface HasuraResponse<T = any> {
    data: T;
    errors?: GraphQLError[];
  }
  
  // Common query/mutation result types
  export interface QueryResult<T = any> {
    data: T;
    loading: boolean;
    error?: Error;
  }
  
  // Property types that match your current API structure
export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  available: boolean;
  landlordId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl?: string;
  details?: any;
  rules?: string[];
  amenities?: string[];
  minimumLease?: number;
  availableDate?: string | null;
  ownerId: string;
}

export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  location?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  imageUrl?: string;
  details?: any;
  rules?: string[];
  amenities?: string[];
  minimumLease?: number;
  availableDate?: string | null;
}
  
  // Generic CRUD operations
  export interface CreateInput<T> {
    object: T;
  }
  
  export interface UpdateInput<T> {
    where: Record<string, any>;
    _set: Partial<T>;
  }
  
  export interface DeleteInput {
    where: Record<string, any>;
  }
  
  // Pagination types
  export interface PaginationInput {
    limit?: number;
    offset?: number;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    hasMore: boolean;
  } 