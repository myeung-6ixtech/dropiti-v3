// ========================================
// NOTIFICATION TYPES
// ========================================

export interface NotificationType {
  id: string;
  typeKey: string;
  name: string;
  description: string;
  category: 'offer' | 'property' | 'user' | 'system';
  template: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  typeId: string;
  recipientUserId: string;
  senderUserId?: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
  archivedAt?: string;
  // Related data
  type?: NotificationType;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface NotificationPreference {
  id: string;
  userId: string;
  typeId: string;
  isEnabled: boolean;
  deliveryMethod: 'in_app' | 'email' | 'push' | 'all';
  createdAt: string;
  updatedAt: string;
  type?: NotificationType;
}

export interface CreateNotificationInput {
  typeKey: string;
  recipientUserId: string;
  senderUserId?: string;
  data: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  isArchived?: boolean;
  category?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}

// ========================================
// NOTIFICATION RESPONSES
// ========================================

export interface NotificationResponse {
  success: boolean;
  data?: Notification | Notification[];
  total?: number;
  message: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  total: number;
  message: string;
}

// ========================================
// NOTIFICATION CONSTANTS
// ========================================

export const NOTIFICATION_PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent'
};

export const NOTIFICATION_PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export const NOTIFICATION_CATEGORY_LABELS: Record<string, string> = {
  offer: 'Offers',
  property: 'Properties',
  user: 'Account',
  system: 'System'
};

export const NOTIFICATION_CATEGORY_COLORS: Record<string, string> = {
  offer: 'bg-green-100 text-green-800',
  property: 'bg-blue-100 text-blue-800',
  user: 'bg-purple-100 text-purple-800',
  system: 'bg-gray-100 text-gray-800'
};
