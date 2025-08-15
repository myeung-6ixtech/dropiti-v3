'use client';

import { PencilIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';

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

const availableAmenities = [
  'WiFi', 'Air Conditioning', 'Heating', 'Dishwasher', 'Washing Machine',
  'Dryer', 'Parking', 'Gym', 'Pool', 'Security System', 'Elevator'
];

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
            {availableAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={amenity}
                  checked={(tempData.amenities || []).includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="form-checkbox"
                />
                <label htmlFor={amenity} className="text-gray-700">{amenity}</label>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {data.amenities?.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-3">
              <div className="h-5 w-5 bg-blue-600 rounded-full flex-shrink-0" />
              <span className="text-gray-700">{amenity}</span>
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
