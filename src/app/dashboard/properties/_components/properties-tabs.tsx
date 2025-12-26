"use client"

import { useRouter } from 'next/navigation'

interface PropertiesTabsProps {
  activeTab: 'published' | 'drafts'
  propertyCount: number
  draftCount: number
  onTabChange?: (tab: 'published' | 'drafts') => void
}

export function PropertiesTabs({
  activeTab,
  propertyCount,
  draftCount,
  onTabChange
}: PropertiesTabsProps) {
  const router = useRouter()

  const handleTabChange = (tab: 'published' | 'drafts') => {
    onTabChange?.(tab)
    router.push(`/dashboard/properties?tab=${tab}`)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6">
      <div className="flex space-x-8">
        <button
          onClick={() => handleTabChange('published')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'published'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Published Properties
          {propertyCount > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {propertyCount}
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabChange('drafts')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'drafts'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Drafts
          {draftCount > 0 && (
            <span className="ml-2 bg-purple-100 text-purple-700 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {draftCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
