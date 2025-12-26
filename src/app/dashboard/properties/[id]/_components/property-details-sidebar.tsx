"use client"

import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/24/outline'

interface PropertyDetailsSidebarProps {
  property: {
    property_type: string
    rental_space?: string
    bedrooms: number
    bathrooms: number
    gross_area_size: number
    gross_area_size_unit: string
    furnished: boolean
    pets_allowed: boolean
    price: number
    property_uuid: string
  }
  isOwner: boolean
}

export function PropertyDetailsSidebar({ property, isOwner }: PropertyDetailsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Property Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Type</span>
            <span className="font-medium capitalize">{property.property_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rental Space</span>
            <span className="font-medium capitalize">{property.rental_space?.replace('-', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bedrooms</span>
            <span className="font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bathrooms</span>
            <span className="font-medium">{property.bathrooms}</span>
          </div>
          {property.gross_area_size > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Area</span>
              <span className="font-medium">{property.gross_area_size} {property.gross_area_size_unit}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Furnished</span>
            <span className="font-medium">{property.furnished ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pets Allowed</span>
            <span className="font-medium">{property.pets_allowed ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            ${property.price.toLocaleString()}
          </div>
          <div className="text-gray-600">per month</div>
        </div>
      </div>

      {/* Actions */}
      {isOwner && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="space-y-3">
            <Link
              href={`/dashboard/properties/edit/${property.property_uuid}`}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit Property</span>
            </Link>
            <Link
              href={`/dashboard/properties/${property.property_uuid}/incoming-offers`}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>View Offers</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
