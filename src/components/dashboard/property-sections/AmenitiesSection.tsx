'use client';

import { useState, useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';
import { getAllAmenities } from '@/constants/amenities';
import { getAmenityIconByName } from '@/constants/amenity-icons';
import { propertiesAPI } from '@/lib/api-client';

interface AmenitiesSectionProps {
  data: PropertyData;
  propertyId: string;
  onUpdateField: (section: string, field: string, value: unknown) => void;
  errors: Record<string, string>;
}

export function AmenitiesSection({
  data,
  propertyId,
  onUpdateField,
  errors
}: AmenitiesSectionProps) {
  
  // Internal state management
  const [isEditing, setIsEditing] = useState(false);
  const [localAmenities, setLocalAmenities] = useState<string[]>([]);
  const [isSavingLocally, setIsSavingLocally] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Initialize local amenities when data changes
  useEffect(() => {
    const normalizedAmenities = normalizeAmenities(data.amenities);
    setLocalAmenities(normalizedAmenities);
  }, [data.amenities]);
  
  // Debug logging when component renders
  console.log('=== AMENITIES SECTION RENDER ===');
  console.log('isEditing:', isEditing);
  console.log('data.amenities:', data.amenities);
  console.log('localAmenities:', localAmenities);
  console.log('Type of localAmenities:', typeof localAmenities);
  console.log('Is Array?', Array.isArray(localAmenities));
  console.log('=== END RENDER DEBUG ===');
  
  // Helper function to normalize amenities data
  const normalizeAmenities = (amenities: unknown): string[] => {
    if (Array.isArray(amenities)) {
      return amenities;
    } else if (amenities && typeof amenities === 'string') {
      return [amenities];
    } else if (amenities && typeof amenities === 'object') {
      return Object.values(amenities).filter(val => typeof val === 'string') as string[];
    }
    return [];
  };
  
  const handleAmenityToggle = (amenityId: string) => {
    try {
      console.log('=== AMENITY TOGGLE DEBUG ===');
      console.log('Toggling amenity ID:', amenityId);
      console.log('Current localAmenities:', localAmenities);
      console.log('Type of localAmenities:', typeof localAmenities);
      console.log('Is Array?', Array.isArray(localAmenities));
      
      // Use local state directly - it's guaranteed to be an array
      const currentAmenities = localAmenities;
      console.log('Using localAmenities directly:', currentAmenities);
      
      console.log('Checking if amenityId exists:', amenityId, 'in array:', currentAmenities);
      console.log('Result of includes check:', currentAmenities.includes(amenityId));
      
      const newAmenities = currentAmenities.includes(amenityId)
        ? currentAmenities.filter(a => a !== amenityId)
        : [...currentAmenities, amenityId];
      
      console.log('New amenities array:', newAmenities);
      console.log('Updating local state with:', newAmenities);
      
      // Update local state
      setLocalAmenities(newAmenities);
      
      console.log('=== END AMENITY TOGGLE DEBUG ===');
    } catch (error) {
      console.error('Error in handleAmenityToggle:', error);
    }
  };

  const handleStartEdit = () => {
    console.log('Starting edit mode');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    console.log('Canceling edit mode');
    setIsEditing(false);
    // Reset to original data
    const normalizedAmenities = normalizeAmenities(data.amenities);
    setLocalAmenities(normalizedAmenities);
  };

  const handleSaveEdit = async () => {
    try {      
      // Set local loading state
      setIsSavingLocally(true);
      
      // Call the API to update the property
      const response = await propertiesAPI.updateProperty(propertyId, {
        amenities: localAmenities
      });
      
      if (response.success) {        
        // Call the parent's onUpdateField to sync the parent component
        onUpdateField('amenities', 'amenities', localAmenities);
        
        // Update local state to reflect the saved data
        setLocalAmenities(localAmenities);
        
        // Show success message
        setShowSuccessMessage(true);
        
        // Exit edit mode
        setIsEditing(false);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        console.error('Failed to update amenities:', response.error);
        // You could set an error state here if needed
      }
    } catch (error) {
      console.error('Error updating amenities:', error);
      // You could set an error state here if needed
    } finally {
      // Always clear the loading state
      setIsSavingLocally(false);
    }
  };

  const renderAmenityIcon = (amenityId: string) => {
    const IconComponent = getAmenityIconByName(amenityId);
    if (IconComponent) {
      return <IconComponent className="h-5 w-5 text-gray-600" />;
    }
    // Fallback to a generic icon if no specific icon is found
    return <div className="h-5 w-5 bg-gray-400 rounded-full flex-shrink-0" />;
  };

  const getAmenityDisplayName = (amenityId: string) => {
    const amenity = getAllAmenities().find(a => a.id === amenityId);
    return amenity ? amenity.name : amenityId;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
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
              {isSavingLocally ? 'Saving...' : 'Save Amenities'}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {getAllAmenities().map((amenity) => {
              // Use localAmenities directly - it's guaranteed to be an array
              const isChecked = localAmenities.includes(amenity.id);
              
              console.log(`Amenity ${amenity.id} (${amenity.name}): isChecked = ${isChecked}, localAmenities =`, localAmenities);
              
              return (
                <div key={amenity.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={amenity.id}
                    checked={isChecked}
                    onChange={() => handleAmenityToggle(amenity.id)}
                    className="form-checkbox w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                  />
                  <label htmlFor={amenity.id} className="text-gray-700 cursor-pointer">{amenity.name}</label>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {(() => {
            // Ensure amenities is always an array for display
            let amenitiesToShow: string[] = [];
            if (Array.isArray(data.amenities)) {
              amenitiesToShow = data.amenities;
            } else if (data.amenities && typeof data.amenities === 'string') {
              amenitiesToShow = [data.amenities];
            } else if (data.amenities && typeof data.amenities === 'object') {
              amenitiesToShow = Object.values(data.amenities).filter(val => typeof val === 'string') as string[];
            }
            
            if (amenitiesToShow.length > 0) {
              return amenitiesToShow.map((amenityId) => (
                <div key={amenityId} className="flex items-center space-x-3">
                  {renderAmenityIcon(amenityId)}
                  <span className="capitalize text-gray-700">{getAmenityDisplayName(amenityId)}</span>
                </div>
              ));
            } else {
              return (
                <div className="col-span-2 text-gray-500 text-center py-4">
                  No amenities specified
                </div>
              );
            }
          })()}
        </div>
      )}

      {showSuccessMessage && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm mb-0">✅ Amenities updated successfully!</p>
        </div>
      )}
      
      {errors.amenities && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.amenities}</p>
        </div>
      )}
    </div>
  );
}
