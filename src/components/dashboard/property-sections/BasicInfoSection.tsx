'use client';

import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';

interface BasicInfoSectionProps {
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

export function BasicInfoSection({
  data,
  tempData,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onUpdateField,
  errors,
  isSaving
}: BasicInfoSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
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
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={tempData.propertyType || ''}
              onChange={(e) => onUpdateField('propertyType', 'propertyType', e.target.value)}
              className="form-select w-full"
            >
              <option value="">Select property type</option>
              <option value="residential">Residential</option>
            </select>
          </div>

          {/* Residential Type */}
          {tempData.propertyType === 'residential' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Residential Type
              </label>
              <select
                value={tempData.residentialType || ''}
                onChange={(e) => onUpdateField('residentialType', 'residentialType', e.target.value)}
                className="form-select w-full"
              >
                <option value="">Select residential type</option>
                <option value="serviced-apartment">Serviced Apartment</option>
                <option value="village-house">Village House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condominium</option>
              </select>
            </div>
          )}

          {/* Rental Space */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rental Space
            </label>
            <select
              value={tempData.rentalSpace || ''}
              onChange={(e) => onUpdateField('rentalSpace', 'rentalSpace', e.target.value)}
              className="form-select w-full"
            >
              <option value="">Select rental space</option>
              <option value="entire-apartment">Entire Apartment</option>
              <option value="partial-apartment">Partial Apartment</option>
              <option value="shared-space">Shared Space</option>
              <option value="private-room">Private Room</option>
            </select>
          </div>

          {/* Listing Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing Name
            </label>
            <input
              type="text"
              value={tempData.rentalDetails?.listingName || ''}
              onChange={(e) => onUpdateField('rentalDetails', 'listingName', e.target.value)}
              className="form-input w-full"
              placeholder="Enter listing name"
            />
          </div>

          {/* Listing Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing Description
            </label>
            <textarea
              value={tempData.rentalDetails?.listingDescription || ''}
              onChange={(e) => onUpdateField('rentalDetails', 'listingDescription', e.target.value)}
              rows={4}
              className="form-textarea w-full"
              placeholder="Describe your property"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Display Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Property Type</span>
              <p className="font-medium capitalize text-gray-700">{data.propertyType || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Residential Type</span>
              <p className="font-medium capitalize text-gray-700">{data.residentialType || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Rental Space</span>
              <p className="font-medium capitalize text-gray-700">{data.rentalSpace || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Listing Name</span>
              <p className="font-medium capitalize text-gray-700">{data.rentalDetails?.listingName || 'Not specified'}</p>
            </div>
          </div>
          
          {data.rentalDetails?.listingDescription && (
            <div>
              <span className="text-sm text-gray-500">Description</span>
              <p className="font-medium text-gray-700 mt-1">{data.rentalDetails.listingDescription}</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {errors.basic && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.basic}</p>
        </div>
      )}
    </div>
  );
}
