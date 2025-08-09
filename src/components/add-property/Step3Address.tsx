'use client';

import { useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

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
  };
  onUpdate: (data: any) => void;
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
    country: '',
  });

  const handleInputChange = (field: string, value: string) => {
    const updatedAddress = { ...address, [field]: value };
    setAddress(updatedAddress);
    onUpdate({ address: updatedAddress });
  };

  const districts = [
    'Central and Western',
    'Eastern',
    'Southern',
    'Wan Chai',
    'Sham Shui Po',
    'Kowloon City',
    'Kwun Tong',
    'Wong Tai Sin',
    'Yau Tsim Mong',
    'Islands',
    'Kwai Tsing',
    'North',
    'Sai Kung',
    'Sha Tin',
    'Tai Po',
    'Tsuen Wan',
    'Tuen Mun',
    'Yuen Long',
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Where is your property located?
        </h3>
        <p className="text-gray-600 mb-6">
          Enter the complete address of your property. This information will help potential tenants find and evaluate your listing.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <MapPinIcon className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Address Guidelines
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Please provide as much detail as possible. This helps tenants understand the exact location and accessibility of your property.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Building Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Building Details</h4>
            
            <div>
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

            <div>
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

            <div>
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

            <div>
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

          {/* Street Address */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Street Address</h4>
            
            <div>
              <label className="form-label">
                Address Line 1 *
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

            <div>
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

            <div>
              <label className="form-label">
                District *
              </label>
              <select
                value={address.district || ''}
                onChange={(e) => handleInputChange('district', e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select a district</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div>
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

            <div>
              <label className="form-label">
                Country
              </label>
              <input
                type="text"
                value={address.country || ''}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="e.g., Hong Kong"
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address Preview */}
      {(address.addressLine1 || address.buildingName) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Address Preview</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {address.unit && <div>Unit {address.unit}</div>}
            {address.floor && <div>Floor {address.floor}</div>}
            {address.block && <div>{address.block}</div>}
            {address.buildingName && <div>{address.buildingName}</div>}
            {address.addressLine1 && <div>{address.addressLine1}</div>}
            {address.addressLine2 && <div>{address.addressLine2}</div>}
            {address.district && <div>{address.district}</div>}
            {address.state && <div>{address.state}</div>}
            {address.country && <div>{address.country}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
