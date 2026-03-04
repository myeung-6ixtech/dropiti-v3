'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { FiX, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useMobileChat } from '@/context/MobileChatContext';
import { chatAPI, convertChatRoomToContact } from '@/lib/chat-api';
import { getSafeProfileImage } from '@/lib/utils';
import { ChatContactSkeleton } from '@/components/skeleton';

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

export default function ChatBottomSheet() {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const { isBottomSheetOpen, closeBottomSheet, openChat } = useMobileChat();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  
  // Drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // Fetch user's chat rooms
  const fetchChatRooms = useCallback(async () => {
    if (!authUser?.id) return;

    try {
      setIsLoadingContacts(true);
      const chatRooms = await chatAPI.getUserChatRooms(authUser.id);
      
      // Convert chat rooms to contacts format
      const contactsList = chatRooms.map(room => convertChatRoomToContact(room));
      
      setContacts(contactsList);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      showToast('error', 'Failed to load chat rooms');
    } finally {
      setIsLoadingContacts(false);
    }
  }, [authUser?.id, showToast]);

  // Load chat rooms when bottom sheet opens
  useEffect(() => {
    if (isBottomSheetOpen) {
      fetchChatRooms();
    }
  }, [isBottomSheetOpen, fetchChatRooms]);

  const handleChatClick = (contactId: string) => {
    openChat(contactId);
  };

  // Drag handlers
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
    
    // Only allow downward dragging with cap
    if (deltaY > 0) {
      const cappedDeltaY = Math.min(deltaY, 200); // Cap at 200px
      setDragOffset(cappedDeltaY);
      
      // Apply transform to bottom sheet
      if (bottomSheetRef.current) {
        bottomSheetRef.current.style.transform = `translateY(${cappedDeltaY}px)`;
      }
    }
    
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Reduced threshold for easier closing on iPhone 16
    if (dragOffset > 50) { // Reduced from 100px to 50px
      closeBottomSheet();
    } else {
      // Snap back to original position
      if (bottomSheetRef.current) {
        bottomSheetRef.current.style.transform = 'translateY(0)';
      }
    }
    
    // Reset drag state
    setDragOffset(0);
    setDragStartY(0);
  };

  // Reset transform when sheet opens/closes
  useEffect(() => {
    if (bottomSheetRef.current) {
      if (!isBottomSheetOpen) {
        bottomSheetRef.current.style.transform = 'translateY(0)';
      }
    }
  }, [isBottomSheetOpen]);

  if (!isBottomSheetOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-chat-backdrop"
        onClick={closeBottomSheet}
        aria-label="Close chat"
      />

      {/* Bottom Sheet */}
      <div 
        ref={bottomSheetRef}
        className="mobile-chat-bottom-sheet"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Handle Bar */}
        <div className="mobile-chat-handle-container">
          <div className="mobile-chat-handle" />
        </div>

        {/* Header */}
        <div className="mobile-chat-header">
          <h2 className="mobile-chat-title">Messages</h2>
          <button
            onClick={closeBottomSheet}
            className="mobile-chat-close-button"
            aria-label="Close"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Chat List */}
        <div className="mobile-chat-list">
          {isLoadingContacts ? (
            <ChatContactSkeleton count={5} className="p-4" />
          ) : contacts.length === 0 ? (
            <div className="mobile-chat-empty">
              <div className="mobile-chat-empty-icon">
                <FiMessageCircle className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="mobile-chat-empty-title">No conversations yet</h3>
              <p className="mobile-chat-empty-description">
                Start a conversation to see it here.
              </p>
            </div>
          ) : (
            <div className="mobile-chat-contacts">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleChatClick(contact.id)}
                  className="mobile-chat-contact-item"
                >
                  <div className="mobile-chat-contact-avatar">
                    {contact.avatar ? (
                      <Image
                        width={48}
                        height={48}
                        src={getSafeProfileImage(contact.avatar, '/images/Portrait_Placeholder.png')}
                        alt={contact.name}
                        className="mobile-chat-avatar-image"
                      />
                    ) : (
                      <div className="mobile-chat-avatar-placeholder">
                        <span className="mobile-chat-avatar-initial">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {contact.isOnline && (
                      <div className="mobile-chat-online-indicator" />
                    )}
                  </div>
                  
                  <div className="mobile-chat-contact-info">
                    <div className="mobile-chat-contact-header">
                      <p className="mobile-chat-contact-name">
                        {contact.name}
                      </p>
                      <p className="mobile-chat-contact-time">
                        {contact.lastMessageTime.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="mobile-chat-contact-message">
                      <p className="mobile-chat-last-message">
                        {contact.lastMessage}
                      </p>
                      {contact.unreadCount > 0 && (
                        <span className="mobile-chat-unread-badge">
                          {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
