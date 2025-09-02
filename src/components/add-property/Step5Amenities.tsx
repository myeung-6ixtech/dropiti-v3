'use client';

import { useState } from 'react';
import { getAllAmenities, getAmenitiesByCategory, AMENITY_CATEGORIES } from '@/constants/amenities';
import { getAmenityIconByName } from '@/constants/amenity-icons';

interface Step5AmenitiesProps {
  data?: {
    amenities?: string[];
  };
  onUpdate: (data: { amenities?: string[] }) => void;
}

export default function Step5Amenities({ data, onUpdate }: Step5AmenitiesProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(data?.amenities || []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('All');

  const handleAmenityToggle = (amenityId: string) => {
    const updatedAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId];
    
    setSelectedAmenities(updatedAmenities);
    onUpdate({ amenities: updatedAmenities });
  };

  const filteredAmenities = selectedCategory === 'All' || selectedCategory === null
    ? getAllAmenities()
    : getAmenitiesByCategory(selectedCategory as keyof typeof AMENITY_CATEGORIES);

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What amenities does your property offer?
        </h3>
        <p className="text-gray-600 mb-6">
          Select all the amenities that are available in your property. This helps tenants understand what&apos;s included.
        </p>

        {/* Category Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 text-base mb-3">Filter by Category</h4>
          <div className="flex flex-wrap gap-2">
            {['All', ...Object.keys(AMENITY_CATEGORIES)].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category || (category === 'All' && selectedCategory === null)
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities Grid */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredAmenities.map((amenity) => (
              <div
                key={amenity.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedAmenities.includes(amenity.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAmenityToggle(amenity.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="sr-only"
                />
                
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-full ${
                    selectedAmenities.includes(amenity.id)
                      ? 'bg-purple-100'
                      : 'bg-gray-100'
                  }`}>
                    {(() => {
                      const IconComponent = getAmenityIconByName(amenity.name);
                      return IconComponent ? <IconComponent className="h-6 w-6 text-gray-600" /> : null;
                    })()}
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium text-gray-900 text-sm">{amenity.name}</p>
                    <p className="text-xs text-gray-500">{amenity.category}</p>
                  </div>
                </div>

                {selectedAmenities.includes(amenity.id) && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Amenities Summary */}
        {selectedAmenities.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-3">
              Selected Amenities ({selectedAmenities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedAmenities.map((amenityId) => {
                const amenity = getAllAmenities().find(a => a.id === amenityId);
                return (
                  <div
                    key={amenityId}
                    className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-purple-200"
                  >
                    {(() => {
                      const IconComponent = amenity ? getAmenityIconByName(amenity.name) : null;
                      return IconComponent ? <IconComponent className="h-4 w-4 text-purple-600" /> : null;
                    })()}
                    <span className="text-sm text-purple-900">{amenity?.name}</span>
                    <button
                      onClick={() => handleAmenityToggle(amenityId)}
                      className="text-purple-400 hover:text-purple-600"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-3">Amenities Help</h4>
        <p className="text-gray-600 text-sm leading-relaxed">
          Select all amenities that are available in your property. This information helps tenants make informed decisions and sets clear expectations about what&apos;s included.
        </p>
      </div>
    </div>
  );
}
