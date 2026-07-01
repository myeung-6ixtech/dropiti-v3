'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import ChatInterface from '@/components/chat/ChatInterface';
import { useAuth } from '@/context/AuthContext';
import { chatAPI, convertChatRoomToContact } from '@/lib/chat-api';
import { useToast } from '@/context/ToastContext';

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

interface ChatViewProps {
  userType?: 'tenant' | 'landlord';
}

export default function ChatView({ userType = 'tenant' }: ChatViewProps) {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [isConnected, setIsConnected] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomDisplayName, setSelectedRoomDisplayName] = useState<string | null>(null);

  // Fetch user's chat rooms
  const fetchChatRooms = useCallback(async () => {
    if (!authUser?.id) {
      setIsLoadingContacts(false);
      return;
    }

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



  // Handle roomId from URL parameters
  useEffect(() => {
    const roomId = searchParams.get('roomId');
    const name = searchParams.get('name');
    if (roomId) {
      setSelectedRoomId(roomId);
    }
    if (name) {
      setSelectedRoomDisplayName(name);
    }
  }, [searchParams]);

  // Fetch user's chat rooms
  useEffect(() => {
    fetchChatRooms();
  }, [authUser?.id, showToast, fetchChatRooms]);

  // Simulate real-time connection
  useEffect(() => {
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(connectTimeout);
  }, []);

  // Simulate typing indicator
  useEffect(() => {
    if (typingIndicator) {
      const typingTimeout = setTimeout(() => {
        setTypingIndicator(false);
      }, 3000);

      return () => clearTimeout(typingTimeout);
    }
  }, [typingIndicator]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900 mb-0">Chat</h2>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input-sm pl-8"
              />
              <MagnifyingGlassIcon className="absolute right-2.5 top-3 h-4 w-4 text-gray-400" />
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0">
        <ChatInterface
          contacts={filteredContacts}
          userType={userType}
          isLoadingContacts={isLoadingContacts}
          selectedRoomId={selectedRoomId}
          selectedRoomDisplayName={selectedRoomDisplayName}
        />
      </div>

      {/* Real-time Status Bar */}
      {isConnected && (
        <div className="bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">            
            {/* Typing Indicator */}
            {typingIndicator && (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">Typing...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
