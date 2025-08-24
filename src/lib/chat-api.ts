import apiClient from './api-client';

export interface ChatRoom {
  id: string;
  room_id: string;
  user_firebase_uid: string;
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
    sender_firebase_uid: string;
    created_at: string;
  } | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender_firebase_uid: string;
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
  firebaseUid: string;
}

// Chat API functions
export const chatAPI = {
  // Get user's chat rooms
  getUserChatRooms: async (userFirebaseUid: string): Promise<ChatRoom[]> => {
    try {
      const response = await apiClient.get('/chat/get-chat-rooms', {
        params: { userFirebaseUid }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch chat rooms');
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  // Get messages for a specific room
  getRoomMessages: async (roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> => {
    try {
      const response = await apiClient.get('/chat/get-room-messages', {
        params: { roomId, limit, offset }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching room messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (roomId: string, senderFirebaseUid: string, content: string): Promise<ChatMessage> => {
    try {
      const response = await apiClient.post('/chat/send-message', {
        roomId,
        senderFirebaseUid,
        content
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get or create a direct chat room between two users
  getOrCreateRoom: async (
    user1FirebaseUid: string, 
    user2FirebaseUid: string, 
    user1Role: string = 'tenant', 
    user2Role: string = 'landlord'
  ): Promise<{ roomId: string; room: ChatRoom['room']; isNew: boolean }> => {
    try {
      const response = await apiClient.post('/chat/get-or-create-room', {
        user1FirebaseUid,
        user2FirebaseUid,
        user1Role,
        user2Role
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get or create room');
      }
    } catch (error) {
      console.error('Error getting or creating room:', error);
      throw error;
    }
  }
};

// Helper function to convert database chat room to UI contact format
export const convertChatRoomToContact = (chatRoom: ChatRoom): ChatContact => {
  return {
    id: chatRoom.room_id,
    name: chatRoom.room?.title || 'Direct Chat',
    lastMessage: chatRoom.last_message?.content || 'No messages yet',
    lastMessageTime: chatRoom.last_message 
      ? new Date(chatRoom.last_message.created_at) 
      : (chatRoom.room ? new Date(chatRoom.room.created_at) : new Date()),
    unreadCount: 0, // We'll need to calculate this separately for now
    isOnline: false, // This would need to be implemented with presence tracking
    role: chatRoom.role as 'landlord' | 'tenant' | 'support',
    firebaseUid: chatRoom.user_firebase_uid // This is the current user's ID in this room
  };
};

// Helper function to convert database message to UI message format
export interface UIMessage {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  senderName: string;
  status: ChatMessage['status'];
}

export const convertMessageToUIMessage = (
  message: ChatMessage, 
  currentUserId: string, 
  otherUserName: string
): UIMessage => {
  return {
    id: message.id,
    content: message.content,
    sender: message.sender_firebase_uid === currentUserId ? 'user' : 'other',
    timestamp: new Date(message.created_at),
    senderName: message.sender_firebase_uid === currentUserId ? 'You' : otherUserName,
    status: message.status,
  };
};
