// Property Types for Add Property Flow
export interface PropertyData {
  // Step 1
  propertyType?: 'residential' | 'commercial';
  residentialType?: 'serviced-apartment' | 'village-house' | 'apartment' | 'condo';
  
  // Step 2
  rentalSpace?: 'entire-apartment' | 'partial-apartment' | 'shared-space' | 'private-room';
  
  // Step 3
  address?: {
    unit?: string;
    floor?: string;
    block?: string;
    building?: string;
    addressLine1?: string;
    addressLine2?: string;
    district?: string;
    state?: string;
    country?: string;
    city?: string;
    showSpecificLocation?: boolean;
  };
  
  // Step 4
  unitDetails?: {
    grossArea?: number;
    netArea?: number;
    bedrooms?: number;
    bathrooms?: number;
    furnished?: 'fully' | 'partially' | 'non-furnished';
    petsAllowed?: boolean;
  };
  
  // Step 5
  amenities?: string[];
  
  // Step 6
  photos?: File[];
  displayImage?: string; // Main display image URL
  uploadedImages?: string[]; // Array of uploaded image URLs
  
  // Step 7
  rentalDetails?: {
    listingName?: string;
    listingDescription?: string;
    rentalPrice?: number;
    availableDate?: Date | string | null;
  };
}

// Property data for API submission (with photo URLs instead of File objects)
export interface PropertyDataForAPI extends Omit<PropertyData, 'photos'> {
  photos?: string[]; // S3 URLs instead of File objects
}

// Step Component Props Interfaces
export interface StepComponentProps {
  data?: Partial<PropertyData>;
  onUpdate: (data: Partial<PropertyData>) => void;
}

// Specific step interfaces for better type safety
export interface Step1PropertyTypeProps extends StepComponentProps {
  data?: Pick<PropertyData, 'propertyType' | 'residentialType'>;
}

export interface Step2RentalSpaceProps extends StepComponentProps {
  data?: Pick<PropertyData, 'rentalSpace'>;
}

export interface Step3AddressProps extends StepComponentProps {
  data?: Pick<PropertyData, 'address'>;
}

export interface Step4UnitDetailsProps extends StepComponentProps {
  data?: Pick<PropertyData, 'unitDetails'>;
}

export interface Step5AmenitiesProps extends StepComponentProps {
  data?: Pick<PropertyData, 'amenities'>;
}

export interface Step6PhotosProps extends StepComponentProps {
  data?: Pick<PropertyData, 'photos'>;
}

export interface Step7RentalDetailsProps extends StepComponentProps {
  data?: Pick<PropertyData, 'rentalDetails'>;
}

export interface Step8SummaryProps extends StepComponentProps {
  data?: PropertyData;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// Property Types for API and Database
export interface Property {
  id: string;
  property_uuid?: string; // Add property_uuid for UUID-based navigation
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  details: Record<string, unknown>;
  rules: string[];
  amenities: string[];
  minimumLease: number;
  availableDate: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

// Property Response Types
export interface PropertyResponse {
  success: boolean;
  data: Property[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Property Filters
export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  amenities?: string[];
}
