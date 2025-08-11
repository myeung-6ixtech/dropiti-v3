// ========================================
// API TYPES
// ========================================

// Import types from other modules
import type { Property, Offer, User, Notification, PropertyFilters } from './index';

// ========================================
// COMMON API TYPES
// ========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
  timestamp?: string;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: ApiPagination;
}

// ========================================
// GRAPHQL TYPES
// ========================================

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
  extensions?: Record<string, unknown>;
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

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

// ========================================
// HASURA SPECIFIC TYPES
// ========================================

export interface HasuraResponse<T = unknown> {
  data: T;
  errors?: GraphQLError[];
}

export interface HasuraRequest<T = unknown> {
  query: string;
  variables?: T;
}

export interface HasuraSubscription<T = unknown> {
  id: string;
  type: 'subscription_data';
  payload: {
    result: {
      data: T;
    };
  };
}

// ========================================
// QUERY & MUTATION TYPES
// ========================================

export interface QueryResult<T = unknown> {
  data: T;
  loading: boolean;
  error?: Error;
  refetch?: () => void;
}

export interface MutationResult<T = unknown> {
  data?: T;
  loading: boolean;
  error?: Error;
  mutate: (variables?: unknown) => Promise<T>;
  reset: () => void;
}

// ========================================
// HTTP CLIENT TYPES
// ========================================

export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  withCredentials: boolean;
}

export interface HttpRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HttpRequestConfig;
}

// ========================================
// API ENDPOINT TYPES
// ========================================

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  description: string;
  requiresAuth: boolean;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

export interface ApiRoute {
  path: string;
  handler: (req: unknown, res: unknown) => Promise<unknown>;
  middleware?: Array<(req: unknown, res: unknown, next: () => void) => void>;
  validation?: {
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
    params?: Record<string, unknown>;
  };
}

// ========================================
// PROPERTY API TYPES
// ========================================

export interface PropertyApiResponse {
  success: boolean;
  data: Property[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface PropertySortOptions {
  field: 'price' | 'bedrooms' | 'bathrooms' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface PropertySearchParams extends PropertyFilters {
  sort?: PropertySortOptions;
  page?: number;
  limit?: number;
  offset?: number;
}

// ========================================
// OFFER API TYPES
// ========================================

export interface OfferApiResponse {
  success: boolean;
  data: Offer[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface OfferFilters {
  propertyId?: string;
  userId?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  minPrice?: number;
  maxPrice?: number;
  moveInDate?: string;
}

export interface OfferSearchParams extends OfferFilters {
  sort?: {
    field: 'rentalPrice' | 'leaseDuration' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
  offset?: number;
}

// ========================================
// USER API TYPES
// ========================================

export interface UserApiResponse {
  success: boolean;
  data: User[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface UserFilters {
  role?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface UserSearchParams extends UserFilters {
  sort?: {
    field: 'firstName' | 'lastName' | 'email' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
  offset?: number;
}

// ========================================
// FILE UPLOAD API TYPES
// ========================================

export interface FileUploadRequest {
  file: File;
  type: 'image' | 'document' | 'video';
  category: 'property' | 'profile' | 'document';
  metadata?: Record<string, unknown>;
}

export interface FileUploadResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    uploadedAt: string;
  };
  error?: string;
}

export interface FileUploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

// ========================================
// SEARCH API TYPES
// ========================================

export interface SearchRequest {
  query: string;
  filters?: Record<string, unknown>;
  sort?: Record<string, 'asc' | 'desc'>;
  page?: number;
  limit?: number;
}

export interface SearchResponse<T = unknown> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  suggestions?: string[];
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

// ========================================
// NOTIFICATION API TYPES
// ========================================

export interface NotificationApiResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface NotificationFilters {
  userId?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  isRead?: boolean;
  createdAt?: string;
}

export interface NotificationSearchParams extends NotificationFilters {
  sort?: {
    field: 'createdAt' | 'type' | 'isRead';
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
  offset?: number;
}

// ========================================
// ANALYTICS API TYPES
// ========================================

export interface AnalyticsRequest {
  metric: string;
  dimensions?: string[];
  filters?: Record<string, unknown>;
  dateRange: {
    start: string;
    end: string;
  };
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'year';
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    metric: string;
    dimensions: string[];
    values: Array<{
      dimension: string;
      value: number;
      timestamp?: string;
    }>;
    total: number;
    average: number;
    min: number;
    max: number;
  };
}

// ========================================
// WEBSOCKET & REAL-TIME TYPES
// ========================================

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
}

export interface WebSocketConnection {
  id: string;
  userId?: string;
  connectedAt: string;
  lastActivity: string;
  isActive: boolean;
}

export interface RealTimeUpdate<T = unknown> {
  event: string;
  data: T;
  timestamp: string;
  source: string;
}

// ========================================
// CACHE & STORAGE TYPES
// ========================================

export interface CacheConfig {
  ttl: number; // time to live in seconds
  maxSize: number; // maximum number of items
  strategy: 'lru' | 'fifo' | 'lfu';
}

export interface CacheItem<T = unknown> {
  key: string;
  value: T;
  createdAt: string;
  expiresAt: string;
  accessCount: number;
  lastAccessed: string;
}

export interface StorageConfig {
  type: 'local' | 'session' | 'indexeddb' | 'redis';
  prefix: string;
  encryption?: boolean;
  compression?: boolean;
}

// ========================================
// RATE LIMITING TYPES
// ========================================

export interface RateLimitConfig {
  windowMs: number; // time window in milliseconds
  max: number; // maximum requests per window
  message: string;
  statusCode: number;
  headers: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // timestamp when limit resets
  retryAfter?: number; // seconds to wait before retry
}

// ========================================
// API VERSIONING TYPES
// ========================================

export interface ApiVersion {
  version: string;
  deprecated: boolean;
  sunsetDate?: string;
  migrationGuide?: string;
  breakingChanges?: string[];
}

export interface ApiVersionConfig {
  current: string;
  supported: string[];
  deprecated: string[];
  default: string;
}

// ========================================
// API DOCUMENTATION TYPES
// ========================================

export interface ApiEndpointDoc {
  path: string;
  method: string;
  summary: string;
  description: string;
  parameters: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: ApiResponseDoc[];
  examples: ApiExample[];
  tags: string[];
}

export interface ApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  type: string;
  description: string;
  example?: unknown;
}

export interface ApiRequestBody {
  required: boolean;
  content: Record<string, {
    schema: Record<string, unknown>;
    example?: unknown;
  }>;
}

export interface ApiResponseDoc {
  statusCode: string;
  description: string;
  content?: Record<string, {
    schema: Record<string, unknown>;
    example?: unknown;
  }>;
}

export interface ApiExample {
  name: string;
  summary: string;
  description: string;
  value: unknown;
}
