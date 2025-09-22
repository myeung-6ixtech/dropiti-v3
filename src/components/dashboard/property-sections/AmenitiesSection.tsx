'use client';

import { useState, useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';
import { getAllAmenities } from '@/constants/amenities';
import { getAmenityIconByName } from '@/constants/amenity-icons';
import { propertiesAPI } from '@/lib/api-client';
import { useToast } from '@/context/ToastContext'; // ✅ Added toast import

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
  
  const { showToast } = useToast(); // ✅ Added toast hook
  
  // Internal state management
  const [isEditing, setIsEditing] = useState(false);
  const [localAmenities, setLocalAmenities] = useState<string[]>([]);
  const [isSavingLocally, setIsSavingLocally] = useState(false);
  // ✅ Removed showSuccessMessage state - no longer needed
  
  // Initialize local amenities when data changes
  useEffect(() => {
    const normalizedAmenities = normalizeAmenities(data.amenities);
    setLocalAmenities(normalizedAmenities);
  }, [data.amenities]);
 
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
      // Use local state directly - it's guaranteed to be an array
      const currentAmenities = localAmenities;
      const newAmenities = currentAmenities.includes(amenityId)
        ? currentAmenities.filter(a => a !== amenityId)
        : [...currentAmenities, amenityId];
      
      // Update local state
      setLocalAmenities(newAmenities);
  
    } catch (error) {
      console.error('Error in handleAmenityToggle:', error);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original data
    const normalizedAmenities = normalizeAmenities(data.amenities);
    setLocalAmenities(normalizedAmenities);
  };

  const handleSaveEdit = async () => {
    try {
      setIsSavingLocally(true);
      
      const response = await propertiesAPI.updateProperty(propertyId, {
        amenities: localAmenities
      });
      
      console.log('API response:', response);
      
      if (response.success) {        
        // Call the parent's onUpdateField to sync the parent component
        onUpdateField('amenities', 'amenities', localAmenities);
        
        // Update local state to reflect the saved data
        setLocalAmenities(localAmenities);
        
        // ✅ Show success toast instead of inline message
        showToast('success', 'Amenities have been updated successfully.');
        
        // Exit edit mode
        setIsEditing(false);
        
        // ✅ No need for setTimeout - toast handles its own timing
      } else {
        console.error('Failed to update amenities:', response.error);
        // ✅ Show error toast for better user feedback
        showToast('error', `Failed to update amenities: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating amenities:', error);
      // ✅ Show error toast for better user feedback
      showToast('error', 'Error updating amenities. Please try again.');
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
    return <div className="h-5 w-4 bg-gray-400 rounded-full flex-shrink-0" />;
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
            // ✅ Use localAmenities instead of data.amenities for immediate display updates
            let amenitiesToShow: string[] = localAmenities;
            
            // Fallback to data.amenities only if localAmenities is empty
            if (!amenitiesToShow || amenitiesToShow.length === 0) {
              if (Array.isArray(data.amenities)) {
                amenitiesToShow = data.amenities;
              } else if (data.amenities && typeof data.amenities === 'string') {
                amenitiesToShow = [data.amenities];
              } else if (data.amenities && typeof data.amenities === 'object') {
                amenitiesToShow = Object.values(data.amenities).filter(val => typeof val === 'string') as string[];
              }
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

      {/* ✅ Removed showSuccessMessage display - now using toast notifications */}
      
      {errors.amenities && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.amenities}</p>
        </div>
      )}
    </div>
  );
}