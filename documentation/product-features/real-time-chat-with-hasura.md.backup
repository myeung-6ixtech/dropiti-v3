# Real-time Chat (Hasura) – Implementation Guide

Last updated: 2025-01-01

## Overview
This document describes how to add real-time chat to Dropiti using Hasura GraphQL (subscriptions) and our existing chat UI under `src/components/chat/`. We will:
- Define chat tables (rooms, participants, messages)
- Expose GraphQL queries/mutations/subscriptions
- Wire up a lightweight client in the app to send/receive messages in real time
- Integrate the existing chat UI (`ChatInterface`, `ChatSidebar`, `ChatMessage`)

## Data Model (Hasura)
Create the following tables in Postgres (via Hasura):

1) `chat_room`
- `id` UUID PK (default gen_random_uuid())
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()
- `title` text (optional, for group chats)

2) `chat_room_participant`
- `id` UUID PK
- `room_id` UUID FK -> `chat_room.id`
- `user_firebase_uid` text (FK to existing user table)
- `role` text check ('tenant','landlord','support') (optional)
- `joined_at` timestamptz default now()
- Unique (room_id, user_firebase_uid)

3) `chat_message`
- `id` UUID PK
- `room_id` UUID FK -> `chat_room.id`
- `sender_firebase_uid` text (FK to user)
- `content` text not null
- `status` text check ('sent','delivered','read') default 'sent'
- `created_at` timestamptz default now()

Add useful indexes:
- `chat_message(room_id, created_at)` for message ordering
- `chat_room_participant(room_id)` for participant lookups

Configure Hasura permissions:
- Select/insert `chat_message` only if user is a participant of the room
- Select `chat_room` only for rooms the user participates in
- Subscriptions mirror select permissions

## GraphQL Operations

### Queries
- List user rooms
```graphql
query GetMyRooms($uid: String!) {
  chat_room_participant(where: {user_firebase_uid: {_eq: $uid}}) {
    room_id
    room: chat_room {
      id
      title
      updated_at
    }
  }
}
```

- List room messages (paged)
```graphql
query GetRoomMessages($roomId: uuid!, $limit: Int = 50, $offset: Int = 0) {
  chat_message(
    where: {room_id: {_eq: $roomId}}
    order_by: {created_at: asc}
    limit: $limit
    offset: $offset
  ) {
    id
    content
    sender_firebase_uid
    status
    created_at
  }
}
```

### Mutations
- Send message
```graphql
mutation SendMessage($roomId: uuid!, $senderUid: String!, $content: String!) {
  insert_chat_message_one(object: {
    room_id: $roomId,
    sender_firebase_uid: $senderUid,
    content: $content
  }) {
    id
    content
    sender_firebase_uid
    status
    created_at
  }
}
```

- Update delivery/read (optional)
```graphql
mutation UpdateMessageStatus($messageId: uuid!, $status: String!) {
  update_chat_message_by_pk(pk_columns: {id: $messageId}, _set: {status: $status}) {
    id
    status
  }
}
```

### Subscriptions (Real-time)
- Live messages in a room
```graphql
subscription OnRoomMessages($roomId: uuid!) {
  chat_message(where: {room_id: {_eq: $roomId}}, order_by: {created_at: asc}) {
    id
    content
    sender_firebase_uid
    status
    created_at
  }
}
```

## Client Integration
We will use a dedicated WebSocket GraphQL client for subscriptions alongside our existing `executeQuery/executeMutation` for HTTP.

### 1) Install a subscription-capable client
- Recommended: `graphql-ws` + lightweight wrapper, or Apollo Client with `WebSocketLink`.

Example with `graphql-ws`:
```ts
// src/app/api/graphql/wsClient.ts
import { createClient } from 'graphql-ws';

export const createWsClient = () =>
  createClient({
    url: process.env.NEXT_PUBLIC_HASURA_WS_ENDPOINT as string,
    connectionParams: {
      headers: { 'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET }
    }
  });
```

### 2) Subscription helper
```ts
// src/lib/chat-subscriptions.ts
import { createWsClient } from '@/app/api/graphql/wsClient';

const SUB_ROOM_MESSAGES = `
subscription OnRoomMessages($roomId: uuid!) {
  chat_message(where: {room_id: {_eq: $roomId}}, order_by: {created_at: asc}) {
    id
    content
    sender_firebase_uid
    status
    created_at
  }
}`;

export function subscribeToRoom(roomId: string, onMessage: (data: any) => void) {
  const client = createWsClient();
  const dispose = client.subscribe(
    { query: SUB_ROOM_MESSAGES, variables: { roomId } },
    {
      next: (result) => onMessage(result.data?.chat_message ?? []),
      error: (err) => console.error('Subscription error', err),
      complete: () => {}
    }
  );
  return () => dispose();
}
```

### 3) Hook into existing UI
- `ChatInterface.tsx` currently simulates messages. Replace the simulation with:
  - On contact/room select: call `subscribeToRoom(roomId, setMessagesFromPayload)`
  - On send: call HTTP mutation to `insert_chat_message_one`

Pseudo:
```ts
// inside ChatInterface
useEffect(() => {
  if (!selectedContact?.roomId) return;
  const unsubscribe = subscribeToRoom(selectedContact.roomId, (rows) => {
    setMessages(rows.map(r => ({
      id: r.id,
      content: r.content,
      sender: r.sender_firebase_uid === authUser.id ? 'user' : 'other',
      timestamp: new Date(r.created_at),
      senderName: r.sender_firebase_uid === authUser.id ? 'You' : selectedContact.name,
      status: r.status,
    })));
  });
  return unsubscribe;
}, [selectedContact?.roomId, authUser?.id]);

const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedContact?.roomId) return;
  await chatAPI.sendMessage(selectedContact.roomId, authUser.id, newMessage.trim());
  setNewMessage('');
};
```

## API Layer
Add a minimal `chatAPI`:
```ts
// src/lib/chat-api.ts
import { executeMutation } from '@/app/api/graphql/serverClient';

const SEND_MESSAGE = `
mutation SendMessage($roomId: uuid!, $senderUid: String!, $content: String!) {
  insert_chat_message_one(object: {room_id: $roomId, sender_firebase_uid: $senderUid, content: $content}) {
    id
  }
}`;

export const chatAPI = {
  sendMessage: async (roomId: string, senderUid: string, content: string) => {
    return executeMutation(SEND_MESSAGE, { roomId, senderUid, content });
  },
};
```

## Presence & Typing Indicators (Optional)
- Add `chat_presence` table with `room_id`, `user_firebase_uid`, `last_seen_at` and use a small heartbeat mutation on interval.
- Typing: lightweight `chat_typing` table with `room_id`, `user_firebase_uid`, `is_typing` boolean, and subscribe to it.

## Security
- Use Hasura row-level permissions tied to `x-hasura-user-id` (Firebase UID) via JWT or webhook auth.
- Ensure only participants can read/insert messages in a room.

## Performance
- Paginate messages (e.g., 50 per page) and lazy-load older history.
- Create composite indexes for `room_id, created_at`.

## Rollout Plan
1) Create DB tables & Hasura permissions in dev
2) Implement `chatAPI`, `wsClient`, and `subscribeToRoom`
3) Integrate with `ChatInterface` replacing simulation
4) QA: permissions, pagination, mobile UI
5) Deploy

## Environment Variables
- `NEXT_PUBLIC_HASURA_HTTP_ENDPOINT`
- `NEXT_PUBLIC_HASURA_WS_ENDPOINT`
- `NEXT_PUBLIC_HASURA_ADMIN_SECRET` (prefer user JWT in production)

## Future Enhancements
- File attachments (S3) and previews
- Message reactions, replies, and read receipts per user
- Group chat management UI
