// Common GraphQL response types
export interface GraphQLResponse<T = unknown> {
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
    extensions?: Record<string, unknown>;
  }
  
  // Hasura specific types
  export interface HasuraResponse<T = unknown> {
    data: T;
    errors?: GraphQLError[];
  }
  
  // Common query/mutation result types
  export interface QueryResult<T = unknown> {
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
  details?: Record<string, unknown>;
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
  details?: Record<string, unknown>;
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
    where: Record<string, unknown>;
    _set: Partial<T>;
  }
  
  export interface DeleteInput {
    where: Record<string, unknown>;
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