'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TenantMarketplaceFilterProps {
  filters: {
    budget_min: string;
    budget_max: string;
    location: string;
    move_in_date: string;
    property_type: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const LOCATION_OPTIONS = [
  'Central', 'Tsim Sha Tsui', 'Causeway Bay', 'Wan Chai', 'Admiralty',
  'Sheung Wan', 'Mid-Levels', 'Happy Valley', 'North Point', 'Quarry Bay',
  'Tai Koo', 'Sai Wan Ho', 'Shau Kei Wan', 'Chai Wan', 'Aberdeen',
  'Pok Fu Lam', 'Kennedy Town', 'Sai Ying Pun', 'Mong Kok', 'Yau Ma Tei',
  'Jordan', 'Tsim Sha Tsui', 'Hung Hom', 'To Kwa Wan', 'Ma Tau Wai',
  'Ho Man Tin', 'Kowloon Tong', 'Lok Fu', 'Wong Tai Sin', 'Diamond Hill',
  'Choi Hung', 'Ngau Chi Wan', 'Lam Tin', 'Kwun Tong', 'Ngau Tau Kok',
  'Kowloon Bay', 'Choi Hung', 'Diamond Hill', 'Wong Tai Sin', 'Lok Fu'
];

const PROPERTY_TYPE_OPTIONS = [
  'apartment', 'house', 'studio', 'condo', 'townhouse', 'serviced_apartment'
];

export default function TenantMarketplaceFilter({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  isOpen,
  onToggle,
}: TenantMarketplaceFilterProps) {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleTempFilterChange = (key: string, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    // Apply all temporary filters
    Object.keys(tempFilters).forEach(key => {
      if (tempFilters[key as keyof typeof tempFilters] !== filters[key as keyof typeof filters]) {
        onFilterChange(key, tempFilters[key as keyof typeof tempFilters]);
      }
    });
    onApplyFilters();
    onToggle();
  };

  const handleClear = () => {
    const clearedFilters = {
      budget_min: '',
      budget_max: '',
      location: '',
      move_in_date: '',
      property_type: '',
    };
    setTempFilters(clearedFilters);
    onClearFilters();
    onToggle();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onToggle}
      />
      
      {/* Filter Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Filter Tenant Profiles</h2>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Budget Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Budget Range (HKD)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Min Budget</label>
                  <input
                    type="number"
                    value={tempFilters.budget_min}
                    onChange={(e) => handleTempFilterChange('budget_min', e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max Budget</label>
                  <input
                    type="number"
                    value={tempFilters.budget_max}
                    onChange={(e) => handleTempFilterChange('budget_max', e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Location */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Preferred Location</h3>
              <select
                value={tempFilters.location}
                onChange={(e) => handleTempFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any location</option>
                {LOCATION_OPTIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Move-in Date */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Preferred Move-in Date</h3>
              <input
                type="date"
                value={tempFilters.move_in_date}
                onChange={(e) => handleTempFilterChange('move_in_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Property Type */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Preferred Property Type</h3>
              <select
                value={tempFilters.property_type}
                onChange={(e) => handleTempFilterChange('property_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any type</option>
                {PROPERTY_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            <button
              onClick={handleApply}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClear}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
