'use client';

import { MapIcon, ListBulletIcon } from '@heroicons/react/24/outline';

export type ViewMode = 'list' | 'map';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ viewMode, onToggle }: ViewModeToggleProps) {
  return (
    <div className="w-full flex justify-center lg:justify-start">
      <div
        className="inline-flex items-center bg-gray-900 rounded-full shadow-md lg:shadow-xl p-1 gap-1 max-w-full"
        role="group"
        aria-label="View as map or list"
      >
        <button
          onClick={() => onToggle('map')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            viewMode === 'map'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <MapIcon className="h-4 w-4" />
          Map
        </button>
        <button
          onClick={() => onToggle('list')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            viewMode === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <ListBulletIcon className="h-4 w-4" />
          List
        </button>
      </div>
    </div>
  );
}
