'use client';

import { useState } from 'react';
import { 
  BuildingOfficeIcon, 
  CubeIcon 
} from '@heroicons/react/24/outline';
import { Residential, EntireApartment, VillageHouse } from '@/assets/icons';
import { Step1PropertyTypeProps, PROPERTY_TYPES, PropertyType } from '@/types';

// Create property types with actual icons
const propertyTypesWithIcons: PropertyType[] = PROPERTY_TYPES.map(type => {
  if (type.id === 'residential') {
    return {
      ...type,
      icon: Residential,
      subTypes: type.subTypes.map(subType => {
        let icon;
        switch (subType.id) {
          case 'serviced-apartment':
          case 'apartment':
            icon = EntireApartment;
            break;
          case 'village-house':
            icon = VillageHouse;
            break;
          case 'condo':
            icon = CubeIcon;
            break;
          default:
            icon = EntireApartment;
        }
        return { ...subType, icon };
      })
    };
  } else if (type.id === 'commercial') {
    return {
      ...type,
      icon: BuildingOfficeIcon
    };
  }
  return type;
});

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
          {propertyTypesWithIcons.map((type) => (
            <button
              key={type.id}
              onClick={() => handlePropertyTypeSelect(type.id)}
              disabled={type.disabled}
              className={`property-type-button ${
                selectedPropertyType === type.id
                  ? 'property-type-button--selected'
                  : type.disabled
                  ? 'property-type-button--disabled'
                  : 'property-type-button--default'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`property-type-icon ${
                  selectedPropertyType === type.id
                    ? 'property-type-icon--selected'
                    : type.disabled
                    ? 'property-type-icon--disabled'
                    : 'property-type-icon--default'
                }`}>
                  <type.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-0">{type.title}</h4>
                  <p className="text-sm text-gray-500 mb-0">{type.description}</p>
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
            {propertyTypesWithIcons.find(t => t.id === 'residential')?.subTypes.map((subType) => (
              <button
                key={subType.id}
                onClick={() => handleResidentialTypeSelect(subType.id)}
                className={`property-type-sub-button ${
                  selectedResidentialType === subType.id
                    ? 'property-type-sub-button--selected'
                    : 'property-type-sub-button--default'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`property-type-sub-icon ${
                    selectedResidentialType === subType.id
                      ? 'property-type-sub-icon--selected'
                      : 'property-type-sub-icon--default'
                  }`}>
                    <subType.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-0">{subType.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-0">{subType.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-0">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800 mb-0">
              Property Type Help
            </h3>
            <div className="mt-2 text-sm mb-0">
              <p className="text-sm text-gray-600 mb-0">
                Choose the property type that best describes your listing. This helps potential tenants understand what type of space they&apos;re looking at.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
