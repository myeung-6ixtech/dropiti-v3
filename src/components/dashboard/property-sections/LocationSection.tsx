'use client';

import { PencilIcon, CheckIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';

interface LocationSectionProps {
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

export function LocationSection({
  data,
  tempData,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onUpdateField,
  errors,
  isSaving
}: LocationSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Location & Address</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <input
                type="text"
                value={tempData.address?.unit || ''}
                onChange={(e) => onUpdateField('address', 'unit', e.target.value)}
                className="form-input w-full"
                placeholder="Unit number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
              <input
                type="text"
                value={tempData.address?.floor || ''}
                onChange={(e) => onUpdateField('address', 'floor', e.target.value)}
                className="form-input w-full"
                placeholder="Floor number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Building Name</label>
            <input
              type="text"
              value={tempData.address?.buildingName || ''}
              onChange={(e) => onUpdateField('address', 'buildingName', e.target.value)}
              className="form-input w-full"
              placeholder="Building name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
            <input
              type="text"
              value={tempData.address?.addressLine1 || ''}
              onChange={(e) => onUpdateField('address', 'addressLine1', e.target.value)}
              className="form-input w-full"
              placeholder="Street address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
            <input
              type="text"
              value={tempData.address?.addressLine2 || ''}
              onChange={(e) => onUpdateField('address', 'addressLine2', e.target.value)}
              className="form-input w-full"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <input
                type="text"
                value={tempData.address?.district || ''}
                onChange={(e) => onUpdateField('address', 'district', e.target.value)}
                className="form-input w-full"
                placeholder="District"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={tempData.address?.state || ''}
                onChange={(e) => onUpdateField('address', 'state', e.target.value)}
                className="form-input w-full"
                placeholder="State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={tempData.address?.country || ''}
                onChange={(e) => onUpdateField('address', 'country', e.target.value)}
                className="form-input w-full"
                placeholder="Country"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="showSpecificLocation"
              checked={tempData.address?.showSpecificLocation || false}
              onChange={(e) => onUpdateField('address', 'showSpecificLocation', e.target.checked)}
              className="form-checkbox"
            />
            <label htmlFor="showSpecificLocation" className="text-sm text-gray-700">
              Show specific location to potential tenants
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {data.address?.buildingName && `${data.address.buildingName}, `}
                {data.address?.unit && `Unit ${data.address.unit}, `}
                {data.address?.floor && `Floor ${data.address.floor}`}
              </p>
              <p className="text-gray-600">
                {data.address?.addressLine1}
                {data.address?.addressLine2 && `, ${data.address.addressLine2}`}
              </p>
              <p className="text-gray-600">
                {data.address?.district}
                {data.address?.state && `, ${data.address.state}`}
                {data.address?.country && `, ${data.address.country}`}
              </p>
            </div>
          </div>
          
          {data.address?.showSpecificLocation && (
            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              ✓ Specific location will be shown to potential tenants
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {errors.location && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.location}</p>
        </div>
      )}
    </div>
  );
}
