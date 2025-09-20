'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { chatAPI, convertChatRoomToContact } from '@/lib/chat-api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ChatInterface from '@/components/chat/ChatInterface';

interface ChatContact {
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

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(true);

  const roomId = params.roomId as string;

  // Fetch all chat rooms and find the specific one
  const fetchChatRooms = useCallback(async () => {
    if (!authUser?.id) return;

    try {
      setIsLoading(true);
      const chatRooms = await chatAPI.getUserChatRooms(authUser.id);
      
      // Convert chat rooms to contacts format
      const contactsList = chatRooms.map(room => convertChatRoomToContact(room));
      setContacts(contactsList);
      
      // Check if the requested room exists
      const roomExists = contactsList.some(contact => contact.id === roomId);
      setRoomExists(roomExists);
      
      if (!roomExists) {
        showToast('error', 'Chat room not found');
        router.push('/dashboard/chat-mobile');
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      showToast('error', 'Failed to load chat rooms');
      router.push('/dashboard/chat-mobile');
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id, roomId, showToast, router]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!roomExists) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chat room not found</h3>
          <p className="text-gray-500">The requested chat room could not be found.</p>
        </div>
      </div>
    );
  }

  // Find the specific contact for the header
  const selectedContact = contacts.find(contact => contact.id === roomId);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Back to chat list"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedContact?.name || 'Chat'}
            </h2>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          contacts={contacts}
          userType="tenant"
          isLoadingContacts={false}
          selectedRoomId={roomId}
          hideSidebar={true}
        />
      </div>
    </div>
  );
}
