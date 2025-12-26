"use client"

import { useRouter } from 'next/navigation'

interface EditPropertyErrorProps {
  error: string
  type?: 'error' | 'not-found'
}

export function EditPropertyError({ error, type = 'error' }: EditPropertyErrorProps) {
  const router = useRouter()

  const isNotFound = type === 'not-found'
  const bgColor = isNotFound ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
  const textColor = isNotFound ? 'text-yellow-800' : 'text-red-800'
  const buttonColor = isNotFound ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'
  const title = isNotFound ? 'Property Not Found' : 'Error'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${bgColor} border rounded-lg p-6`}>
          <h2 className={`text-lg font-semibold ${textColor} mb-2`}>{title}</h2>
          <p className={`${textColor.replace('800', '700')} mb-4`}>{error}</p>
          <button
            onClick={() => router.back()}
            className={`px-4 py-2 ${buttonColor} text-white rounded-lg transition-colors`}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
