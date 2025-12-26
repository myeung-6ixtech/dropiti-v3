'use client';

import { useState } from 'react';
import { 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { ActivityHeader } from './_components/activity-header';

export default function ActivityPage() {
  const [activities] = useState([
    {
      id: 1,
      type: 'view',
      title: 'Viewed property',
      description: 'Modern 2BR Apartment in Central',
      timestamp: '2 hours ago',
      icon: EyeIcon
    },
    {
      id: 2,
      type: 'save',
      title: 'Saved property',
      description: 'Luxury Condo in Causeway Bay',
      timestamp: '1 day ago',
      icon: HeartIcon
    },
    {
      id: 3,
      type: 'message',
      title: 'New message',
      description: 'From Sarah Johnson regarding property inquiry',
      timestamp: '2 days ago',
      icon: ChatBubbleLeftIcon
    },
    {
      id: 4,
      type: 'application',
      title: 'Application submitted',
      description: 'For Studio Apartment in Wan Chai',
      timestamp: '3 days ago',
      icon: DocumentTextIcon
    }
  ]);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view':
        return 'text-black bg-gray-100';
      case 'save':
        return 'text-red-600 bg-red-100';
      case 'message':
        return 'text-green-600 bg-green-100';
      case 'application':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ActivityHeader />

      {/* Activity List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
