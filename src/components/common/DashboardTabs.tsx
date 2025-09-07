'use client';

import React from 'react';

interface Tab {
  id: string;
  name: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DashboardTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'large';
  className?: string;
}

export default function DashboardTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'default',
  className = ''
}: DashboardTabsProps) {
  const buttonClass = variant === 'large' 
    ? 'dashboard-tab-button dashboard-tab-button-large'
    : 'dashboard-tab-button';

  return (
    <div className={`dashboard-tabs-container ${className}`}>
      <nav className="dashboard-tabs-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`${buttonClass} ${
              activeTab === tab.id
                ? 'dashboard-tab-button-active'
                : 'dashboard-tab-button-inactive'
            }`}
          >
            <div className="dashboard-tab-button-with-icon">
              {tab.icon && <tab.icon className="h-5 w-5" />}
              <span>{tab.name}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`dashboard-tab-count ${
                  activeTab === tab.id ? 'dashboard-tab-count-active' : ''
                }`}>
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}
