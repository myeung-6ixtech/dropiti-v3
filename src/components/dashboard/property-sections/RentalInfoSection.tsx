'use client';

import { useState, useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';
import { propertiesAPI } from '@/lib/api-client';
import { useToast } from '@/context/ToastContext';

interface RentalInfoSectionProps {
  propertyId: string;
  onUpdateField: (section: string, field: string, value: unknown) => void;
  errors: Record<string, string>;
}

// Interface for the database response fields - match what's actually in the API response
interface DatabaseRentalFields {
  price?: number; // This is what the API actually returns
  available_date?: string;
}

// Interface for the update data sent to API
interface UpdateRentalData {
  rental_price?: number; // This is what the API expects for updates
  availability_date?: string;
}

// Default rental details to prevent undefined state - moved outside component to avoid dependency issues
const defaultRentalDetails: Required<NonNullable<PropertyData['rentalDetails']>> = {
  listingName: '',
  listingDescription: '',
  rentalPrice: 0,
  availableDate: null
};

export function RentalInfoSection({
  propertyId,
  onUpdateField,
  errors
}: RentalInfoSectionProps) {
  
  const { showToast } = useToast();

  // Internal state management
  const [isEditing, setIsEditing] = useState(false);
  const [localRentalDetails, setLocalRentalDetails] = useState(defaultRentalDetails);
  const [originalRentalDetails, setOriginalRentalDetails] = useState(defaultRentalDetails);
  const [isSavingLocally, setIsSavingLocally] = useState(false);
  
  // Fetch rental details directly from database
  useEffect(() => {
    const fetchRentalDetails = async () => {
      try {
        const response = await propertiesAPI.getPropertyByUuid(propertyId);
        
        if (response.success && response.data?.property) {
          const property = response.data.property as DatabaseRentalFields;
          
          // Extract rental details from the API response and map to our interface
          const rentalDetails: PropertyData['rentalDetails'] = {};
          
          // Map database fields to our interface
          // Note: API returns 'price' but we need to map it to 'rentalPrice'
          if (property.price !== undefined) rentalDetails.rentalPrice = property.price;
          if (property.available_date) rentalDetails.availableDate = property.available_date;
          
          // Store both current and original rental details, merged with defaults
          const completeRentalDetails = { ...defaultRentalDetails, ...rentalDetails };
          setLocalRentalDetails(completeRentalDetails);
          setOriginalRentalDetails(completeRentalDetails);
          
          // Only call onUpdateField if we have meaningful data to share
          // This prevents infinite loops and unnecessary parent updates
          if (Object.keys(rentalDetails).length > 0) {
            onUpdateField('rentalDetails', 'rentalDetails', rentalDetails);
          }
        } else {
          console.error('RentalInfoSection: Failed to fetch property data:', response.error);
          showToast('error', 'Failed to load rental information');
        }
      } catch (error) {
        console.error('RentalInfoSection: Error fetching rental details:', error);
        showToast('error', 'Error loading rental information');
      }
    };
    
    if (propertyId) {
      fetchRentalDetails();
    }
  }, [propertyId, showToast, onUpdateField]); // Added onUpdateField back to dependencies
  
  // Internal edit functions
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to the original fetched data
    setLocalRentalDetails({ ...defaultRentalDetails, ...originalRentalDetails });
  };

  const handleSaveEdit = async () => {
    try {
      setIsSavingLocally(true);
      
      // Prepare the data for the API (map our interface to database fields)
      const updateData: UpdateRentalData = {};
      
      if (localRentalDetails.rentalPrice !== undefined) updateData.rental_price = localRentalDetails.rentalPrice;
      if (localRentalDetails.availableDate) updateData.availability_date = localRentalDetails.availableDate.toString();
      
      const response = await propertiesAPI.updateProperty(propertyId, updateData);
      
      if (response.success) {
        // Update both current and original rental details after successful save
        setOriginalRentalDetails({ ...localRentalDetails });
        
        // Call the parent's onUpdateField to sync the parent component
        onUpdateField('rentalDetails', 'rentalDetails', localRentalDetails);
        
        // Show success toast
        showToast('success', 'Rental information updated successfully!');
        
        // Exit edit mode
        setIsEditing(false);
      } else {
        console.error('RentalInfoSection: Failed to update rental information:', response.error);
        showToast('error', `Failed to update rental information: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('RentalInfoSection: Error updating rental information:', error);
      showToast('error', 'Error updating rental information. Please try again.');
    } finally {
      setIsSavingLocally(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Rental Information</h2>
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
            <button onClick={handleCancelEdit} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveEdit} disabled={isSavingLocally} className="btn-primary">
              {isSavingLocally ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rental Price (per month)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={localRentalDetails.rentalPrice?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalRentalDetails(prev => ({ 
                    ...prev, 
                    rentalPrice: value === '' ? 0 : parseInt(value) || 0 
                  }));
                }}
                className="form-input w-full"
                placeholder="Enter rental price"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Date</label>
            <input
              type="date"
              value={localRentalDetails.availableDate ? new Date(localRentalDetails.availableDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setLocalRentalDetails(prev => ({ ...prev, availableDate: e.target.value }))}
              className="form-input w-full"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div>
              <span className="text-sm text-gray-500">Monthly Rent</span>
              <p className="font-medium text-gray-700 text-lg">${localRentalDetails.rentalPrice || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div>
              <span className="text-sm text-gray-500">Available From</span>
              <p className="font-medium text-gray-700">
                {localRentalDetails.availableDate 
                  ? new Date(localRentalDetails.availableDate).toLocaleDateString()
                  : 'Not specified'
                }
              </p>
            </div>
          </div>        
        </div>
      )}

      {errors.rental && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.rental}</p>
        </div>
      )}
    </div>
  );
}