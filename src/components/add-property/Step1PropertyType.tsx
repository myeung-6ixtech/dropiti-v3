'use client';

import { useState } from 'react';
import { 
  HomeIcon, 
  BuildingOfficeIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

import { Step1PropertyTypeProps } from '@/types';

const propertyTypes = [
  {
    id: 'residential',
    title: 'Residential',
    description: 'Homes and apartments for living',
    icon: HomeIcon,
    subTypes: [
      {
        id: 'serviced-apartment',
        title: 'Serviced Apartment',
        description: 'Fully furnished with hotel-like amenities',
        icon: BuildingOfficeIcon,
      },
      {
        id: 'village-house',
        title: 'Village House',
        description: 'Traditional village-style houses',
        icon: HomeIcon,
      },
      {
        id: 'apartment',
        title: 'Apartment',
        description: 'Standard residential apartments',
        icon: BuildingOfficeIcon,
      },
      {
        id: 'condo',
        title: 'Condo',
        description: 'Condominium units',
        icon: CubeIcon,
      },
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial',
    description: 'Business and office spaces',
    icon: BuildingOfficeIcon,
    subTypes: [],
    disabled: true,
  },
];

export default function Step1PropertyType({ data, onUpdate }: Step1PropertyTypeProps) {
  const [selectedPropertyType, setSelectedPropertyType] = useState(data?.propertyType || '');
  const [selectedResidentialType, setSelectedResidentialType] = useState(data?.residentialType || '');

  const handlePropertyTypeSelect = (typeId: string) => {
    if (typeId === 'commercial') return; // Disabled for now
    
    setSelectedPropertyType(typeId);
    setSelectedResidentialType(''); // Reset residential type when changing property type
    onUpdate({ 
      propertyType: typeId as 'residential' | 'commercial', 
      residentialType: undefined 
    });
  };

  const handleResidentialTypeSelect = (typeId: string) => {
    setSelectedResidentialType(typeId);
    onUpdate({ 
      residentialType: typeId as 'serviced-apartment' | 'village-house' | 'apartment' | 'condo' 
    });
  };

  return (
    <div className="space-y-8">
      {/* Property Type Selection */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What type of property are you listing?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {propertyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handlePropertyTypeSelect(type.id)}
              disabled={type.disabled}
              className={`relative p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                selectedPropertyType === type.id
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20'
                  : type.disabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  selectedPropertyType === type.id
                    ? 'bg-blue-600 text-white'
                    : type.disabled
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <type.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{type.title}</h4>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
              </div>
              
              {type.disabled && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                    Coming Soon
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Residential Type Selection */}
      {selectedPropertyType === 'residential' && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What type of residential property?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {propertyTypes.find(t => t.id === 'residential')?.subTypes.map((subType) => (
              <button
                key={subType.id}
                onClick={() => handleResidentialTypeSelect(subType.id)}
                className={`relative p-6 border-2 rounded-xl text-center transition-all duration-200 ${
                  selectedResidentialType === subType.id
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-lg ${
                    selectedResidentialType === subType.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <subType.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{subType.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{subType.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Property Type Help
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Choose the property type that best describes your listing. This helps potential tenants understand what type of space they&apos;re looking at.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
