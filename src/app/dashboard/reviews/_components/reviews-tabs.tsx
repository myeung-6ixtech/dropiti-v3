"use client"

import { ReviewTab, ReviewTabType } from '@/types/review'

interface ReviewsTabsProps {
  tabs: ReviewTab[]
  activeTab: ReviewTabType
  onTabChange: (tab: ReviewTabType) => void
}

export function ReviewsTabs({ tabs, activeTab, onTabChange }: ReviewsTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>{tab.name}</span>
              {tab.count > 0 && (
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  )
}
