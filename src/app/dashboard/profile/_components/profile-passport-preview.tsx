"use client"

import DropitiPassport2 from '@/components/common/DropitiPassport2'

interface ProfilePassportPreviewProps {
  user: {
    displayName: string
    avatar: string
    email: string
    location?: string
    created_at: string
    verified: boolean
    rating: number
    reviewCount: number
    about?: string
    languages: string[]
    stats: {
      responseRate: number
      avgResponseTime: string
      totalProperties: number
      publishedProperties: number
    }
  }
  firebaseUid: string
}

export function ProfilePassportPreview({ user, firebaseUid }: ProfilePassportPreviewProps) {
  return (
    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900 mb-0">Your Dropiti Passport</h2>
        <span className="text-sm text-gray-500 mt-1mb-0">Live Preview</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        This is how your Dropiti Passport appears to others. Click "Edit Profile" to make changes.
      </p>
      <div className="bg-gray-50 rounded-lg p-4">
        <DropitiPassport2 user={user} firebaseUid={firebaseUid} />
      </div>
    </div>
  )
}
