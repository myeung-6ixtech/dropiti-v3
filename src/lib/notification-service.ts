import { executeMutation, executeQuery } from '@/app/api/graphql/serverClient';
import { CreateNotificationInput, Notification, NotificationType, NotificationFilters } from '@/types/notification';

export class NotificationService {
  // Create a notification
  static async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const CREATE_NOTIFICATION_MUTATION = `
      mutation CreateNotification($notification: real_estate_notification_insert_input!) {
        insert_real_estate_notification_one(object: $notification) {
          id
          type_id
          recipient_firebase_uid
          sender_firebase_uid
          title
          message
          data
          is_read
          is_archived
          priority
          expires_at
          created_at
          read_at
          archived_at
        }
      }
    `;

    // Get notification type
    const type = await this.getNotificationType(input.typeKey);
    if (!type) {
      throw new Error(`Notification type ${input.typeKey} not found`);
    }

    // Generate title and message from template
    const { title, message } = this.generateNotificationContent(type, input.data);

    const notification = {
      type_id: type.id,
      recipient_firebase_uid: input.recipientFirebaseUid,
      sender_firebase_uid: input.senderFirebaseUid,
      title,
      message,
      data: input.data,
      priority: input.priority || 'normal',
      expires_at: input.expiresAt,
      created_at: new Date().toISOString(),
    };

    const result = await executeMutation(CREATE_NOTIFICATION_MUTATION, { notification }) as { insert_real_estate_notification_one: Notification };
    return result.insert_real_estate_notification_one;
  }

  // Get notifications for a user
  static async getUserNotifications(
    userFirebaseUid: string,
    filters: NotificationFilters = {}
  ): Promise<Notification[]> {
    // Build the where clause dynamically
    const whereConditions: Record<string, unknown> = {
      recipient_firebase_uid: { _eq: userFirebaseUid },
      is_archived: { _eq: false }
    };

    // Add filter conditions
    if (filters.isRead !== undefined) {
      whereConditions.is_read = { _eq: filters.isRead };
    }

    if (filters.priority) {
      whereConditions.priority = { _eq: filters.priority };
    }

    const GET_NOTIFICATIONS_QUERY = `
      query GetUserNotifications($where: real_estate_notification_bool_exp!, $limit: Int!, $offset: Int!) {
        real_estate_notification(
          where: $where
          order_by: { created_at: desc }
          limit: $limit
          offset: $offset
        ) {
          id
          type_id
          recipient_firebase_uid
          sender_firebase_uid
          title
          message
          data
          is_read
          is_archived
          priority
          expires_at
          created_at
          read_at
          archived_at
        }
      }
    `;

    const result = await executeQuery(GET_NOTIFICATIONS_QUERY, {
      where: whereConditions,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    }) as { real_estate_notification: Notification[] };

    return result.real_estate_notification;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    const MARK_AS_READ_MUTATION = `
      mutation MarkAsRead($id: uuid!) {
        update_real_estate_notification_by_pk(
          pk_columns: { id: $id }
          _set: { is_read: true, read_at: "now()" }
        ) {
          id
        }
      }
    `;

    await executeMutation(MARK_AS_READ_MUTATION, { id: notificationId });
  }

  // Mark all notifications as read
  static async markAllAsRead(userFirebaseUid: string): Promise<void> {
    const MARK_ALL_AS_READ_MUTATION = `
      mutation MarkAllAsRead($userFirebaseUid: String!) {
        update_real_estate_notification(
          where: { 
            recipient_firebase_uid: { _eq: $userFirebaseUid }
            is_read: { _eq: false }
          }
          _set: { is_read: true, read_at: "now()" }
        ) {
          affected_rows
        }
      }
    `;

    await executeMutation(MARK_ALL_AS_READ_MUTATION, { userFirebaseUid });
  }

  // Archive notification
  static async archiveNotification(notificationId: string): Promise<void> {
    const ARCHIVE_NOTIFICATION_MUTATION = `
      mutation ArchiveNotification($id: uuid!) {
        update_real_estate_notification_by_pk(
          pk_columns: { id: $id }
          _set: { is_archived: true, archived_at: "now()" }
        ) {
          id
        }
      }
    `;

    await executeMutation(ARCHIVE_NOTIFICATION_MUTATION, { id: notificationId });
  }

  // Get unread count
  static async getUnreadCount(userFirebaseUid: string): Promise<number> {
    const GET_UNREAD_COUNT_QUERY = `
      query GetUnreadCount($userFirebaseUid: String!) {
        real_estate_notification_aggregate(
          where: {
            recipient_firebase_uid: { _eq: $userFirebaseUid }
            is_read: { _eq: false }
            is_archived: { _eq: false }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `;

    const result = await executeQuery(GET_UNREAD_COUNT_QUERY, { userFirebaseUid }) as { real_estate_notification_aggregate: { aggregate: { count: number } } };
    return result.real_estate_notification_aggregate.aggregate.count;
  }

  // Helper methods
  private static async getNotificationType(typeKey: string): Promise<NotificationType | null> {
    const GET_TYPE_QUERY = `
      query GetNotificationType($typeKey: String!) {
        real_estate_notification_type(where: { type_key: { _eq: $typeKey }, is_active: { _eq: true } }) {
          id
          type_key
          name
          description
          category
          template
          is_active
          created_at
          updated_at
        }
      }
    `;

    const result = await executeQuery(GET_TYPE_QUERY, { typeKey }) as { real_estate_notification_type: NotificationType[] };
    return result.real_estate_notification_type[0] || null;
  }

  private static generateNotificationContent(type: NotificationType, data: Record<string, unknown>): { title: string; message: string } {
    let title = type.name;
    let message = type.template;

    // Replace placeholders in template
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      const value = String(data[key] || '');
      title = title.replace(new RegExp(placeholder, 'g'), value);
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return { title, message };
  }

  private static buildFilters(filters: NotificationFilters): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filters.isRead !== undefined) {
      where.is_read = { _eq: filters.isRead };
    }

    if (filters.category) {
      where.type = { category: { _eq: filters.category } };
    }

    if (filters.priority) {
      where.priority = { _eq: filters.priority };
    }

    return where;
  }
}
