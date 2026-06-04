import apiClient from './api-client';

export interface ChatRoom {
  id: string;
  room_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  last_read_at: string;
  is_active: boolean;
  room: {
    id: string;
    title: string | null;
    room_type: 'direct' | 'group' | 'support';
    created_at: string;
    updated_at: string;
    last_message_at: string;
    is_active: boolean;
  } | null;
  last_message: {
    room_id: string;
    content: string;
    sender_user_id: string;
    created_at: string;
  } | null;
  other_participant: {
    room_id: string;
    user_id: string;
    role: string;
    user_details: {
      nhost_user_id: string;
      display_name: string | null;
      photo_url: string | null;
      email: string | null;
    } | null;
  } | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender_user_id: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  message_type: string;
  metadata: Record<string, unknown> | null;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  role: 'landlord' | 'tenant' | 'support';
  nhostUserId: string;
}

// Normalises a flat Nhost chat room record to the ChatRoom interface.
// Nhost returns { id, room_uuid, participant_one_user_id, participant_two_user_id, property_uuid, updated_at }.
function normalizeNhostChatRoom(
  item: Record<string, unknown>,
  currentUserId: string,
): ChatRoom {
  const roomUuid = String(item.room_uuid ?? item.id ?? '');
  const otherUserId = String(
    item.participant_one_user_id === currentUserId
      ? item.participant_two_user_id
      : item.participant_one_user_id
  );
  const updatedAt = String(item.updated_at ?? '');
  return {
    id: String(item.id ?? ''),
    room_id: roomUuid,
    user_id: currentUserId,
    role: 'tenant',
    joined_at: updatedAt,
    last_read_at: updatedAt,
    is_active: true,
    room: {
      id: String(item.id ?? ''),
      title: null,
      room_type: 'direct',
      created_at: updatedAt,
      updated_at: updatedAt,
      last_message_at: updatedAt,
      is_active: true,
    },
    last_message: null,
    other_participant: {
      room_id: roomUuid,
      user_id: otherUserId,
      role: 'landlord',
      user_details: null,
    },
  };
}

// Chat API functions
export const chatAPI = {
  // Get user's chat rooms — JWT-scoped, flat Nhost items normalised to ChatRoom shape
  getUserChatRooms: async (userId: string): Promise<ChatRoom[]> => {
    try {
      const response = await apiClient.get('chat/get-chat-rooms');
      if (!response.data.success) throw new Error(response.data.error || 'Failed to fetch chat rooms');
      const rawItems = Array.isArray(response.data.data) ? response.data.data : [];
      return rawItems.map((item) => {
        const row = item as Record<string, unknown>;
        if (row.other_participant != null && row.room_id != null) {
          return item as ChatRoom;
        }
        return normalizeNhostChatRoom(row, userId);
      });
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  // Get messages — offset not supported by Nhost; limit only
  getRoomMessages: async (roomId: string, limit: number = 50, _offset: number = 0): Promise<ChatMessage[]> => {
    try {
      const response = await apiClient.get('chat/get-room-messages', { params: { roomId, limit } });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to fetch messages');
    } catch (error) {
      console.error('Error fetching room messages:', error);
      throw error;
    }
  },

  // Send a message — Nhost schema: { roomId, content, messageType? }; senderUserId is JWT-derived
  sendMessage: async (
    roomId: string, 
    _senderUserId: string, 
    content: string,
    messageType: 'text' | 'property_share' = 'text',
    _metadata: Record<string, unknown> | null = null
  ): Promise<ChatMessage> => {
    try {
      const response = await apiClient.post('chat/send-message', { roomId, content, messageType });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to send message');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get or create a direct chat room — Nhost: { otherUserId }; caller is the JWT principal
  getOrCreateRoom: async (
    _user1UserId: string,
    user2UserId: string,
    _user1Role: string = 'tenant',
    _user2Role: string = 'landlord'
  ): Promise<{ roomId: string; room: ChatRoom['room']; isNew: boolean }> => {
    try {
      const response = await apiClient.post('chat/get-or-create-room', { otherUserId: user2UserId });
      if (!response.data.success) throw new Error(response.data.error || 'Failed to get or create room');
      const roomData = response.data.data as Record<string, unknown>;
      return {
        roomId: String(roomData.roomId ?? roomData.room_uuid ?? roomData.id ?? ''),
        room: (roomData.room as ChatRoom['room']) ?? null,
        isNew: Boolean(roomData.isNew),
      };
    } catch (error) {
      console.error('Error getting or creating room:', error);
      throw error;
    }
  }
};

// Helper function to convert database chat room to UI contact format
export const convertChatRoomToContact = (chatRoom: ChatRoom): ChatContact => {
  // Use the other participant's information if available
  const otherParticipant = chatRoom.other_participant;
  const otherUserDetails = otherParticipant?.user_details;
  
  // Determine the display name and avatar
  let displayName = 'Direct Chat'; // fallback
  let avatar: string | undefined = undefined;
  
  if (otherUserDetails) {
    displayName = otherUserDetails.display_name || otherUserDetails.email || 'Unknown User';
    avatar = otherUserDetails.photo_url || undefined;
  } else if (otherParticipant) {
    // If we have the participant but no user details, use a generic name
    displayName = `User (${otherParticipant.role})`;
  }
  
  return {
    id: chatRoom.room_id,
    name: displayName,
    avatar: avatar,
    lastMessage: chatRoom.last_message?.content || 'No messages yet',
    lastMessageTime: chatRoom.last_message 
      ? new Date(chatRoom.last_message.created_at) 
      : (chatRoom.room ? new Date(chatRoom.room.created_at) : new Date()),
    unreadCount: 0, // We'll need to calculate this separately for now
    isOnline: false, // This would need to be implemented with presence tracking
    role: otherParticipant?.role as 'landlord' | 'tenant' | 'support' || chatRoom.role as 'landlord' | 'tenant' | 'support',
    nhostUserId: otherParticipant?.user_id || chatRoom.user_id
  };
};

// Helper function to convert database message to UI message format
export interface UIMessage {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  senderName: string;
  avatar?: string;
  status: ChatMessage['status'];
  messageType?: 'text' | 'property_share';
  metadata?: Record<string, unknown>;
}

export const convertMessageToUIMessage = (
  message: ChatMessage, 
  currentUserId: string, 
  otherUserName: string,
  otherUserAvatar?: string,
  currentUserAvatar?: string
): UIMessage => {
  return {
    id: message.id,
    content: message.content,
    sender: message.sender_user_id === currentUserId ? 'user' : 'other',
    timestamp: new Date(message.created_at),
    senderName: message.sender_user_id === currentUserId ? 'You' : otherUserName,
    avatar: message.sender_user_id === currentUserId ? currentUserAvatar : otherUserAvatar,
    status: message.status,
    messageType: message.message_type as 'text' | 'property_share',
    metadata: message.metadata || undefined,
  };
};
