"use client"

interface NotificationsHeaderProps {
  unreadCount: number
  onMarkAllAsRead: () => void
}

export function NotificationsHeader({ unreadCount, onMarkAllAsRead }: NotificationsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your latest activities and updates.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {unreadCount} unread
          </span>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
