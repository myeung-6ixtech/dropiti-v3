'use client';

import { useState } from 'react';
import { 
  EntireApartment,
  PartialApartment,
  SharedSpace,
  PrivateRoom
} from '@/assets/icons';

import { Step2RentalSpaceProps } from '@/types';

const rentalSpaces = [
  {
    id: 'entire-apartment',
    title: 'Entire Apartment',
    description: 'Rent the complete apartment to yourself',
    icon: EntireApartment,
    details: 'You\'ll have the whole place to yourself with a private bathroom and kitchen.'
  },
  {
    id: 'partial-apartment',
    title: 'Partial Apartment',
    description: 'Rent part of an apartment',
    icon: PartialApartment,
    details: 'You\'ll have your own room and share common areas like the kitchen and bathroom.'
  },
  {
    id: 'shared-space',
    title: 'Shared Space',
    description: 'Rent a shared room or space',
    icon: SharedSpace,
    details: 'You\'ll be sharing a room or space with others in the same unit.'
  },
  {
    id: 'private-room',
    title: 'Private Room',
    description: 'Rent a private room',
    icon: PrivateRoom,
    details: 'You\'ll have your own private room and share common areas with other tenants.'
  },
];

export default function Step2RentalSpace({ data, onUpdate }: Step2RentalSpaceProps) {
  const [selectedRentalSpace, setSelectedRentalSpace] = useState(data?.rentalSpace || '');

  const handleRentalSpaceSelect = (spaceId: string) => {
    setSelectedRentalSpace(spaceId);
    onUpdate({ 
      rentalSpace: spaceId as 'entire-apartment' | 'partial-apartment' | 'shared-space' | 'private-room' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-0">
          What type of rental space are you offering?
        </h3>
        <p className="text-gray-600 mb-6">
          Choose the type of space that best describes what tenants will be renting.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rentalSpaces.map((space) => (
            <button
              key={space.id}
              onClick={() => handleRentalSpaceSelect(space.id)}
              className={`property-type-button ${
                selectedRentalSpace === space.id
                  ? 'property-type-button--selected'
                  : 'property-type-button--default'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`property-type-icon ${
                  selectedRentalSpace === space.id
                    ? 'property-type-icon--selected'
                    : 'property-type-icon--default'
                }`}>
                  <space.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{space.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{space.description}</p>
                  <p className="text-xs text-gray-500">{space.details}</p>
                </div>
              </div>
              
              {selectedRentalSpace === space.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">
              Rental Space Types
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Entire Apartment:</strong> Perfect for families or groups who want complete privacy</li>
                <li><strong>Partial Apartment:</strong> Good for individuals who want their own space but don&apos;t mind sharing common areas</li>
                <li><strong>Shared Space:</strong> Ideal for budget-conscious tenants who don&apos;t mind sharing living spaces</li>
                <li><strong>Private Room:</strong> Best for individuals who want their own room but can share common areas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
