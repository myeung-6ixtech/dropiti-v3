"use client"

interface NotificationsFiltersProps {
  filter: 'all' | 'unread' | 'read'
  onFilterChange: (filter: 'all' | 'unread' | 'read') => void
  totalCount: number
  unreadCount: number
  readCount: number
}

export function NotificationsFilters({
  filter,
  onFilterChange,
  totalCount,
  unreadCount,
  readCount
}: NotificationsFiltersProps) {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => onFilterChange('all')}
            className={`${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => onFilterChange('unread')}
            className={`${
              filter === 'unread'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => onFilterChange('read')}
            className={`${
              filter === 'read'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Read ({readCount})
          </button>
        </nav>
      </div>
    </div>
  )
}
