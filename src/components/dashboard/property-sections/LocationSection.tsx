'use client';

import { useState, useEffect } from 'react';
import { PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';
import { propertiesAPI } from '@/lib/api-client';
import { formatAddressForDatabase } from '@/utils/addressFormatter';
import { useToast } from '@/context/ToastContext';
import { COUNTRIES, getDistrictsByCountry, DEFAULT_COUNTRY } from '@/constants/locations';

interface LocationSectionProps {
  propertyId: string;
  onUpdateField: (section: string, field: string, value: unknown) => void;
  errors: Record<string, string>;
}

export function LocationSection({
  propertyId,
  onUpdateField,
  errors
}: LocationSectionProps) {
  
  const { showToast } = useToast();
  
  // Internal state management
  const [isEditing, setIsEditing] = useState(false);
  const [localAddress, setLocalAddress] = useState<PropertyData['address']>({});
  const [originalAddress, setOriginalAddress] = useState<PropertyData['address']>({}); // Store original data
  const [isSavingLocally, setIsSavingLocally] = useState(false);

  // Get districts based on selected country
  const districts = getDistrictsByCountry(localAddress?.country || DEFAULT_COUNTRY);



  // Fetch address data directly from database
  useEffect(() => {
    const fetchAddressData = async () => {
      try {

        console.log('🔍 LocationSection: Fetching address data for propertyId:', propertyId);
        
        const response = await propertiesAPI.getPropertyByUuid(propertyId);
        console.log('🔍 LocationSection: API response:', response);
        
        if (response.success && response.data?.property) {
          const property = response.data.property;
          console.log('🔍 LocationSection: Property data received:', property);
          console.log('🔍 LocationSection: Property address field:', property.address);
          console.log('🔍 LocationSection: Property location field:', property.location);
          console.log('🔍 LocationSection: All property keys:', Object.keys(property));
          console.log('🔍 LocationSection: Property details field:', property.details);
          
          // Extract address data from the API response
          let addressData: PropertyData['address'] = {};
          
          console.log('🔍 LocationSection: Processing address data from API response');
          console.log('🔍 LocationSection: property.address type:', typeof property.address);
          console.log('🔍 LocationSection: property.address value:', property.address);
          
          if (property.address && typeof property.address === 'string') {
            // If address is a JSON string, parse it
            try {
              const parsedAddress = JSON.parse(property.address);
              console.log('🔍 LocationSection: Parsed address from JSON string:', parsedAddress);
              addressData = {
                unit: parsedAddress.unit || '',
                floor: parsedAddress.floor || '',
                block: parsedAddress.block || '',
                building: parsedAddress.building || '',
                addressLine1: parsedAddress.addressLine1 || '',
                addressLine2: parsedAddress.addressLine2 || '',
                district: parsedAddress.district || '',
                state: parsedAddress.state || '',
                country: parsedAddress.country || '',
                city: parsedAddress.city || '',
                showSpecificLocation: parsedAddress.showSpecificLocation || false,
              };
            } catch (parseError) {
              console.error('🔍 LocationSection: Error parsing address JSON:', parseError);
              showToast('error', 'Error parsing address data');
            }
          } else if (property.address && typeof property.address === 'object') {
            // If address is already an object, use it directly
            console.log('🔍 LocationSection: Using address object directly:', property.address);
            addressData = property.address as PropertyData['address'];
          } else if (property.details) {
            // Extract address data from details (fallback for old format)
            console.log('🔍 LocationSection: Using details fallback for address data');
            const details = property.details as Record<string, unknown>;
            addressData = {
              unit: details.unit as string || '',
              floor: details.floor as string || '',
              block: (details.block as string) || '',
              building: (details.buildingName as string) || '',
              addressLine1: details.addressLine1 as string || '',
              addressLine2: details.addressLine2 as string || '',
              district: details.district as string || '',
              state: details.state as string || '',
              country: details.country as string || '',
              city: details.city as string || '',
              showSpecificLocation: false,
            };
          } else {
            console.warn('🔍 LocationSection: No address data found in any expected location');
          }
          
          console.log('🔍 LocationSection: Final extracted address data:', addressData);
          
          // ✅ Store both current and original address data
          setLocalAddress(addressData);
          setOriginalAddress(addressData); // Keep a copy of the original data
          
          // ✅ Only call onUpdateField if we have meaningful data to share
          // This prevents infinite loops and unnecessary parent updates
          if (addressData && Object.keys(addressData).length > 0) {
            console.log('🔍 LocationSection: Updating parent with fetched address data');
            onUpdateField('address', 'address', addressData);
          }
        } else {
          console.error('🔍 LocationSection: Failed to fetch property data:', response.error);
          showToast('error', 'Failed to load address data');
        }
      } catch (error) {
        console.error('🔍 LocationSection: Error fetching address data:', error);
        showToast('error', 'Error loading address data');
      }
    };
    
    if (propertyId) {
      fetchAddressData();
    }
  }, [propertyId, showToast, onUpdateField]);

  // Internal edit functions
  const handleStartEdit = () => {    
    console.log('🔍 LocationSection: handleStartEdit called');
    console.log('🔍 LocationSection: Current localAddress state:', localAddress);
    console.log('🔍 LocationSection: Setting isEditing to true');
    
    setIsEditing(true);
    // ✅ No need to modify localAddress - it already has the current data
  };

  const handleCancelEdit = () => {
    console.log('🔍 LocationSection: handleCancelEdit called');
    console.log('🔍 LocationSection: Resetting to original address:', originalAddress);
    
    setIsEditing(false);
    // ✅ Reset to the original fetched data, not data.address
    setLocalAddress(originalAddress);
  };

  const handleSaveEdit = async () => {
    try {
      setIsSavingLocally(true);
      // Format the address using the utility function to ensure consistent database structure
      const formattedAddress = formatAddressForDatabase(localAddress)

      const response = await propertiesAPI.updateProperty(propertyId, {
        address: formattedAddress
      });

      
      if (response.success) {
        // ✅ Update both current and original address data after successful save
        setOriginalAddress(localAddress);
        
        // Call the parent's onUpdateField to sync the parent component
        onUpdateField('address', 'address', localAddress);
        
        // Show success toast instead of inline message
        showToast('success', 'Address updated successfully!');
        
        // Exit edit mode
        setIsEditing(false);
        
      } else {
        console.error('🔍 LocationSection: Failed to update address:', response.error);
        showToast('error', 'Failed to update address. Please try again.');
      }
    } catch (error) {
      console.error('🔍 LocationSection: Error updating address:', error);
      showToast('error', 'Error updating address. Please try again.');
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Estate/Building</label>
            <input
              type="text"
              value={localAddress?.building || ''}
              onChange={(e) => setLocalAddress({ ...localAddress, building: e.target.value })}
              className="form-input w-full"
              placeholder="Building, apartment, or estate name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
            <input
              type="text"
              value={localAddress?.addressLine1 || ''}
              onChange={(e) => setLocalAddress({ ...localAddress, addressLine1: e.target.value })}
              className="form-input w-full"
              placeholder="Additional address info"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={localAddress?.city || ''}
              onChange={(e) => setLocalAddress({ ...localAddress, city: e.target.value })}
              className="form-input w-full"
              placeholder="City"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={localAddress?.country || DEFAULT_COUNTRY}
                onChange={(e) => setLocalAddress({ ...localAddress, country: e.target.value })}
                className="form-select w-full"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <select
                value={localAddress?.district || ''}
                onChange={(e) => setLocalAddress({ ...localAddress, district: e.target.value })}
                className="form-select w-full"
              >
                <option value="">Select a district</option>
                {districts.map((district) => (
                  <option key={district.code} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
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
          </div>

          {/* Show Specific Location Toggle */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {localAddress?.showSpecificLocation ? (
                  <EyeIcon className="h-5 w-5 text-blue-600" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-0">Show Specific Location</h4>
                  <p className="text-sm text-gray-600 mb-0">
                    {localAddress?.showSpecificLocation 
                      ? 'Tenants will see the exact address details' 
                      : 'Tenants will only see the general area/district'
                    }
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocalAddress({ ...localAddress, showSpecificLocation: !localAddress?.showSpecificLocation })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  localAddress?.showSpecificLocation ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localAddress?.showSpecificLocation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              {/* Primary Address Line - Building, Block, Unit, Floor */}
              <p className="font-medium text-gray-900">
                {localAddress?.building && `${localAddress.building}`}
                {localAddress?.block && `, Block ${localAddress.block}`}
                {localAddress?.unit && `, Unit ${localAddress.unit}`}
                {localAddress?.floor && `, Floor ${localAddress.floor}`}
              </p>
              
              {/* Secondary Address Lines */}
              {(localAddress?.addressLine1 || localAddress?.addressLine2) && (
                <p className="text-gray-600">
                  {localAddress?.addressLine1}
                  {localAddress?.addressLine2 && localAddress.addressLine1 && `, `}
                  {localAddress?.addressLine2}
                </p>
              )}
              
              {/* City, District, State, Country */}
              <p className="text-gray-600">
                {[
                  localAddress?.city,
                  localAddress?.district,
                  localAddress?.state,
                  localAddress?.country
                ].filter(Boolean).join(', ')}
              </p>
              
              {/* Show if no address data is available */}
              {(!localAddress || Object.keys(localAddress).length === 0 || 
                (!localAddress.building && !localAddress.block && !localAddress.unit && 
                 !localAddress.floor && !localAddress.city)) && (
                <p className="text-gray-500 italic">No address information available</p>
              )}
            </div>
          </div>
          
          {localAddress?.showSpecificLocation && (
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