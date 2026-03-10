'use client';
import Image from 'next/image';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { chatAPI, convertChatRoomToContact } from '@/lib/chat-api';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import ChatInterface from './ChatInterface';
import { useSidebar } from '@/context/SidebarContext';

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

interface MobileChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileChatModal({ isOpen, onClose }: MobileChatModalProps) {
  console.log("MobileChatModal rendered with isOpen:", isOpen);
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const { isMobile } = useSidebar();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');

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

  // Load chat rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchChatRooms();
      // Reset view state when opening
      setCurrentView('list');
      setSelectedContact(null);
    }
  }, [isOpen, fetchChatRooms]);

  // Handle contact selection
  const handleContactSelect = (contact: ChatContact) => {
    setSelectedContact(contact);
    setCurrentView('chat');
  };

  // Handle back to list
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedContact(null);
  };

  // Handle modal close
  const handleClose = () => {
    setCurrentView('list');
    setSelectedContact(null);
    onClose();
  };

  // Don't render if not mobile or not open
  if (!isOpen || !isMobile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {currentView === 'chat' && (
              <button
                onClick={handleBackToList}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Back to chat list"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {currentView === 'list' ? 'Messages' : selectedContact?.name || 'Chat'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden h-full">
        {currentView === 'list' ? (
          <div className="h-full flex flex-col">
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingContacts ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : contacts.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-gray-500">Start a conversation to see it here.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {contact.avatar ? (
                            <Image
                              width={48}
                              height={48}
                              src={contact.avatar}
                              alt={contact.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Contact Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {contact.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {contact.lastMessageTime.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {contact.lastMessage}
                          </p>
                        </div>
                        
                        {/* Unread indicator */}
                        {contact.unreadCount > 0 && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                              {contact.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="h-full">
            <ChatInterface
              contacts={[selectedContact].filter(Boolean) as ChatContact[]}
              userType="tenant"
              isLoadingContacts={false}
              selectedRoomId={selectedContact?.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
