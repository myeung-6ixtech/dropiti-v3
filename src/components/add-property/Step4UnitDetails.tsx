'use client';

import { useState } from 'react';
import { 
  HomeIcon, 
  ArrowsPointingOutIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface Step4UnitDetailsProps {
  data?: {
    unitDetails?: {
      grossArea?: number;
      netArea?: number;
      bedrooms?: number;
      bathrooms?: number;
      furnished?: 'fully' | 'partially' | 'non-furnished';
      petsAllowed?: boolean;
    };
  };
  onUpdate: (data: { unitDetails?: {
    grossArea?: number;
    netArea?: number;
    bedrooms?: number;
    bathrooms?: number;
    furnished?: 'fully' | 'partially' | 'non-furnished';
    petsAllowed?: boolean;
  } }) => void;
}

export default function Step4UnitDetails({ data, onUpdate }: Step4UnitDetailsProps) {
  const [unitDetails, setUnitDetails] = useState(data?.unitDetails || {
    grossArea: undefined,
    netArea: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    furnished: undefined,
    petsAllowed: undefined,
  });

  const handleInputChange = (field: string, value: number | string | boolean) => {
    const updatedUnitDetails = { ...unitDetails, [field]: value };
    setUnitDetails(updatedUnitDetails);
    onUpdate({ unitDetails: updatedUnitDetails });
  };

  const furnishedOptions = [
    { value: 'fully', label: 'Fully Furnished', description: 'Comes with all furniture and appliances' },
    { value: 'partially', label: 'Partially Furnished', description: 'Comes with some furniture and basic appliances' },
    { value: 'non-furnished', label: 'Non-Furnished', description: 'Empty unit, no furniture provided' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tell us about your unit
        </h3>
        <p className="text-gray-600 mb-6">
          Provide detailed information about your property&apos;s size, rooms, and amenities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Area Details */}
          <div className="space-y-5">
            <h4 className="font-medium text-gray-900 text-base flex items-center mt-6">
              <ArrowsPointingOutIcon className="h-5 w-5 mr-2 text-gray-400" />
              Area Details
            </h4>
            
            <div className="space-y-2">
              <label className="form-label">
                Gross Area (sq ft)
              </label>
              <input
                type="number"
                value={unitDetails.grossArea || ''}
                onChange={(e) => handleInputChange('grossArea', parseInt(e.target.value) || 0)}
                placeholder="e.g., 800"
                className="form-input"
              />
              <p className="text-xs text-gray-500 mt-1">Total area including walls and common areas</p>
            </div>

            <div className="space-y-2">
              <label className="form-label">
                Net Area (sq ft)
              </label>
              <input
                type="number"
                value={unitDetails.netArea || ''}
                onChange={(e) => handleInputChange('netArea', parseInt(e.target.value) || 0)}
                placeholder="e.g., 650"
                className="form-input"
              />
              <p className="text-xs text-gray-500 mt-1">Usable floor area excluding walls</p>
            </div>
          </div>

          {/* Room Details */}
          <div className="space-y-5">
            <h4 className="font-medium text-gray-900 text-base flex items-center mt-6">
              {/* <BedDoubleIcon className="h-5 w-5 mr-2 text-gray-400" /> */}
              Room Details
            </h4>
            
            <div className="space-y-2">
              <label className="form-label">
                Number of Bedrooms
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={unitDetails.bedrooms || ''}
                onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                placeholder="e.g., 2"
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <label className="form-label">
                Number of Bathrooms
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={unitDetails.bathrooms || ''}
                onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 1.5"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Furnishing Status */}
        <div className="space-y-5 mt-8">
          <h4 className="font-medium text-gray-900 text-base flex items-center mt-6">
            <HomeIcon className="h-5 w-5 mr-2 text-gray-400" />
            Furnishing Status
          </h4>
          <p className="text-gray-600 text-sm">
            Select the furnishing status of your property
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {furnishedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange('furnished', option.value)}
                className={`relative p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                  unitDetails.furnished === option.value
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    unitDetails.furnished === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <HomeIcon className="h-4 w-4" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900 text-sm">{option.label}</h4>
                    <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
                
                {unitDetails.furnished === option.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pets Policy */}
        <div className="space-y-5 mt-8">
          <h4 className="font-medium text-gray-900 text-base flex items-center mt-6">
            <HeartIcon className="h-5 w-5 mr-2 text-gray-400" />
            Pets Policy
          </h4>
          <p className="text-gray-600 text-sm">
            Are pets allowed in your property?
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => handleInputChange('petsAllowed', true)}
              className={`flex-1 py-3 px-4 border-2 rounded-lg text-center transition-all duration-200 ${
                unitDetails.petsAllowed === true
                  ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600 ring-opacity-20'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <HeartIcon className="h-5 w-5" />
                <span className="font-medium">Pets Allowed</span>
              </div>
            </button>
            
            <button
              onClick={() => handleInputChange('petsAllowed', false)}
              className={`flex-1 py-3 px-4 border-2 rounded-lg text-center transition-all duration-200 ${
                unitDetails.petsAllowed === false
                  ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600 ring-opacity-20'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="font-medium">No Pets</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {(unitDetails.bedrooms !== undefined || unitDetails.bathrooms !== undefined || unitDetails.grossArea !== undefined) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Unit Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {unitDetails.bedrooms !== undefined && (
              <div>
                <span className="text-gray-500">Bedrooms:</span>
                <span className="ml-1 font-medium text-gray-900">
                  {unitDetails.bedrooms === 0 ? 'Studio' : unitDetails.bedrooms}
                </span>
              </div>
            )}
            {unitDetails.bathrooms !== undefined && (
              <div>
                <span className="text-gray-500">Bathrooms:</span>
                <span className="ml-1 font-medium text-gray-900">{unitDetails.bathrooms}</span>
              </div>
            )}
            {unitDetails.grossArea !== undefined && (
              <div>
                <span className="text-gray-500">Gross Area:</span>
                <span className="ml-1 font-medium text-gray-900">{unitDetails.grossArea} sq ft</span>
              </div>
            )}
            {unitDetails.furnished && (
              <div>
                <span className="text-gray-500">Furnished:</span>
                <span className="ml-1 font-medium text-gray-900 capitalize">
                  {unitDetails.furnished.replace('-', ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
