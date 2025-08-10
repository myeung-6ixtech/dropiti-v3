'use client';

import { useState } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon,
  MapPinIcon, 
  HomeIcon, 
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

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
}

export default function ModernFilter({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  onApplyFilters 
}: ModernFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = () => setIsOpen(!isOpen);

  const handleApply = () => {
    onApplyFilters();
    setIsOpen(false);
  };

  const handleClear = () => {
    onClearFilters();
    setIsOpen(false);
  };

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={toggleFilter}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300"
      >
        <FunnelIcon className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
        <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-500" />
      </button>

      {/* Slide-in Filter Panel */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={toggleFilter}
        />
        
        {/* Filter Panel */}
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
            <button
              onClick={toggleFilter}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-140px)]">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
              />
            </div>

            {/* Bedrooms Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center space-x-2">
                  <HomeIcon className="h-5 w-5 text-green-500" />
                  <span>Bedrooms</span>
                </div>
              </label>
              <select
                value={filters.bedrooms}
                onChange={(e) => onFilterChange('bedrooms', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
              >
                <option value="">Any Bedrooms</option>
                <option value="1">1+ Bedroom</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-purple-500" />
                  <span>Max Price</span>
                </div>
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                placeholder="Enter max price..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-400"
              />
            </div>

            {/* Active Filters Display */}
            {(filters.location || filters.bedrooms || filters.maxPrice) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.location && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      Location: {filters.location}
                    </span>
                  )}
                  {filters.bedrooms && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      {filters.bedrooms}+ Bedrooms
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      Max: ${filters.maxPrice}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
            <div className="flex space-x-3">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
