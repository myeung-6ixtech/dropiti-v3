"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline'

interface PropertyDetailHeaderProps {
  property: {
    title: string
    location: string
    bedrooms: number
    bathrooms: number
    property_type: string
    price: number
    status?: string
    property_uuid: string
  }
  isOwner: boolean
}

export function PropertyDetailHeader({ property, isOwner }: PropertyDetailHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {property.status === 'published' ? 'Active' : 'Draft'}
          </div>
          
          {isOwner && (
            <Link
              href={`/dashboard/properties/edit/${property.property_uuid}`}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit</span>
            </Link>
          )}
        </div>
      </div>
      
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
        <div className="mt-2 space-y-1">
          <p className="text-gray-600">{property.location}</p>
          <p className="text-sm text-gray-500">
            {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''} • {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''} • {property.property_type} • ${property.price.toLocaleString()}/month
          </p>
        </div>
      </div>
    </div>
  )
}
