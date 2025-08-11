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
  name: string;
  role: 'tenant' | 'landlord';
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

// Export new centralized property types
export * from './property';
