import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationsAPI } from '@/lib/api-client';
import { Notification } from '@/types/notification';

export const useNotifications = () => {
  const { user: authUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!authUser?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await notificationsAPI.getNotifications(authUser.id);
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!authUser?.id) return;

    try {
      const response = await notificationsAPI.getUnreadCount(authUser.id);
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [authUser?.id]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
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
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [authUser?.id]);

  // Archive notification
  const archiveNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsAPI.archiveNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to archive notification:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Poll for new notifications (similar to chat)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  };
};
