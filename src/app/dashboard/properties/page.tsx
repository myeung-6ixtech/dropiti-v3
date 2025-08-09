'use client';

import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function PropertiesPage() {
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

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
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
      </div>

      {/* Properties Grid */}
      <div className="flex-1 overflow-auto p-6">
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{property.type}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.status === 'Available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {property.status}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-lg font-semibold text-gray-900">{property.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
