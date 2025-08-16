'use client';

import { PencilIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';

interface RentalInfoSectionProps {
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

export function RentalInfoSection({
  data,
  tempData,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onUpdateField,
  errors,
  isSaving
}: RentalInfoSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Rental Information</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rental Price (per month)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={tempData.rentalDetails?.rentalPrice || 0}
                onChange={(e) => onUpdateField('rentalDetails', 'rentalPrice', parseInt(e.target.value) || 0)}
                className="form-input w-full"
                placeholder="Enter rental price"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Date</label>
            <input
              type="date"
              value={tempData.rentalDetails?.availableDate ? new Date(tempData.rentalDetails.availableDate).toISOString().split('T')[0] : ''}
              onChange={(e) => onUpdateField('rentalDetails', 'availableDate', e.target.value)}
              className="form-input w-full"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div>
              <span className="text-sm text-gray-500">Monthly Rent</span>
              <p className="font-medium text-gray-700 text-lg">${data.rentalDetails?.rentalPrice || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
              <div>
                <span className="text-sm text-gray-500">Available From</span>
                <p className="font-medium text-gray-700">
                  {data.rentalDetails?.availableDate 
                    ? new Date(data.rentalDetails.availableDate).toLocaleDateString()
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
