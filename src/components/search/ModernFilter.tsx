'use client';

import { 
  XMarkIcon,
  MapPinIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import { Bed } from '@/assets/icons';

interface FilterData {
  location: string;
  bedrooms: string;
  maxPrice: string;
}

interface ModernFilterProps {
  filters: FilterData;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ModernFilter({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  onApplyFilters,
  isOpen,
  onToggle
}: ModernFilterProps) {

  const handleApply = () => {
    onApplyFilters();
    onToggle(); // Close the filter panel
  };

  const handleClear = () => {
    onClearFilters();
    onToggle(); // Close the filter panel
  };

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
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-140px)]">
            {/* Location Filter */}
            <div>
              <label className="form-label">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5 text-blue-500" />
                  <span>Location</span>
                </div>
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => onFilterChange('location', e.target.value)}
                placeholder="Enter city, neighborhood..."
                className="form-input"
              />
            </div>

            {/* Bedrooms Filter */}
            <div>
              <label className="form-label">
                <div className="flex items-center space-x-2">
                  <Bed className="h-5 w-5 text-blue-500" />
                  <span>Minimum Bedrooms</span>
                </div>
              </label>
              <select
                value={filters.bedrooms}
                onChange={(e) => onFilterChange('bedrooms', e.target.value)}
                className="form-select"
              >
                <option value="">Any Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4 Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="form-label">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
                  <span>Maximum Price (HKD)</span>
                </div>
              </label>
              <select
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                className="form-select"
              >
                <option value="">Any Price</option>
                <option value="10000">Under 10,000 HKD</option>
                <option value="15000">Under 15,000 HKD</option>
                <option value="20000">Under 20,000 HKD</option>
                <option value="25000">Under 25,000 HKD</option>
                <option value="30000">Under 30,000 HKD</option>
                <option value="40000">Under 40,000 HKD</option>
                <option value="50000">Under 50,000 HKD</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
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
