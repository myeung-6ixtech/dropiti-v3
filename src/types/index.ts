// ========================================
// DROPITI CENTRALIZED TYPES
// ========================================

// Export all centralized type modules
export * from './property';
export * from './auth';
export * from './ui';
export * from './api';
export * from './assets';
export * from './user';
export * from './review';

// ========================================
// LEGACY TYPES (Keeping for backward compatibility)
// ========================================

// Legacy Property interface - keeping for backward compatibility
export interface LegacyProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  imageUrl?: string; // Optional for backward compatibility
  images?: string[]; // New field for API compatibility
  available: boolean;
  landlordId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// CORE BUSINESS TYPES
// ========================================

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  location?: string;
  bedrooms?: number;
  maxPrice?: number;
  minPrice?: number;
}

export interface PropertyCardProps {
  property: LegacyProperty;
  onViewDetails?: (id: string) => void;
}

// ========================================
// E-COMMERCE TYPES
// ========================================

export interface Product {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  status: string;
  image: string;
}

export interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}

// ========================================
// DASHBOARD TYPES
// ========================================

export interface DashboardStats {
  id: number;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
}

// ========================================
// OFFER & APPLICATION TYPES
// ========================================

export interface Offer {
  id: string;
  propertyId: string;
  userId: string;
  rentalPrice: number;
  leaseDuration: number;
  paymentFrequency: 'full' | 'monthly';
  paymentInterval?: number;
  moveInDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferData {
  rentalPrice: number;
  leaseDuration: number;
  paymentFrequency: 'full' | 'monthly';
  paymentInterval?: number;
  moveInDate: string;
}

// ========================================
// COMMON UTILITY TYPES
// ========================================

export interface Address {
  unit?: string;
  floor?: string;
  block?: string;
  buildingName?: string;
  addressLine1?: string;
  addressLine2?: string;
  district?: string;
  state?: string;
  country?: string;
}

export interface UnitDetails {
  grossArea?: number;
  netArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: 'fully' | 'partially' | 'non-furnished';
  petsAllowed?: boolean;
}

export interface RentalDetails {
  listingName?: string;
  listingDescription?: string;
  rentalPrice?: number;
  availableDate?: Date | string | null;
}

// ========================================
// COMPONENT PROP TYPES
// ========================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FormFieldProps extends BaseComponentProps {
  label: string;
  error?: string;
  required?: boolean;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ========================================
// FORM & VALIDATION TYPES
// ========================================

export interface FormErrors {
  [key: string]: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

// ========================================
// THEME & STYLING TYPES
// ========================================

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

// ========================================
// FILE & MEDIA TYPES
// ========================================

export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
  status: 'uploading' | 'success' | 'error';
}

export interface ImageData {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  order?: number;
}

// ========================================
// LOCATION & GEOGRAPHY TYPES
// ========================================

export interface Location {
  latitude?: number;
  longitude?: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// ========================================
// TIME & DATE TYPES
// ========================================

export interface TimeRange {
  start: Date | string;
  end: Date | string;
}

export interface DateRange {
  from: Date | string;
  to: Date | string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// ========================================
// PERMISSION & ROLE TYPES
// ========================================

export type UserRole = 'admin' | 'landlord' | 'tenant' | 'agent';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: Record<string, unknown>;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// ========================================
// SETTINGS & PREFERENCES TYPES
// ========================================

export interface UserPreferences {
  theme: Theme;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showContactInfo: boolean;
  };
}

export interface AppSettings {
  maintenanceMode: boolean;
  featureFlags: Record<string, boolean>;
  version: string;
  lastUpdated: Date;
}