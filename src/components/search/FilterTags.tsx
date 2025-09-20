'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Bed } from '@/assets/icons';

interface FilterTagsProps {
  filters: {
    location: string;
    bedrooms: string;
    maxPrice: string;
  };
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

export default function FilterTags({ filters, onRemoveFilter, onClearAll }: FilterTagsProps) {
  const activeFilters = [];

  // Build array of active filters
  if (filters.location) {
    activeFilters.push({
      key: 'location',
      label: filters.location,
      icon: MapPinIcon,
    });
  }

  if (filters.bedrooms) {
    const bedroomText = filters.bedrooms === '5' ? '5+ bedrooms' : `${filters.bedrooms} bedroom${filters.bedrooms === '1' ? '' : 's'}`;
    activeFilters.push({
      key: 'bedrooms',
      label: bedroomText,
      icon: Bed,
    });
  }

  if (filters.maxPrice) {
    activeFilters.push({
      key: 'maxPrice',
      label: `Under ${parseInt(filters.maxPrice).toLocaleString()} HKD`,
      icon: CurrencyDollarIcon,
    });
  }

  // Don't render if no active filters
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center flex-wrap gap-3">
        <span className="text-sm font-medium text-gray-700 mr-2">Active filters:</span>
        
        {activeFilters.map((filter) => {
          const IconComponent = filter.icon;
          return (
            <div
              key={filter.key}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-black rounded-lg text-sm font-medium text-gray-900"
            >
              <IconComponent className="h-4 w-4" />
              <span>{filter.label}</span>
              <button
                onClick={() => onRemoveFilter(filter.key)}
                className="ml-1 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={`Remove ${filter.label} filter`}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-black rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
}
