"use client"

interface TenantProfileHeaderProps {
  hasProfile: boolean
  isPublished: boolean
  isPublishing: boolean
  isUnpublishing: boolean
  onPublish: () => void
  onUnpublish: () => void
  onModify: () => void
}

export function TenantProfileHeader({
  hasProfile,
  isPublished,
  isPublishing,
  isUnpublishing,
  onPublish,
  onUnpublish,
  onModify
}: TenantProfileHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Tenant Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            {hasProfile 
              ? 'Manage your tenant marketplace profile' 
              : 'Create your tenant marketplace profile'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasProfile && (
            isPublished ? (
              <button
                onClick={onUnpublish}
                disabled={isUnpublishing}
                className="btn-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
              </button>
            ) : (
              <button
                onClick={onPublish}
                disabled={isPublishing}
                className="form-button inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  'Publish Profile'
                )}
              </button>
            )
          )}
          
          <button
            onClick={onModify}
            className="btn-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md"
          >
            {hasProfile ? 'Modify' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
