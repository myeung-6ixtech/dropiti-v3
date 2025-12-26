"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface IncomingOffersHeaderProps {
  property: {
    title: string
    location: string
    bedrooms: number
    bathrooms: number
    property_type: string
    price: number
  }
}

export function IncomingOffersHeader({ property }: IncomingOffersHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
      </div>
      
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Incoming Offers</h1>
        <div className="mt-2 space-y-1">
          <p className="text-gray-600">
            {property.title} • {property.location}
          </p>
          <p className="text-sm text-gray-500">
            {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''} • {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''} • {property.property_type} • ${property.price.toLocaleString()}/month
          </p>
        </div>
      </div>
    </div>
  )
}
