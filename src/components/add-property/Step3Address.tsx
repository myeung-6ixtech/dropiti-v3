'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { COUNTRIES, getDistrictsByCountry, DEFAULT_COUNTRY } from '@/constants/locations';
import PropertyMap from '@/components/common/PropertyMap';

interface Step3AddressProps {
  data?: {
    address?: {
      unit?: string;
      floor?: string;
      block?: string;
      buildingName?: string;
      addressLine1?: string;
      addressLine2?: string;
      district?: string;
      state?: string;
      country?: string;
    };
    showSpecificLocation?: boolean;
  };
  onUpdate: (data: { 
    address?: {
      unit?: string;
      floor?: string;
      block?: string;
      buildingName?: string;
      addressLine1?: string;
      addressLine2?: string;
      district?: string;
      state?: string;
      country?: string;
    };
    showSpecificLocation?: boolean;
  }) => void;
}

export default function Step3Address({ data, onUpdate }: Step3AddressProps) {
  const [address, setAddress] = useState(data?.address || {
    unit: '',
    floor: '',
    block: '',
    buildingName: '',
    addressLine1: '',
    addressLine2: '',
    district: '',
    state: '',
    country: DEFAULT_COUNTRY, // Set default country to Hong Kong
  });
  
  const [showSpecificLocation, setShowSpecificLocation] = useState(data?.showSpecificLocation ?? false);
  
  // Debounced address for map updates (reduces API calls)
  const [debouncedAddress, setDebouncedAddress] = useState(address);
  const [isMapUpdating, setIsMapUpdating] = useState(false);

  // Function to format address based on showSpecificLocation flag
  const formatAddressDisplay = useCallback((addressData: typeof address, showSpecificLocation: boolean) => {
    if (!showSpecificLocation) {
      // If showSpecificLocation is false, show district with country for better geocoding
      const district = addressData.district || 'Unknown District';
      const country = addressData.country || 'Hong Kong';
      return `${district}, ${country}`;
    }
    
    // If showSpecificLocation is true, show Address Line 1 with district and country for better geocoding
    const addressLine1 = addressData.addressLine1 || '';
    const district = addressData.district || '';
    const country = addressData.country || 'Hong Kong';
    
    if (addressLine1) {
      return `${addressLine1}, ${district}, ${country}`;
    }
    
    return '';
  }, []);

  // Debounce address updates for map (2 second delay)
  useEffect(() => {
    // Check if address has changed from debounced version
    const hasAddressChanged = JSON.stringify(address) !== JSON.stringify(debouncedAddress);
    
    if (hasAddressChanged) {
      setIsMapUpdating(true);
      
      const timer = setTimeout(() => {
        setDebouncedAddress(address);
        setIsMapUpdating(false);
      }, 2000);

      return () => {
        clearTimeout(timer);
        setIsMapUpdating(false);
      };
    }
  }, [address, debouncedAddress]);

  // Memoized formatted address for the map (uses debounced address)
  const formattedAddress = useMemo(() => {
    return formatAddressDisplay(debouncedAddress, showSpecificLocation);
  }, [debouncedAddress, showSpecificLocation, formatAddressDisplay]);

  // Key to force map refresh when showSpecificLocation or debounced address changes
  const mapKey = useMemo(() => {
    return `${showSpecificLocation}-${debouncedAddress.addressLine1}-${debouncedAddress.district}-${debouncedAddress.country}`;
  }, [showSpecificLocation, debouncedAddress.addressLine1, debouncedAddress.district, debouncedAddress.country]);

  const handleInputChange = (field: string, value: string) => {
    const updatedAddress = { ...address, [field]: value };
    setAddress(updatedAddress);
    onUpdate({ address: updatedAddress, showSpecificLocation });
  };

  const handleToggleSpecificLocation = (value: boolean) => {
    setShowSpecificLocation(value);
    onUpdate({ address, showSpecificLocation: value });
  };

  // Get districts based on selected country
  const districts = getDistrictsByCountry(address.country || DEFAULT_COUNTRY);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Where is your property located?
        </h3>
        <p className="text-gray-600 mb-4">
          Enter the complete address of your property. This information will help potential tenants find and evaluate your listing.
        </p>
      <hr className="my-8" />
        {/* Two-column layout: Form on left, Map on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Address Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              {/* Location Details */}
              <div className="space-y-5">
                <h4 className="font-medium text-gray-900 text-base">Location Details</h4>
                <div className="space-y-2">
                  <label className="form-label">
                    Address Line 1 (*)
                  </label>
                  <input
                    type="text"
                    value={address.addressLine1 || ''}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    placeholder="e.g., 123 Hennessy Road"
                    className="form-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="form-label">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={address.addressLine2 || ''}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    placeholder="e.g., Suite 100"
                    className="form-input"
                  />
                </div>
                 {/* District and State/Region in one row */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="form-label">
                       District (*)
                     </label>
                     <select
                       value={address.district || ''}
                       onChange={(e) => handleInputChange('district', e.target.value)}
                       className="form-select"
                       required
                     >
                       <option value="">Select a district</option>
                       {districts.map((district) => (
                         <option key={district.code} value={district.name}>
                           {district.name}
                         </option>
                       ))}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="form-label">
                       State/Region
                     </label>
                     <input
                       type="text"
                       value={address.state || ''}
                       onChange={(e) => handleInputChange('state', e.target.value)}
                       placeholder="e.g., Hong Kong"
                       className="form-input"
                     />
                   </div>
                 </div>

                <div className="space-y-2">
                  <label className="form-label">
                    Country (*)
                  </label>
                  <select
                    value={address.country || DEFAULT_COUNTRY}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="form-select"
                    required
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Building Details */}
              <div className="space-y-5">
                <h4 className="font-medium text-gray-900 text-base">Building Details</h4>
                
                 {/* Unit, Floor, Block in one row */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <label className="form-label">
                       Unit Number
                     </label>
                     <input
                       type="text"
                       value={address.unit || ''}
                       onChange={(e) => handleInputChange('unit', e.target.value)}
                       placeholder="e.g., 1501"
                       className="form-input"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="form-label">
                       Floor
                     </label>
                     <input
                       type="text"
                       value={address.floor || ''}
                       onChange={(e) => handleInputChange('floor', e.target.value)}
                       placeholder="e.g., 15th"
                       className="form-input"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="form-label">
                       Block
                     </label>
                     <input
                       type="text"
                       value={address.block || ''}
                       onChange={(e) => handleInputChange('block', e.target.value)}
                       placeholder="e.g., Block A"
                       className="form-input"
                     />
                   </div>
                 </div>

                <div className="space-y-2">
                  <label className="form-label">
                    Building Name / Estate
                  </label>
                  <input
                    type="text"
                    value={address.buildingName || ''}
                    onChange={(e) => handleInputChange('buildingName', e.target.value)}
                    placeholder="e.g., The Arch, Causeway Bay"
                    className="form-input"
                  />
                </div>
              </div>
          </div>
          {/* Show Specific Location Toggle */}
          <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showSpecificLocation ? (
                <EyeIcon className="h-5 w-5 text-purple-600" />
              ) : (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-0">Show Specific Location</h4>
                <p className="text-sm text-gray-600 mb-0">
                  {showSpecificLocation 
                    ? 'Tenants will see the specific address (Address Line 1)' 
                    : 'Tenants will only see the district'
                  }
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleSpecificLocation(!showSpecificLocation)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                showSpecificLocation ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showSpecificLocation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            </div>
          </div>
          </div>

          {/* Right Column: Map Preview */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-base">Map Preview</h4>
                {isMapUpdating && (
                  <div className="flex items-center text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Updating...
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                This is how your property location will appear to potential tenants.
                {isMapUpdating && (
                  <span className="block mt-1 text-blue-600">
                    Map will update 2 seconds after you stop typing...
                  </span>
                )}
              </p>
            </div>
            
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
              {formattedAddress ? (
                <PropertyMap 
                  key={mapKey}
                  address={formattedAddress}
                  location={formattedAddress}
                  className="w-full"
                  disableGeocoding={false}
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Map Preview</p>
                    <p className="text-sm text-gray-500">
                      {showSpecificLocation 
                        ? 'Enter Address Line 1 to see location' 
                        : 'Select a district to see location'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Address Preview */}
            {formattedAddress && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2 text-sm">Address Preview</h5>
                <div className="text-sm text-gray-600">
                  <div className="mb-2">{formattedAddress}</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      showSpecificLocation 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {showSpecificLocation ? 'Address Line 1 shown' : 'District only shown'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
