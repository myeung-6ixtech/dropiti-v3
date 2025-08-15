'use client';

import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';

interface PropertyDetailsSectionProps {
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

export function PropertyDetailsSection({
  data,
  tempData,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onUpdateField,
  errors,
  isSaving
}: PropertyDetailsSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
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
            <button
              onClick={onCancelEdit}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={onSaveEdit}
              disabled={isSaving}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
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
                value={tempData.unitDetails?.bedrooms || 0}
                onChange={(e) => onUpdateField('unitDetails', 'bedrooms', parseInt(e.target.value) || 0)}
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
                value={tempData.unitDetails?.bathrooms || 0}
                onChange={(e) => onUpdateField('unitDetails', 'bathrooms', parseFloat(e.target.value) || 0)}
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
                value={tempData.unitDetails?.grossArea || 0}
                onChange={(e) => onUpdateField('unitDetails', 'grossArea', parseInt(e.target.value) || 0)}
                className="form-input w-full"
                placeholder="Gross area in square feet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Net Area (sq ft)</label>
              <input
                type="number"
                min="0"
                value={tempData.unitDetails?.netArea || 0}
                onChange={(e) => onUpdateField('unitDetails', 'netArea', parseInt(e.target.value) || 0)}
                className="form-input w-full"
                placeholder="Net area in square feet"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnished Status</label>
            <select
              value={tempData.unitDetails?.furnished || 'non-furnished'}
              onChange={(e) => onUpdateField('unitDetails', 'furnished', e.target.value)}
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
              checked={tempData.unitDetails?.petsAllowed || false}
              onChange={(e) => onUpdateField('unitDetails', 'petsAllowed', e.target.checked)}
              className="form-checkbox"
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
              <p className="font-medium">{data.unitDetails?.bedrooms || 0}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Bathrooms</span>
              <p className="font-medium">{data.unitDetails?.bathrooms || 0}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Gross Area</span>
              <p className="font-medium">{data.unitDetails?.grossArea || 0} sq ft</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Net Area</span>
              <p className="font-medium">{data.unitDetails?.netArea || 0} sq ft</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Furnished</span>
              <p className="font-medium capitalize">{data.unitDetails?.furnished || 'Non-furnished'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Pets Allowed</span>
              <p className="font-medium">{data.unitDetails?.petsAllowed ? 'Yes' : 'No'}</p>
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
