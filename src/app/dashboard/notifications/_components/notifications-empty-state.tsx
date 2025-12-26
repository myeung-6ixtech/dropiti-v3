"use client"

import { BellIcon } from '@heroicons/react/24/outline'

interface NotificationsEmptyStateProps {
  filter: 'all' | 'unread' | 'read'
}

export function NotificationsEmptyState({ filter }: NotificationsEmptyStateProps) {
  const getMessage = () => {
    if (filter === 'all') {
      return "You're all caught up! No notifications yet."
    } else if (filter === 'unread') {
      return 'No unread notifications.'
    } else {
      return 'No read notifications.'
    }
  }

  return (
    <div className="text-center py-12">
      <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
      <p className="mt-1 text-sm text-gray-500">{getMessage()}</p>
    </div>
  )
}
