'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useMobileChat } from '@/context/MobileChatContext';
import { chatAPI, convertChatRoomToContact } from '@/lib/chat-api';
import { getSafeProfileImage } from '@/lib/utils';
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
  nhostUserId: string;
}

export default function FullScreenChat() {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const { selectedRoomId, closeChat } = useMobileChat();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all chat rooms and find the specific one
  const fetchChatRooms = useCallback(async () => {
    if (!authUser?.id || !selectedRoomId) return;

    try {
      setIsLoading(true);
      const chatRooms = await chatAPI.getUserChatRooms(authUser.id);
      
      // Convert chat rooms to contacts format
      const contactsList = chatRooms.map(room => convertChatRoomToContact(room));
      setContacts(contactsList);
      
      // Check if the requested room exists
      const roomExists = contactsList.some(contact => contact.id === selectedRoomId);
      
      if (!roomExists) {
        showToast('error', 'Chat room not found');
        closeChat();
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      showToast('error', 'Failed to load chat rooms');
      closeChat();
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id, selectedRoomId, showToast, closeChat]);

  useEffect(() => {
    if (selectedRoomId) {
      fetchChatRooms();
    }
  }, [selectedRoomId, fetchChatRooms]);

  if (!selectedRoomId) {
    return null;
  }

  const selectedContact = contacts.find(contact => contact.id === selectedRoomId);

  return (
    <div className="mobile-chat-fullscreen">
      {/* Header */}
      <div className="mobile-chat-fullscreen-header">
        <button
          onClick={closeChat}
          className="mobile-chat-back-button"
          aria-label="Back to chat list"
        >
          <FiArrowLeft className="h-6 w-6" />
        </button>
        
        <div className="mobile-chat-fullscreen-contact">
          {selectedContact?.avatar ? (
            <Image
              width={32}
              height={32}
              src={getSafeProfileImage(selectedContact.avatar, '/images/Portrait_Placeholder.png')}
              alt={selectedContact.name}
              className="mobile-chat-fullscreen-avatar"
            />
          ) : (
            <div className="mobile-chat-fullscreen-avatar-placeholder">
              <span className="text-xs font-medium text-white">
                {selectedContact?.name.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div className="mobile-chat-fullscreen-info">
            <h2 className="mobile-chat-fullscreen-name">
              {selectedContact?.name || 'Chat'}
            </h2>
            {selectedContact?.isOnline && (
              <p className="mobile-chat-fullscreen-status">Online</p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="mobile-chat-fullscreen-content">
        {isLoading ? (
          <div className="mobile-chat-loading">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 mt-2">Loading chat...</p>
          </div>
        ) : (
          <ChatInterface
            contacts={contacts}
            userType="tenant"
            isLoadingContacts={false}
            selectedRoomId={selectedRoomId}
            hideSidebar={true}
          />
        )}
      </div>
    </div>
  );
}
