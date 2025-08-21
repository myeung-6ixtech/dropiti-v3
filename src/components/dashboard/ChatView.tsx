'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  BellIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import ChatInterface from '@/components/chat/ChatInterface';
import Button from '@/components/ui/button/Button';
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
  firebaseUid: string;
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Fetch user's chat rooms
  const fetchChatRooms = useCallback(async () => {
    if (!authUser?.id) return;

    try {
      setIsLoadingContacts(true);
      const chatRooms = await chatAPI.getUserChatRooms(authUser.id);
      
      // Convert chat rooms to contacts format
      const contactsList = chatRooms.map(room => 
        convertChatRoomToContact(room, authUser.id)
      );
      
      setContacts(contactsList);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      showToast('error', 'Failed to load chat rooms');
    } finally {
      setIsLoadingContacts(false);
    }
  }, [authUser?.id, showToast]);

  // Create sample chat data for testing
  const createSampleChatData = useCallback(async () => {
    if (!authUser?.id) return;

    try {
      // Create a sample room with another user (using a dummy ID for testing)
      const dummyUserId = 'sample-user-123';
      const response = await fetch('/api/v1/chat/create-sample-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user1FirebaseUid: authUser.id,
          user2FirebaseUid: dummyUserId
        }),
      });

      if (response.ok) {
        showToast('success', 'Sample chat room created! Refresh to see it.');
        // Refresh the chat rooms
        fetchChatRooms();
      } else {
        throw new Error('Failed to create sample room');
      }
    } catch (error) {
      console.error('Error creating sample chat data:', error);
      showToast('error', 'Failed to create sample chat data');
    }
  }, [authUser?.id, showToast, fetchChatRooms]);

  // Handle roomId from URL parameters
  useEffect(() => {
    const roomId = searchParams.get('roomId');
    if (roomId) {
      setSelectedRoomId(roomId);
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
            <h2 className="text-xl font-bold text-gray-900">Chat</h2>
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
              <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 text-sm"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <BellIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </Button>

            {/* Sample Data Button - Remove in production */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 text-sm text-orange-600 border-orange-200 hover:bg-orange-50"
              onClick={createSampleChatData}
            >
              <span className="text-xs">Create Sample Chat</span>
            </Button>
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
        />
      </div>

      {/* Real-time Status Bar */}
      {isConnected && (
        <div className="bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SignalIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Real-time messaging active</span>
            </div>
            
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
