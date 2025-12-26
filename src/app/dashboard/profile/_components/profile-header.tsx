"use client"

import { FiEdit } from 'react-icons/fi'

interface ProfileHeaderProps {
  onEdit: () => void
}

export function ProfileHeader({ onEdit }: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your profile information</p>
        </div>
        <button
          onClick={onEdit}
          className="btn-primary flex items-center space-x-2"
        >
          <FiEdit className="h-4 w-4" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  )
}
