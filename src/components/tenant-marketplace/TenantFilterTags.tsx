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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => {
          const IconComponent = filter.icon;
          return (
            <div
              key={filter.key}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-800"
            >
              <IconComponent className="h-4 w-4" />
              <span>{filter.label}</span>
              <button
                onClick={() => onRemoveFilter(filter.key)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
