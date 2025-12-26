"use client"

import { IconType } from 'react-icons'

interface SettingsTab {
  id: string
  name: string
  icon: IconType
}

interface SettingsTabsProps {
  tabs: SettingsTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function SettingsTabs({ tabs, activeTab, onTabChange }: SettingsTabsProps) {
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
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  )
}
