'use client';

import { useState, useEffect, useRef } from 'react';
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
  role?: 'landlord' | 'tenant' | 'support';
  firebaseUid: string;
}

interface ChatSidebarContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  role?: 'landlord' | 'tenant' | 'support';
}

interface ChatInterfaceProps {
  contacts: ChatContact[];
  userType: 'tenant' | 'landlord';
  isLoadingContacts?: boolean;
  selectedRoomId?: string | null;
}

export default function ChatInterface({ contacts, userType, isLoadingContacts = false, selectedRoomId }: ChatInterfaceProps) {
  const { user: authUser } = useAuth();
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(contacts[0] || null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use real-time chat hook - use selectedRoomId if provided, otherwise use selectedContact
  const activeRoomId = selectedRoomId || selectedContact?.id;
  const { 
    messages: realTimeMessages, 
    sendMessage: sendRealTimeMessage, 
    isLoading: isLoadingMessages,
    error: messageError 
  } = useRealTimeChat({ 
    roomId: activeRoomId,
    pollingInterval: 3000 // Poll every 3 seconds
  });

  // Convert real-time messages to UI format
  const uiMessages: Message[] = realTimeMessages.map(msg => 
    convertMessageToUIMessage(msg, authUser?.id || '', selectedContact?.name || 'Unknown')
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [uiMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  // Convert contacts to sidebar format (without firebaseUid)
  const sidebarContacts: ChatSidebarContact[] = contacts.map(contact => ({
    id: contact.id,
    name: contact.name,
    avatar: contact.avatar,
    lastMessage: contact.lastMessage,
    lastMessageTime: contact.lastMessageTime,
    unreadCount: contact.unreadCount,
    isOnline: contact.isOnline,
    role: contact.role
  }));

  // Handle contact selection
  const handleContactSelect = (contact: ChatSidebarContact) => {
    const fullContact = contacts.find(c => c.id === contact.id);
    if (fullContact) {
      setSelectedContact(fullContact);
    }
  };

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

  const handleSendMessage = async () => {
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Chat Sidebar */}
      <div className="w-72 border-r border-gray-200 flex-shrink-0">
        <ChatSidebar
          contacts={sidebarContacts}
          selectedContact={selectedContact ? {
            id: selectedContact.id,
            name: selectedContact.name,
            avatar: selectedContact.avatar,
            lastMessage: selectedContact.lastMessage,
            lastMessageTime: selectedContact.lastMessageTime,
            unreadCount: selectedContact.unreadCount,
            isOnline: selectedContact.isOnline,
            role: selectedContact.role
          } : null}
          onContactSelect={handleContactSelect}
          userType={userType}
          isLoading={isLoadingContacts}
        />
      </div>

      {/* Chat Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 px-4 py-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 relative">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      {selectedContact.avatar ? (
                        <Image
                          src={selectedContact.avatar}
                          alt={selectedContact.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white mb-0 text-sm font-medium">
                          {selectedContact.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {selectedContact.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-400 border border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm mb-0 font-medium text-gray-900">{selectedContact.name}</h3>
                    <p className="text-xs mb-0 text-gray-500">
                      {selectedContact.isOnline ? (
                        <span className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-green-400 rounded-full mr-1.5"></span>
                          Online
                        </span>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Header Actions */}
                {/* <div className="flex items-center space-x-1">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                    <PhoneIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                    <VideoCameraIcon className="h-4 w-4" />
                  </button>
                </div> */}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 min-h-0">
              {isLoadingMessages ? (
                <div className="text-center text-gray-500 mt-8">
                  <p className="text-sm">Loading messages...</p>
                </div>
              ) : uiMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p className="text-sm">No messages yet. Start a conversation!</p>
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
                  
                  {/* Typing Indicator */}
                  {/* isTyping && (
                    <div className="flex justify-start">
                      <div className="flex max-w-xs lg:max-w-md">
                        <div className="flex-shrink-0">
                          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-medium">
                              {selectedContact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2">
                          <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) */}
                  <div ref={messagesEndRef} />
                </>
              )}

              {/* Error Display */}
              {messageError && (
                <div className="text-center text-red-500 mt-4">
                  <p className="text-sm">Error: {messageError}</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 px-4 py-3 bg-white">
              <div className="flex items-end space-x-3">
                <button className="flex-shrink-0 p-1.5 mb-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <PaperClipIcon className="h-4 w-4" />
                </button>
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="form-textarea resize-none max-h-20 text-sm"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="flex-shrink-0 p-2 btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium">Select a contact to start chatting</p>
              <p className="text-xs mt-1 text-gray-400">Choose someone from the sidebar to begin your conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
