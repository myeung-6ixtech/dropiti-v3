"use client"

import { MapPinIcon } from '@heroicons/react/24/outline'

interface PropertyMapSectionProps {
  location: string
  mapLoaded: boolean
  mapError: string | null
  hasApiKey: boolean
}

export function PropertyMapSection({
  location,
  mapLoaded,
  mapError,
  hasApiKey
}: PropertyMapSectionProps) {
  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPinIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Location</h2>
        </div>
        
        {location && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Address:</span> {location}
            </p>
          </div>
        )}
        
        <div className="relative">
          <div 
            id="property-map" 
            className="w-full h-96 rounded-lg border border-gray-200 bg-gray-100"
            style={{ minHeight: '384px' }}
          >
            {!hasApiKey ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Google Maps API key not configured</p>
                  <p className="text-gray-400 text-xs mt-1">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables</p>
                </div>
              </div>
            ) : mapError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MapPinIcon className="h-12 w-12 text-red-400 mx-auto mb-2" />
                  <p className="text-red-500 text-sm">Failed to load map</p>
                  <p className="text-gray-400 text-xs mt-1">{mapError}</p>
                </div>
              </div>
            ) : !mapLoaded ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading map...</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Map will appear here</p>
                  <p className="text-gray-400 text-xs mt-1">Initializing Google Maps...</p>
                </div>
              </div>
            )}
          </div>
          
          {mapLoaded && hasApiKey && (
            <div className="absolute top-2 right-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <p className="text-xs text-gray-500">
                Click marker for details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
