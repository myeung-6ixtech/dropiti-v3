"use client"

import { 
  FiUser,
  FiGlobe,
  FiBook,
  FiBriefcase,
  FiHeart,
  FiMapPin,
  FiClock
} from 'react-icons/fi'

interface ProfileSummarySectionProps {
  profile: {
    displayName: string
    email: string
    location?: string
    phoneNumber?: string
    education?: string
    occupation?: string
    maritalStatus?: string
    languages: string[]
    responseTime?: string
    about?: string
  }
  onEdit: () => void
}

export function ProfileSummarySection({ profile, onEdit }: ProfileSummarySectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Summary</h2>
      
      {/* About Section */}
      {profile.about && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 mb-3">About You</h3>
          <p className="text-gray-700 leading-relaxed">{profile.about}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <FiUser className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 mb-0">Display Name</p>
                <p className="text-md font-medium text-gray-700">{profile.displayName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FiUser className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 mb-0">Email</p>
                <p className="font-medium text-gray-700">{profile.email}</p>
              </div>
            </div>

            {profile.location && (
              <div className="flex items-center space-x-3">
                <FiMapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 mb-0">Location</p>
                  <p className="font-medium text-gray-700">{profile.location}</p>
                </div>
              </div>
            )}

            {profile.phoneNumber && (
              <div className="flex items-center space-x-3">
                <FiUser className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 mb-0">Phone Number</p>
                  <p className="font-medium text-gray-700">{profile.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Additional Details</h3>
          
          <div className="space-y-3">
            {profile.education && (
              <div className="flex items-center space-x-3">
                <FiBook className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 mb-0">Education</p>
                  <p className="font-medium text-gray-700">{profile.education}</p>
                </div>
              </div>
            )}

            {profile.occupation && (
              <div className="flex items-center space-x-3">
                <FiBriefcase className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 mb-0">Occupation</p>
                  <p className="font-medium text-gray-700">{profile.occupation}</p>
                </div>
              </div>
            )}

            {profile.maritalStatus && (
              <div className="flex items-center space-x-3">
                <FiHeart className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 mb-0">Marital Status</p>
                  <p className="font-medium text-gray-700">{profile.maritalStatus}</p>
                </div>
              </div>
            )}

            {profile.languages.length > 0 && (
              <div className="flex items-center space-x-3">
                <FiGlobe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 mb-0">Languages</p>
                  <p className="font-medium text-gray-700">{profile.languages.join(', ')}</p>
                </div>
              </div>
            )}

            {profile.responseTime && (
              <div className="flex items-center space-x-3">
                <FiClock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 mb-0">Response Time</p>
                  <p className="font-medium text-gray-700">{profile.responseTime}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile CTA */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 mb-4">Need to update your information?</p>
        <button
          onClick={onEdit}
          className="btn-primary"
        >
          Edit Profile
        </button>
      </div>
    </div>
  )
}
