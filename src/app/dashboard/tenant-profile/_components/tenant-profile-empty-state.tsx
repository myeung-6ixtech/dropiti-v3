"use client"

interface TenantProfileEmptyStateProps {
  onCreateProfile: () => void
}

export function TenantProfileEmptyState({ onCreateProfile }: TenantProfileEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Created Yet</h3>
        <p className="text-gray-600 mb-6">
          Create your tenant profile to start connecting with landlords and finding your perfect rental.
        </p>
        <button
          onClick={onCreateProfile}
          className="form-button inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md"
        >
          Create Your Profile
        </button>
      </div>
    </div>
  )
}
