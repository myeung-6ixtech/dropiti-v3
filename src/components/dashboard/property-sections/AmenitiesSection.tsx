'use client';

import { PencilIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';
import { getAllAmenities } from '@/constants/amenities';
import { getAmenityIconByName } from '@/constants/amenity-icons';

interface AmenitiesSectionProps {
  data: PropertyData;
  tempData: Partial<PropertyData>;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onUpdateField: (section: string, field: string, value: unknown) => void;
  errors: Record<string, string>;
  isSaving: boolean;
}

export function AmenitiesSection({
  data,
  tempData,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onUpdateField,
  errors,
  isSaving
}: AmenitiesSectionProps) {
  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = tempData.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    onUpdateField('amenities', 'amenities', newAmenities);
  };

  const renderAmenityIcon = (amenity: string) => {
    const IconComponent = getAmenityIconByName(amenity);
    if (IconComponent) {
      return <IconComponent className="h-5 w-5 text-gray-600" />;
    }
    // Fallback to a generic icon if no specific icon is found
    return <div className="h-5 w-5 bg-gray-400 rounded-full flex-shrink-0" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
        {!isEditing ? (
          <button
            onClick={onStartEdit}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button onClick={onCancelEdit} className="btn-secondary">Cancel</button>
            <button onClick={onSaveEdit} disabled={isSaving} className="btn-primary">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {getAllAmenities().map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={amenity.id}
                  checked={(tempData.amenities || []).includes(amenity.name)}
                  onChange={() => handleAmenityToggle(amenity.name)}
                  className="form-checkbox"
                />
                <label htmlFor={amenity.id} className="text-gray-700">{amenity.name}</label>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {data.amenities?.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-3">
              {renderAmenityIcon(amenity)}
              <span className="capitalize text-gray-700">{amenity}</span>
            </div>
          ))}
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
