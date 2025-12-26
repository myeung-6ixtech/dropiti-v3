'use client';

import { useState } from 'react';
import { 
  CheckIcon, 
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { NotificationsHeader } from './_components/notifications-header';
import { NotificationsFilters } from './_components/notifications-filters';
import { NotificationsEmptyState } from './_components/notifications-empty-state';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  action?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Property Application Approved',
      message: 'Your application for the Modern 2BR Apartment has been approved by the landlord.',
      timestamp: '2 hours ago',
      read: false,
      avatar: '/images/Portrait_Placeholder.png',
      action: 'View Details'
    },
    {
      id: '2',
      type: 'info',
      title: 'New Message from Landlord',
      message: 'Sarah Johnson sent you a message regarding your property inquiry.',
      timestamp: '4 hours ago',
      read: false,
      avatar: '/images/Portrait_Placeholder.png',
      action: 'Reply'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Payment Due Soon',
      message: 'Your rent payment for February is due in 3 days. Please ensure timely payment.',
      timestamp: '1 day ago',
      read: true,
      action: 'Pay Now'
    },
    {
      id: '4',
      type: 'info',
      title: 'Property Viewing Scheduled',
      message: 'Your property viewing for the Central Apartment has been scheduled for tomorrow at 2:00 PM.',
      timestamp: '2 days ago',
      read: true,
      action: 'View Details'
    },
    {
      id: '5',
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      timestamp: '3 days ago',
      read: true
    },
    {
      id: '6',
      type: 'error',
      title: 'Payment Failed',
      message: 'Your last rent payment attempt was unsuccessful. Please check your payment method.',
      timestamp: '1 week ago',
      read: true,
      action: 'Update Payment'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto">
      <NotificationsHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
      />

      <NotificationsFilters
        filter={filter}
        onFilterChange={setFilter}
        totalCount={notifications.length}
        unreadCount={unreadCount}
        readCount={notifications.filter(n => n.read).length}
      />

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <NotificationsEmptyState filter={filter} />
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative border-l-4 ${getNotificationTypeColor(notification.type)} bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {notification.timestamp}
                        </div>
                        {notification.action && (
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            {notification.action}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Mark as read"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete notification"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
