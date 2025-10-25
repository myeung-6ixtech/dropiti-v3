'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { MapPinIcon, CurrencyDollarIcon, CalendarIcon, HomeIcon } from '@heroicons/react/24/outline';

interface TenantFilterTagsProps {
  filters: {
    budget_min: string;
    budget_max: string;
    location: string;
    move_in_date: string;
    property_type: string;
  };
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

export default function TenantFilterTags({ filters, onRemoveFilter, onClearAll }: TenantFilterTagsProps) {
  const activeFilters = [];

  // Build array of active filters
  if (filters.location) {
    activeFilters.push({
      key: 'location',
      label: filters.location,
      icon: MapPinIcon,
    });
  }

  if (filters.budget_min && filters.budget_max) {
    activeFilters.push({
      key: 'budget',
      label: `${parseInt(filters.budget_min).toLocaleString()} - ${parseInt(filters.budget_max).toLocaleString()} HKD`,
      icon: CurrencyDollarIcon,
    });
  } else if (filters.budget_min) {
    activeFilters.push({
      key: 'budget_min',
      label: `Min: ${parseInt(filters.budget_min).toLocaleString()} HKD`,
      icon: CurrencyDollarIcon,
    });
  } else if (filters.budget_max) {
    activeFilters.push({
      key: 'budget_max',
      label: `Max: ${parseInt(filters.budget_max).toLocaleString()} HKD`,
      icon: CurrencyDollarIcon,
    });
  }

  if (filters.move_in_date) {
    const date = new Date(filters.move_in_date);
    const formattedDate = date.toLocaleDateString('en-HK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    activeFilters.push({
      key: 'move_in_date',
      label: `Move-in: ${formattedDate}`,
      icon: CalendarIcon,
    });
  }

  if (filters.property_type) {
    activeFilters.push({
      key: 'property_type',
      label: filters.property_type.charAt(0).toUpperCase() + filters.property_type.slice(1).replace('_', ' '),
      icon: HomeIcon,
    });
  }

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
