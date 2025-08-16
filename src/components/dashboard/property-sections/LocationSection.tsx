'use client';

import { useState, useEffect } from 'react';
import { PencilIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';
import { propertiesAPI } from '@/lib/api-client';

interface LocationSectionProps {
  data: PropertyData;
  propertyId: string;
  onUpdateField: (section: string, field: string, value: unknown) => void;
  errors: Record<string, string>;
}

export function LocationSection({
  data,
  propertyId,
  onUpdateField,
  errors
}: LocationSectionProps) {
  
  // Internal state management
  const [isEditing, setIsEditing] = useState(false);
  const [localAddress, setLocalAddress] = useState<PropertyData['address']>({});
  const [isSavingLocally, setIsSavingLocally] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Initialize local address when data changes
  useEffect(() => {
    setLocalAddress(data.address || {});
  }, [data.address]);
  
  // Internal edit functions
  const handleStartEdit = () => {
    setIsEditing(true);
    setShowSuccessMessage(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original data
    setLocalAddress(data.address || {});
  };

  const handleSaveEdit = async () => {
    try {
      setIsSavingLocally(true);
      
      // Call the API to update the property
      const response = await propertiesAPI.updateProperty(propertyId, {
        address: localAddress as Record<string, unknown>
      });
      
      if (response.success) {
        // Call the parent's onUpdateField to sync the parent component
        onUpdateField('address', 'address', localAddress);
        
        // Show success message
        setShowSuccessMessage(true);
        
        // Exit edit mode
        setIsEditing(false);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        console.error('Failed to update address:', response.error);
      }
    } catch (error) {
      console.error('Error updating address:', error);
    } finally {
      setIsSavingLocally(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Location & Address</h2>
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
            <button
              onClick={handleCancelEdit}
              className="btn-secondary"
            >
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSavingLocally}
              className="btn-primary"
            >
              <span>{isSavingLocally ? 'Saving...' : 'Save Address'}</span>
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <input
                type="text"
                value={localAddress?.unit || ''}
                onChange={(e) => setLocalAddress({ ...localAddress, unit: e.target.value })}
                className="form-input w-full"
                placeholder="Unit number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
              <input
                type="text"
                value={localAddress?.floor || ''}
                onChange={(e) => setLocalAddress({ ...localAddress, floor: e.target.value })}
                className="form-input w-full"
                placeholder="Floor number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
              <input
                type="text"
                value={localAddress?.block || ''}
                onChange={(e) => setLocalAddress({ ...localAddress, block: e.target.value })}
                className="form-input w-full"
                placeholder="Block number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Building Name</label>
            <input
              type="text"
              value={localAddress?.buildingName || ''}
              onChange={(e) => setLocalAddress({ ...localAddress, buildingName: e.target.value })}
              className="form-input w-full"
              placeholder="Building name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
            <input
              type="text"
              value={localAddress?.addressLine1 || ''}
              onChange={(e) => setLocalAddress({ ...localAddress, addressLine1: e.target.value })}
              className="form-input w-full"
              placeholder="Street address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
            <input
              type="text"
              value={localAddress?.addressLine2 || ''}
              onChange={(e) => setLocalAddress({ ...localAddress, addressLine2: e.target.value })}
              className="form-input w-full"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <input
                type="text"
                value={localAddress?.district || ''}
                onChange={(e) => setLocalAddress({ ...localAddress, district: e.target.value })}
                className="form-input w-full"
                placeholder="District"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={localAddress?.state || ''}
                onChange={(e) => setLocalAddress({ ...localAddress, state: e.target.value })}
                className="form-input w-full"
                placeholder="State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={localAddress?.country || ''}
                onChange={(e) => setLocalAddress({ ...localAddress, country: e.target.value })}
                className="form-input w-full"
                placeholder="Country"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="showSpecificLocation"
              checked={localAddress?.showSpecificLocation || false}
              onChange={(e) => setLocalAddress({ ...localAddress, showSpecificLocation: e.target.checked })}
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
                {data.address?.block && `Block ${data.address.block}, `}
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

      {showSuccessMessage && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm mb-0">✅ Address updated successfully!</p>
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
