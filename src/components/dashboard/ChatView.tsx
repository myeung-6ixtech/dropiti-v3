'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  BellIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import ChatInterface from '@/components/chat/ChatInterface';
import Button from '@/components/ui/button/Button';

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
}

interface ChatViewProps {
  userType?: 'tenant' | 'landlord';
}

export default function ChatView({ userType = 'tenant' }: ChatViewProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data for contacts
  const mockContacts: ChatContact[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'landlord',
      lastMessage: 'The inspection has been scheduled for tomorrow at 2 PM.',
      lastMessageTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      unreadCount: 2,
      isOnline: true,
      avatar: '/api/placeholder/40/40'
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'landlord',
      lastMessage: 'Your rent payment has been received. Thank you!',
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      name: 'Support Team',
      role: 'support',
      lastMessage: 'We\'re here to help with any questions you might have.',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      unreadCount: 1,
      isOnline: true
    },
    {
      id: '4',
      name: 'Emma Davis',
      role: 'tenant',
      lastMessage: 'Can you share the WiFi password?',
      lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      unreadCount: 0,
      isOnline: false
    }
  ];

  // Mock initial messages
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hi there! How can I help you today?',
      sender: 'other',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      senderName: 'Sarah Johnson',
      status: 'read'
    },
    {
      id: '2',
      content: 'I have a question about the property maintenance schedule.',
      sender: 'user',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      senderName: 'You',
      status: 'read'
    },
    {
      id: '3',
      content: 'Of course! What would you like to know?',
      sender: 'other',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      senderName: 'Sarah Johnson',
      status: 'read'
    }
  ];

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

  const handleSendMessage = (message: string) => {
    // Here you would implement actual real-time messaging
    console.log('Sending message:', message);
    
    // Simulate typing indicator
    setTypingIndicator(true);
  };

  const filteredContacts = mockContacts.filter(contact =>
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
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0">
        <ChatInterface
          contacts={filteredContacts}
          initialMessages={mockMessages}
          userType={userType}
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
