// Property Types for Add Property Flow

// Centralized Property Type Definitions
export interface PropertySubType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PropertyType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  subTypes: PropertySubType[];
  disabled?: boolean;
}

// Property Type Constants
export const PROPERTY_TYPE = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
} as const;

export const RESIDENTIAL_TYPE = {
  SERVICED_APARTMENT: 'serviced-apartment',
  VILLAGE_HOUSE: 'village-house',
  APARTMENT: 'apartment',
  CONDO: 'condo',
} as const;

export type PropertyTypeValue = typeof PROPERTY_TYPE[keyof typeof PROPERTY_TYPE];
export type ResidentialTypeValue = typeof RESIDENTIAL_TYPE[keyof typeof RESIDENTIAL_TYPE];

// Centralized property types array
export const PROPERTY_TYPES: PropertyType[] = [
  {
    id: PROPERTY_TYPE.RESIDENTIAL,
    title: 'Residential',
    description: 'Homes and apartments for living',
    icon: () => null, // Will be imported in components
    subTypes: [
      {
        id: RESIDENTIAL_TYPE.SERVICED_APARTMENT,
        title: 'Serviced Apartment',
        description: 'Fully furnished with hotel-like amenities',
        icon: () => null, // Will be imported in components
      },
      {
        id: RESIDENTIAL_TYPE.VILLAGE_HOUSE,
        title: 'Village House',
        description: 'Traditional village-style houses',
        icon: () => null, // Will be imported in components
      },
      {
        id: RESIDENTIAL_TYPE.APARTMENT,
        title: 'Apartment',
        description: 'Standard residential apartments',
        icon: () => null, // Will be imported in components
      },
      {
        id: RESIDENTIAL_TYPE.CONDO,
        title: 'Condominium',
        description: 'Condominium units',
        icon: () => null, // Will be imported in components
      },
    ],
  },
  {
    id: PROPERTY_TYPE.COMMERCIAL,
    title: 'Commercial',
    description: 'Business and office spaces',
    icon: () => null, // Will be imported in components
    subTypes: [],
    disabled: true,
  },
];

export interface PropertyData {
  // Step 1
  propertyType?: PropertyTypeValue;
  residentialType?: ResidentialTypeValue;
  
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
    grossAreaUnit?: string;
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
