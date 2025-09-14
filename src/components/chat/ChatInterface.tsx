'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import ChatMessage from './ChatMessage';
import ChatSidebar from './ChatSidebar';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { convertMessageToUIMessage } from '@/lib/chat-api';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  avatar?: string;
  senderName: string;
  status?: 'sent' | 'delivered' | 'read';
}

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

interface ChatInterfaceProps {
  contacts: ChatContact[];
  userType: 'landlord' | 'tenant' | 'support';
  isLoadingContacts?: boolean;
  selectedRoomId?: string | null;
}

export default function ChatInterface({ contacts, userType, isLoadingContacts = false, selectedRoomId }: ChatInterfaceProps) {
  const { user: authUser } = useAuth();
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(contacts[0] || null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  // Use real-time chat hook - use selectedRoomId if provided, otherwise use selectedContact
  const activeRoomId = selectedRoomId || selectedContact?.id;
  const { 
    messages: realTimeMessages, 
    sendMessage: sendRealTimeMessage, 
    isLoading: isLoadingMessages
  } = useRealTimeChat({ 
    roomId: activeRoomId,
    pollingInterval: 2000 // Reduced polling interval for better responsiveness
  });

  // Memoize UI messages conversion to prevent unnecessary re-renders
  const uiMessages: Message[] = useMemo(() => {
    return realTimeMessages.map(msg => 
      convertMessageToUIMessage(msg, authUser?.id || '', selectedContact?.name || 'Unknown')
    );
  }, [realTimeMessages, authUser?.id, selectedContact?.name]);

  // Optimized auto-scroll - only scroll when new messages are added
  useEffect(() => {
    if (uiMessages.length > lastMessageCountRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
      lastMessageCountRef.current = uiMessages.length;
    }
  }, [uiMessages.length]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  // Memoize sidebar contacts to prevent unnecessary re-renders
  const sidebarContacts = useMemo(() => {
    return contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
      lastMessage: contact.lastMessage,
      lastMessageTime: contact.lastMessageTime,
      unreadCount: contact.unreadCount,
      isOnline: contact.isOnline,
      role: contact.role,
      firebaseUid: contact.firebaseUid
    }));
  }, [contacts]);

  // Handle contact selection
  const handleContactSelect = useCallback((contact: ChatContact) => {
    const fullContact = contacts.find(c => c.id === contact.id);
    if (fullContact) {
      setSelectedContact(fullContact);
    }
  }, [contacts]);

  // Handle selectedRoomId prop - find corresponding contact or create a placeholder
  useEffect(() => {
    if (selectedRoomId) {
      // Find the contact that matches the selected room ID
      const matchingContact = contacts.find(contact => contact.id === selectedRoomId);
      if (matchingContact) {
        setSelectedContact(matchingContact);
      } else if (contacts.length === 0) {
        // If no contacts loaded yet but we have a roomId, create a placeholder contact
        setSelectedContact({
          id: selectedRoomId,
          name: 'Loading...',
          lastMessage: '',
          lastMessageTime: new Date(),
          unreadCount: 0,
          isOnline: false,
          role: 'landlord',
          firebaseUid: selectedRoomId
        });
      }
    }
  }, [selectedRoomId, contacts]);

  // Update selected contact when contacts change (but only if no selectedRoomId is provided)
  useEffect(() => {
    if (!selectedRoomId && contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact, selectedRoomId]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Send message using real-time chat
    const sentMessage = await sendRealTimeMessage(messageContent);
    
    if (sentMessage) {
      // Message was sent successfully
      console.log('Message sent:', sentMessage);
    } else {
      // Handle error - could show a toast notification
      console.error('Failed to send message');
    }
  }, [newMessage, selectedContact, sendRealTimeMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  if (isLoadingContacts) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500">Start a conversation by selecting a contact or property.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <ChatSidebar
          contacts={sidebarContacts}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
          userType={userType as 'tenant' | 'landlord'}
          isLoading={isLoadingContacts}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  {selectedContact.avatar ? (
                    <Image
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 capitalize mb-0">{selectedContact.name}</h3>
                  <p className="text-xs text-gray-500 capitalize mb-0">{selectedContact.role}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages && uiMessages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {uiMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwnMessage={message.sender === 'user'}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-end space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <PaperClipIcon className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={1}
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a contact from the sidebar to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
