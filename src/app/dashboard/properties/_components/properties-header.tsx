"use client"

import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

interface PropertiesHeaderProps {
  propertyCount: number
  draftCount: number
}

export function PropertiesHeader({ 
  propertyCount, 
  draftCount 
}: PropertiesHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-0">Properties</h1>
          <p className="text-gray-600 mt-1">Manage your property listings</p>
        </div>
        <Link 
          href="/dashboard/add-property" 
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>
    </div>
  )
}
