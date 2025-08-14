'use client';

import { useState } from 'react';
import { EyeIcon, HeartIcon } from '@heroicons/react/24/outline';
import { formatPropertyLocation } from '@/lib/utils';

export default function SavedPropertiesPage() {
  const [savedProperties] = useState([
    {
      id: 1,
      name: 'Modern 2BR Apartment in Central',
      address: '123 Hennessy Road, Central',
      price: '$25,000/month',
      bedrooms: 2,
      bathrooms: 2,
      area: '800 sq ft',
      image: '/api/placeholder/300/200',
      savedDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Luxury Condo in Causeway Bay',
      address: '456 Lockhart Road, Causeway Bay',
      price: '$35,000/month',
      bedrooms: 3,
      bathrooms: 2,
      area: '1,200 sq ft',
      image: '/api/placeholder/300/200',
      savedDate: '2024-01-12'
    }
  ]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Properties</h1>
          <p className="text-gray-600 mt-1">Your favorite properties</p>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Property Image</span>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                    <HeartIcon className="h-4 w-4 text-red-500 fill-current" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{property.name}</h3>
                  <span className="text-lg font-semibold text-black">{property.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{formatPropertyLocation(property.address)}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.area}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="btn-outline-sm">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button className="btn-outline-sm">
                      <HeartIcon className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">Saved {property.savedDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
