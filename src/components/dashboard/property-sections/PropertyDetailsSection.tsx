'use client';

import { useState, useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';
import { propertiesAPI } from '@/lib/api-client';
import { useToast } from '@/context/ToastContext';

interface PropertyDetailsSectionProps {
  propertyId: string;
  onUpdateField: (section: string, field: string, value: unknown) => void;
  errors: Record<string, string>;
}

// Interface for the database response fields
interface DatabasePropertyFields {
  num_bedroom?: number;
  num_bathroom?: number;
  gross_area_size?: number;
  gross_area_size_unit?: string;
  furnished?: string;
  pets_allowed?: boolean;
}

// Interface for the update data sent to API
interface UpdatePropertyData {
  num_bedroom?: number;
  num_bathroom?: number;
  gross_area_size?: number;
  gross_area_size_unit?: string;
  furnished?: string;
  pets_allowed?: boolean;
}

export function PropertyDetailsSection({
  propertyId,
  onUpdateField,
  errors
}: PropertyDetailsSectionProps) {
  
  const { showToast } = useToast();
  
  // Default unit details to prevent undefined state
  const defaultUnitDetails: Required<NonNullable<PropertyData['unitDetails']>> = {
    bedrooms: 0,
    bathrooms: 0,
    grossArea: 0,
    grossAreaUnit: '',
    netArea: 0,
    furnished: 'non-furnished',
    petsAllowed: false
  };

  // Internal state management
  const [isEditing, setIsEditing] = useState(false);
  const [localUnitDetails, setLocalUnitDetails] = useState(defaultUnitDetails);
  const [originalUnitDetails, setOriginalUnitDetails] = useState(defaultUnitDetails);
  const [isSavingLocally, setIsSavingLocally] = useState(false);
  
  // Fetch property details directly from database
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        
        const response = await propertiesAPI.getPropertyByUuid(propertyId);
        
        if (response.success && response.data?.property) {
          const property = response.data.property as DatabasePropertyFields;
          
          // Extract unit details from the API response and map to our interface
          const unitDetails: PropertyData['unitDetails'] = {};
          
          // Map database fields to our interface
          if (property.num_bedroom !== undefined) unitDetails.bedrooms = property.num_bedroom;
          if (property.num_bathroom !== undefined) unitDetails.bathrooms = property.num_bathroom;
          if (property.gross_area_size !== undefined) unitDetails.grossArea = property.gross_area_size;
          if (property.gross_area_size_unit) unitDetails.grossAreaUnit = property.gross_area_size_unit;
          if (property.furnished !== undefined) {
            // Map database furnished values to our interface values
            const furnishedMap: Record<string, 'fully' | 'partially' | 'non-furnished'> = {
              'fully': 'fully',
              'partially': 'partially',
              'non-furnished': 'non-furnished'
            };
            unitDetails.furnished = furnishedMap[property.furnished] || 'non-furnished';
          }
          if (property.pets_allowed !== undefined) unitDetails.petsAllowed = property.pets_allowed;
          
        
          // Store both current and original unit details, merged with defaults
          const completeUnitDetails = { ...defaultUnitDetails, ...unitDetails };
          setLocalUnitDetails(completeUnitDetails);
          setOriginalUnitDetails(completeUnitDetails);
          
          // Update the parent component
          onUpdateField('unitDetails', 'unitDetails', unitDetails);
        } else {
          console.error('🔍 PropertyDetailsSection: Failed to fetch property data:', response.error);
          showToast('error', 'Failed to load property details');
        }
      } catch (error) {
        console.error('🔍 PropertyDetailsSection: Error fetching property details:', error);
        showToast('error', 'Error loading property details');
      }
    };
    
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId, showToast]);
  
  // Internal edit functions
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    
    setIsEditing(false);
    // Reset to the original fetched data
    setLocalUnitDetails({ ...defaultUnitDetails, ...originalUnitDetails });
  };

  const handleSaveEdit = async () => {
    try {
      setIsSavingLocally(true);   
      // Prepare the data for the API (map our interface to database fields)
      const updateData: UpdatePropertyData = {};
      
      if (localUnitDetails?.bedrooms !== undefined) updateData.num_bedroom = localUnitDetails.bedrooms;
      if (localUnitDetails?.bathrooms !== undefined) updateData.num_bathroom = localUnitDetails.bathrooms;
      if (localUnitDetails?.grossArea !== undefined) updateData.gross_area_size = localUnitDetails.grossArea;
      if (localUnitDetails?.grossAreaUnit) updateData.gross_area_size_unit = localUnitDetails.grossAreaUnit;
      if (localUnitDetails?.furnished !== undefined) updateData.furnished = localUnitDetails.furnished;
      if (localUnitDetails?.petsAllowed !== undefined) updateData.pets_allowed = localUnitDetails.petsAllowed;
      
      const response = await propertiesAPI.updateProperty(propertyId, updateData);
          
      if (response.success) {
        // Update both current and original unit details after successful save
        setOriginalUnitDetails({ ...localUnitDetails });
        
        // Call the parent's onUpdateField to sync the parent component
        onUpdateField('unitDetails', 'unitDetails', localUnitDetails);
        
        // Show success toast
        showToast('success', 'Property details updated successfully!');
        
        // Exit edit mode
        setIsEditing(false);
        
        console.log('🔍 PropertyDetailsSection: Property details update completed successfully');
      } else {
        console.error('🔍 PropertyDetailsSection: Failed to update property details:', response.error);
        showToast('error', `Failed to update property details: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('🔍 PropertyDetailsSection: Error updating property details:', error);
      showToast('error', 'Error updating property details. Please try again.');
    } finally {
      setIsSavingLocally(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
        {!isEditing ? (
          <button
            onClick={handleStartEdit}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancelEdit}
              className="btn-secondary"
            >
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSavingLocally}
              className="btn-primary"
            >
              <span>{isSavingLocally ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <input
                type="number"
                min="0"
                value={localUnitDetails.bedrooms?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalUnitDetails(prev => ({ 
                    ...prev, 
                    bedrooms: value === '' ? 0 : parseInt(value) || 0 
                  }));
                }}
                className="form-input w-full"
                placeholder="Number of bedrooms"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={localUnitDetails.bathrooms?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalUnitDetails(prev => ({ 
                    ...prev, 
                    bathrooms: value === '' ? 0 : parseFloat(value) || 0 
                  }));
                }}
                className="form-input w-full"
                placeholder="Number of bathrooms"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gross Area (sq ft)</label>
              <input
                type="number"
                min="0"
                value={localUnitDetails.grossArea?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalUnitDetails(prev => ({ 
                    ...prev, 
                    grossArea: value === '' ? 0 : parseInt(value) || 0 
                  }));
                }}
                className="form-input w-full"
                placeholder="Gross area in square feet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Net Area (sq ft)</label>
              <input
                type="number"
                min="0"
                value={localUnitDetails.netArea?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalUnitDetails(prev => ({ 
                    ...prev, 
                    netArea: value === '' ? 0 : parseInt(value) || 0 
                  }));
                }}
                className="form-input w-full"
                placeholder="Net area in square feet"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnished Status</label>
            <select
              value={localUnitDetails.furnished || 'non-furnished'}
              onChange={(e) => setLocalUnitDetails(prev => ({ ...prev, furnished: e.target.value as 'fully' | 'partially' | 'non-furnished' }))}
              className="form-select w-full"
            >
              <option value="non-furnished">Non-furnished</option>
              <option value="partially">Partially furnished</option>
              <option value="fully">Fully furnished</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="petsAllowed"
              checked={localUnitDetails.petsAllowed || false}
              onChange={(e) => setLocalUnitDetails(prev => ({ ...prev, petsAllowed: e.target.checked }))}
              className="form-checkbox w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
            />
            <label htmlFor="petsAllowed" className="text-sm text-gray-700">
              Pets allowed
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Bedrooms</span>
              <p className="font-medium text-gray-700">{localUnitDetails.bedrooms || 0}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Bathrooms</span>
              <p className="font-medium text-gray-700">{localUnitDetails.bathrooms || 0}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Gross Area</span>
              <p className="font-medium text-gray-700">{localUnitDetails.grossArea || 0} sq ft</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Net Area</span>
              <p className="font-medium text-gray-700">{localUnitDetails.netArea || 0} sq ft</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Furnished</span>
              <p className="font-medium capitalize text-gray-700">{localUnitDetails.furnished || 'Non-furnished'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Pets Allowed</span>
              <p className="font-medium text-gray-700">{localUnitDetails.petsAllowed ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors.details && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.details}</p>
        </div>
      )}
    </div>
  );
}