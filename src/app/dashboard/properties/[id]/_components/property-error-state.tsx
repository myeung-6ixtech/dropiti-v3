"use client"

import { useRouter } from 'next/navigation'

interface PropertyErrorStateProps {
  error: string | null
}

export function PropertyErrorState({ error }: PropertyErrorStateProps) {
  const router = useRouter()

  return (
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Property</h3>
        <p className="text-red-600 mb-4">{error || 'Property not found'}</p>
        <button
          onClick={() => router.back()}
          className="btn-danger"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}
