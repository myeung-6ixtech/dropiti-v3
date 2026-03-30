'use client';

import { useState } from 'react';
import { PencilIcon} from '@heroicons/react/24/outline';
import { PropertyData, PROPERTY_TYPE, RESIDENTIAL_TYPE } from '@/types/property';

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

const PHONE_REGEX = /(\+?[\d][\s\-.]?(?:[\d][\s\-.]?){6,}[\d])/;

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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const handleDescriptionChange = (value: string) => {
    if (PHONE_REGEX.test(value)) {
      setDescriptionError('Phone numbers are not allowed in descriptions. Please use the contact options provided.');
    } else {
      setDescriptionError(null);
    }
    onUpdateField('rentalDetails', 'listingDescription', value);
  };

  // Function to check if description needs truncation (500 characters)
  const shouldTruncateDescription = (description: string) => {
    if (!description) return false;
    return description.length > 500;
  };
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
              className="btn-secondary flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span>Cancel</span>
            </button>
            <button
              onClick={onSaveEdit}
              disabled={isSaving || !!descriptionError}
              className="btn-primary flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <span>{isSaving ? 'Saving...' : 'Save Information'}</span>
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
              value={tempData.propertyType || PROPERTY_TYPE.RESIDENTIAL}
              onChange={(e) => onUpdateField('', 'propertyType', e.target.value)}
              className="form-select w-full"
            >
              <option value={PROPERTY_TYPE.RESIDENTIAL}>Residential</option>
            </select>
          </div>

          {/* Residential Type */}
          {tempData.propertyType === PROPERTY_TYPE.RESIDENTIAL && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Residential Type
              </label>
              <select
                value={tempData.residentialType || RESIDENTIAL_TYPE.APARTMENT}
                onChange={(e) => onUpdateField('', 'residentialType', e.target.value)}
                className="form-select w-full"
              >
                <option value="">Select residential type</option>
                <option value={RESIDENTIAL_TYPE.SERVICED_APARTMENT}>Serviced Apartment</option>
                <option value={RESIDENTIAL_TYPE.VILLAGE_HOUSE}>Village House</option>
                <option value={RESIDENTIAL_TYPE.APARTMENT}>Apartment</option>
                <option value={RESIDENTIAL_TYPE.CONDO}>Condominium</option>
              </select>
            </div>
          )}

          {/* Rental Space */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rental Space
            </label>
            <select
              value={tempData.rentalSpace || 'entire-apartment'}
              onChange={(e) => onUpdateField('', 'rentalSpace', e.target.value)}
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
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={4}
              className={`form-textarea w-full ${descriptionError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
              placeholder="Describe your property"
            />
            {descriptionError ? (
              <p className="text-xs text-red-500 mt-1">{descriptionError}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Do not include phone numbers in your description.</p>
            )}
          </div>

          {/* Listing Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing Status
            </label>
            <select
              value={tempData.status || 'draft'}
              onChange={(e) => {
                const newStatus = e.target.value as 'draft' | 'published' | 'archived' | 'expired';
                onUpdateField('', 'status', newStatus);
              }}
              className="form-select w-full"
            >
              <option value="draft">Draft (Not Published)</option>
              <option value="published">Published (Active)</option>
              <option value="archived">Archived</option>
              <option value="expired">Expired</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {tempData.status === 'published'
                ? 'Your listing is visible to the public' 
                : 'Your listing is saved as a draft and not visible to the public'}
            </p>
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
            <div>
              <span className="text-sm text-gray-500">Status</span>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  data.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {data.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
          
          {data.rentalDetails?.listingDescription && (
            <div>
              <span className="text-sm text-gray-500">Description</span>
              <div className="mt-1">
                <p className={`font-medium text-gray-700 whitespace-pre-wrap ${
                  shouldTruncateDescription(data.rentalDetails.listingDescription) && !isDescriptionExpanded 
                    ? 'line-clamp-6' 
                    : ''
                }`}>
                  {data.rentalDetails.listingDescription}
                </p>
                {shouldTruncateDescription(data.rentalDetails.listingDescription) && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-2 text-gray-900 hover:text-gray-700 font-medium text-sm transition-colors"
                  >
                    {isDescriptionExpanded ? 'See Less' : 'See More'}
                  </button>
                )}
              </div>
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
