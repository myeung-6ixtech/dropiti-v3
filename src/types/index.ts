export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  imageUrl: string;
  available: boolean;
  landlordId: string;
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
  property: Property;
  onViewDetails?: (id: string) => void;
}
