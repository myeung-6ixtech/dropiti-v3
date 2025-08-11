'use client';

import { useState } from 'react';
import { 
  WifiIcon,
  TvIcon,
  TruckIcon,
  ShieldCheckIcon,
  KeyIcon,
  CogIcon,
  HomeIcon,
  ComputerDesktopIcon,
  PhoneIcon,
  HeartIcon,
  FireIcon,
  SunIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface Step5AmenitiesProps {
  data?: {
    amenities?: string[];
  };
  onUpdate: (data: { amenities?: string[] }) => void;
}

const amenities = [
  {
    id: 'wifi',
    name: 'WiFi',
    icon: WifiIcon,
    category: 'Internet & Technology'
  },
  {
    id: 'air-conditioning',
    name: 'Air Conditioning',
    icon: HeartIcon,
    category: 'Climate Control'
  },
  {
    id: 'heating',
    name: 'Heating',
    icon: FireIcon,
    category: 'Climate Control'
  },
  {
    id: 'tv',
    name: 'TV',
    icon: TvIcon,
    category: 'Entertainment'
  },
  {
    id: 'dishwasher',
    name: 'Dishwasher',
    icon: CogIcon,
    category: 'Kitchen'
  },
  {
    id: 'washer',
    name: 'Washing Machine',
    icon: CogIcon,
    category: 'Laundry'
  },
  {
    id: 'dryer',
    name: 'Dryer',
    icon: CogIcon,
    category: 'Laundry'
  },
  {
    id: 'parking',
    name: 'Parking',
    icon: TruckIcon,
    category: 'Transportation'
  },
  {
    id: 'gym',
    name: 'Gym',
    icon: HeartIcon,
    category: 'Fitness'
  },
  {
    id: 'pool',
    name: 'Swimming Pool',
    icon: HeartIcon,
    category: 'Recreation'
  },
  {
    id: 'security',
    name: 'Security System',
    icon: ShieldCheckIcon,
    category: 'Safety'
  },
  {
    id: 'elevator',
    name: 'Elevator',
    icon: KeyIcon,
    category: 'Accessibility'
  },
  {
    id: 'balcony',
    name: 'Balcony',
    icon: HomeIcon,
    category: 'Outdoor'
  },
  {
    id: 'workspace',
    name: 'Workspace',
    icon: ComputerDesktopIcon,
    category: 'Work'
  },
  {
    id: 'phone',
    name: 'Phone',
    icon: PhoneIcon,
    category: 'Communication'
  },
  {
    id: 'furnished',
    name: 'Furnished',
    icon: HomeIcon,
    category: 'Furnishing'
  },
  {
    id: 'utilities-included',
    name: 'Utilities Included',
    icon: SunIcon,
    category: 'Utilities'
  },
  {
    id: 'cleaning',
    name: 'Cleaning Service',
    icon: SparklesIcon,
    category: 'Services'
  }
];

const categories = [
  'All',
  'Internet & Technology',
  'Climate Control',
  'Entertainment',
  'Kitchen',
  'Laundry',
  'Transportation',
  'Fitness',
  'Recreation',
  'Safety',
  'Accessibility',
  'Outdoor',
  'Work',
  'Communication',
  'Furnishing',
  'Utilities',
  'Services'
];

export default function Step5Amenities({ data, onUpdate }: Step5AmenitiesProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(data?.amenities || []);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleAmenityToggle = (amenityId: string) => {
    const updatedAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId];
    
    setSelectedAmenities(updatedAmenities);
    onUpdate({ amenities: updatedAmenities });
  };

  const filteredAmenities = selectedCategory === 'All' 
    ? amenities 
    : amenities.filter(amenity => amenity.category === selectedCategory);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What amenities does your property offer?
        </h3>
        <p className="text-gray-600 mb-6">
          Select all the amenities that are available in your property. This helps tenants understand what&apos;s included.
        </p>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAmenities.map((amenity) => (
            <button
              key={amenity.id}
              onClick={() => handleAmenityToggle(amenity.id)}
              className={`relative p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                selectedAmenities.includes(amenity.id)
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`p-2 rounded-lg ${
                  selectedAmenities.includes(amenity.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{amenity.name}</h4>
                  <p className="text-xs text-gray-500">{amenity.category}</p>
                </div>
              </div>
              
              {selectedAmenities.includes(amenity.id) && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Amenities Summary */}
      {selectedAmenities.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Selected Amenities ({selectedAmenities.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedAmenities.map((amenityId) => {
              const amenity = amenities.find(a => a.id === amenityId);
              return amenity ? (
                <span
                  key={amenityId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {amenity.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Amenities Help
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                Select all amenities that are available in your property. This information helps tenants make informed decisions and sets clear expectations about what&apos;s included.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
