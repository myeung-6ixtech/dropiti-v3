import type { Notification } from '@/types/notification';

/** Raw Hasura row shape from Nhost Functions notification endpoints. */
export type RawNotificationRow = Record<string, unknown>;

export function isRawNotificationRow(value: unknown): value is RawNotificationRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    'is_read' in row ||
    'is_archived' in row ||
    'type_id' in row ||
    ('recipient_user_id' in row && 'message' in row)
  );
}

export function isNotificationItemsPayload(items: unknown[]): boolean {
  return items.length > 0 && items.some(isRawNotificationRow);
}

function readString(row: RawNotificationRow, camel: string, snake: string): string {
  const value = row[camel] ?? row[snake];
  return value == null ? '' : String(value);
}

/** Map Hasura notification row → frontend `Notification` shape. */
export function normalizeNotification(row: RawNotificationRow): Notification {
  return {
    id: readString(row, 'id', 'id'),
    typeId: readString(row, 'typeId', 'type_id'),
    recipientUserId: readString(row, 'recipientUserId', 'recipient_user_id'),
    senderUserId: readString(row, 'senderUserId', 'sender_user_id') || undefined,
    title: readString(row, 'title', 'title'),
    message: readString(row, 'message', 'message'),
    data: (row.data as Record<string, unknown>) ?? {},
    isRead: Boolean(row.isRead ?? row.is_read ?? false),
    isArchived: Boolean(row.isArchived ?? row.is_archived ?? false),
    priority: (readString(row, 'priority', 'priority') || 'normal') as Notification['priority'],
    expiresAt: readString(row, 'expiresAt', 'expires_at') || undefined,
    createdAt: readString(row, 'createdAt', 'created_at'),
    readAt: readString(row, 'readAt', 'read_at') || undefined,
    archivedAt: readString(row, 'archivedAt', 'archived_at') || undefined,
    type: row.type as Notification['type'],
    sender: row.sender as Notification['sender'],
  };
}

export function normalizeNotifications(items: unknown[]): Notification[] {
  return items.map((item) => {
    if (isRawNotificationRow(item)) {
      return normalizeNotification(item);
    }
    return item as Notification;
  });
}
