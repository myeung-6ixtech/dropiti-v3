'use client';

import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, ViewColumnsIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [properties] = useState([
    {
      id: 1,
      name: 'Modern 2BR Apartment in Central',
      address: '123 Hennessy Road, Central',
      type: 'Apartment',
      status: 'Available',
      price: '$25,000/month',
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      name: 'Luxury Condo in Causeway Bay',
      address: '456 Lockhart Road, Causeway Bay',
      type: 'Condo',
      status: 'Rented',
      price: '$35,000/month',
      image: '/api/placeholder/300/200'
    }
  ]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-1">Manage your property listings</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Property
          </button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <ViewColumnsIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-700'
              }`}
              title="List View"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Properties Display */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-gray-100">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">Property Image</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{property.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{property.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="mb-3 pt-3 border-t border-gray-100">
                    <span className="text-lg font-semibold text-gray-900">{property.price}</span>
                  </div>
                  <Link
                    href={`/dashboard/properties/${property.id}/incoming-offers`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Offers
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-500">Image</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{property.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{property.type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {property.status}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">{property.price}</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/properties/${property.id}/incoming-offers`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    View Offers
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
