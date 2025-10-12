'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiX, FiBell, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useMobileNotifications } from '@/context/MobileNotificationsContext';
import { notificationsAPI } from '@/lib/api-client';
import { NotificationSkeleton } from '@/components/skeleton';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  data?: Record<string, unknown>;
}

export default function NotificationsBottomSheet() {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const { isBottomSheetOpen, closeBottomSheet } = useMobileNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  
  // Drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // Fetch user's notifications
  const fetchNotifications = useCallback(async () => {
    if (!authUser?.id) return;

    try {
      setIsLoadingNotifications(true);
      const response = await notificationsAPI.getNotifications(authUser.id, { limit: 20 });
      
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast('error', 'Failed to load notifications');
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [authUser?.id, showToast]);

  // Load notifications when bottom sheet opens
  useEffect(() => {
    if (isBottomSheetOpen) {
      fetchNotifications();
    }
  }, [isBottomSheetOpen, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast('error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!authUser?.id) return;

    try {
      await notificationsAPI.markAllAsRead(authUser.id);
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          isRead: true, 
          readAt: new Date().toISOString() 
        }))
      );
      showToast('success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast('error', 'Failed to mark all notifications as read');
    }
  };

  // Enhanced drag handlers for better iPhone 16 support
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragOffset(0);
    
    // Prevent default to avoid scrolling issues
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartY;
    
    // Only allow downward drag with cap
    if (deltaY > 0) {
      setDragOffset(Math.min(deltaY, 200)); // Cap at 200px
    }
    
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // Reduced threshold for easier closing on iPhone 16
      if (dragOffset > 50) { // Reduced from 100px to 50px
        closeBottomSheet();
      }
      
      setDragOffset(0);
    }
  };

  // Format notification time
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (!isBottomSheetOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-chat-backdrop"
        onClick={closeBottomSheet}
        aria-label="Close notifications"
      />

      {/* Bottom Sheet */}
      <div 
        ref={bottomSheetRef}
        className="mobile-chat-bottom-sheet"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateY(${dragOffset}px)`
        }}
      >
        {/* Handle Bar */}
        <div className="mobile-chat-handle-container">
          <div className="mobile-chat-handle" />
        </div>

        {/* Header */}
        <div className="mobile-chat-header">
          <div className="flex items-center space-x-3">
            <h2 className="mobile-chat-title">Notifications</h2>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <button
            onClick={closeBottomSheet}
            className="mobile-chat-close-button"
            aria-label="Close"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="mobile-chat-list">
          {isLoadingNotifications ? (
            <NotificationSkeleton count={5} className="p-4" />
          ) : notifications.length === 0 ? (
            <div className="mobile-chat-empty">
              <div className="mobile-chat-empty-icon">
                <FiBell className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="mobile-chat-empty-title">No notifications yet</h3>
              <p className="mobile-chat-empty-description">
                You'll see notifications about offers, messages, and updates here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`mobile-chat-contact-item ${
                    !notification.isRead ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="mobile-chat-contact-avatar">
                    <div className="mobile-chat-avatar-placeholder">
                      <FiBell className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="mobile-chat-contact-info">
                    <div className="mobile-chat-contact-header">
                      <p className={`mobile-chat-contact-name ${
                        !notification.isRead ? 'font-bold' : ''
                      }`}>
                        {notification.title}
                      </p>
                      <p className="mobile-chat-contact-time">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="mobile-chat-contact-message">
                      <p className="mobile-chat-last-message">
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 text-purple-600 hover:text-purple-700 rounded-full hover:bg-purple-100"
                          aria-label="Mark as read"
                        >
                          <FiCheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
