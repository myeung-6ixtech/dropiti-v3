'use client';

import { useState } from 'react';
import { TenantProfileData } from '@/types/tenant';
import { RESIDENTIAL_TYPE } from '@/types/property';

interface Step1BasicInfoProps {
  data: TenantProfileData;
  onUpdate: (data: Partial<TenantProfileData>) => void;
}

export default function Step1BasicInfo({ data, onUpdate }: Step1BasicInfoProps) {
  const [title, setTitle] = useState(data.tenant_listing_title || '');
  const [description, setDescription] = useState(data.tenant_listing_description || '');
  const [propertyTypes, setPropertyTypes] = useState<string[]>(data.preferred_property_types || []);
  const [furnishingPreference, setFurnishingPreference] = useState(data.furnishing_preference || '');
  const [petsAllowed, setPetsAllowed] = useState<boolean | undefined>(data.pets_allowed);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onUpdate({ tenant_listing_title: value });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    onUpdate({ tenant_listing_description: value });
  };

  // Centralized options
  const PROPERTY_TYPE_OPTIONS = [
    { value: RESIDENTIAL_TYPE.APARTMENT, label: 'Apartment' },
    { value: RESIDENTIAL_TYPE.CONDO, label: 'Condominium' },
    { value: RESIDENTIAL_TYPE.SERVICED_APARTMENT, label: 'Serviced Apartment' },
    { value: RESIDENTIAL_TYPE.VILLAGE_HOUSE, label: 'Village House' },
  ];

  const FURNISHING_OPTIONS = [
    { value: 'fully', label: 'Fully Furnished' },
    { value: 'partially', label: 'Partially Furnished' },
    { value: 'unfurnished', label: 'Unfurnished' },
  ];

  const handlePropertyTypeChange = (value: string) => {
    const updated = propertyTypes.includes(value)
      ? propertyTypes.filter((v) => v !== value)
      : [...propertyTypes, value];
    setPropertyTypes(updated);
    onUpdate({ preferred_property_types: updated });
  };

  const handleFurnishingChange = (value: string) => {
    setFurnishingPreference(value);
    onUpdate({ furnishing_preference: value as 'fully' | 'partially' | 'unfurnished' });
  };

  const handlePetsChange = (value: boolean) => {
    setPetsAllowed(value);
    onUpdate({ pets_allowed: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. Professional seeking modern apartment"
          className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          A catchy title that describes who you are and what you're looking for
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About You *
        </label>
        <textarea
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={6}
          placeholder="Tell landlords about yourself, your lifestyle, what you're looking for in a rental, and what makes you a great tenant..."
          className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Help landlords understand who you are and why you'd be a great tenant
        </p>
      </div>

      {/* What type of unit are you looking for? */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What type of unit are you looking for? *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PROPERTY_TYPE_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={propertyTypes.includes(option.value)}
                onChange={() => handlePropertyTypeChange(option.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Select all property types you're interested in
        </p>
      </div>

      {/* Do you need furnishing? */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do you need furnishing? *
        </label>
        <select
          value={furnishingPreference}
          onChange={(e) => handleFurnishingChange(e.target.value)}
          className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select furnishing preference</option>
          {FURNISHING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">Choose your furnishing preference</p>
      </div>

      {/* Do you have pets? */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do you have pets? *
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="pets"
              checked={petsAllowed === true}
              onChange={() => handlePetsChange(true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Yes, I have pets</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="pets"
              checked={petsAllowed === false}
              onChange={() => handlePetsChange(false)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">No pets</span>
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500">Let landlords know if you have pets</p>
      </div>
    </div>
  );
}
