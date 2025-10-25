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
  'Jordan', 'Hung Hom', 'To Kwa Wan', 'Ma Tau Wai',
  'Ho Man Tin', 'Kowloon Tong', 'Lok Fu', 'Wong Tai Sin', 'Diamond Hill',
  'Choi Hung', 'Ngau Chi Wan', 'Lam Tin', 'Kwun Tong', 'Ngau Tau Kok',
  'Kowloon Bay'
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
    <>
      {/* Slide-in Filter Panel - Fixed overlay that doesn't affect layout */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={onToggle}
        />
        
        {/* Filter Panel - Slides in from right */}
        <div className={`absolute right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Filter Tenant Profiles</h2>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Budget Range */}
            <div>
              <label className="form-label">
                <div className="flex items-center space-x-2">
                  <span>Budget Range (HKD)</span>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    value={tempFilters.budget_min}
                    onChange={(e) => handleTempFilterChange('budget_min', e.target.value)}
                    placeholder="Min Budget"
                    className="form-input"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={tempFilters.budget_max}
                    onChange={(e) => handleTempFilterChange('budget_max', e.target.value)}
                    placeholder="Max Budget"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Location */}
            <div>
              <label className="form-label">
                <div className="flex items-center space-x-2">
                  <span>Preferred Location</span>
                </div>
              </label>
              <select
                value={tempFilters.location}
                onChange={(e) => handleTempFilterChange('location', e.target.value)}
                className="form-select"
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
              <label className="form-label">
                <div className="flex items-center space-x-2">
                  <span>Preferred Move-in Date</span>
                </div>
              </label>
              <input
                type="date"
                value={tempFilters.move_in_date}
                onChange={(e) => handleTempFilterChange('move_in_date', e.target.value)}
                className="form-input"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="form-label">
                <div className="flex items-center space-x-2">
                  <span>Preferred Property Type</span>
                </div>
              </label>
              <select
                value={tempFilters.property_type}
                onChange={(e) => handleTempFilterChange('property_type', e.target.value)}
                className="form-select"
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

          {/* Action Buttons */}
          <div className="flex space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleClear}
              className="btn-outline flex-1"
              type="button"
            >
              Clear All
            </button>
            <button
              onClick={handleApply}
              className="btn-primary flex-1"
              type="button"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
