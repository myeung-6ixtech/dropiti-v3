'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PaperAirplaneIcon, PaperClipIcon, PhoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import ChatMessage from './ChatMessage';
import ChatSidebar from './ChatSidebar';

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
}

interface ChatInterfaceProps {
  contacts: ChatContact[];
  initialMessages?: Message[];
  userType: 'tenant' | 'landlord';
}

export default function ChatInterface({ contacts, initialMessages = [], userType }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(contacts[0] || null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
      senderName: 'You',
      status: 'sent',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate message delivery and read status
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'read' as const }
            : msg
        )
      );
    }, 2000);

    // Simulate typing indicator
    setIsTyping(true);

    // Simulate reply after 2-4 seconds
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        content: generateReply(),
        sender: 'other',
        timestamp: new Date(),
        senderName: selectedContact.name,
        avatar: selectedContact.avatar,
        status: 'read',
      };
      setMessages(prev => [...prev, reply]);
    }, 2000 + Math.random() * 2000);
  };

  const generateReply = (): string => {
    const replies = [
      "Thanks for your message! I'll get back to you soon.",
      "That's a great question. Let me check on that for you.",
      "I understand your concern. Can you provide more details?",
      "I'll look into this right away and update you.",
      "Thanks for reaching out. I appreciate your patience.",
      "That sounds good! I'll process this request now.",
      "I'm here to help. What else can I assist you with?",
      "Got it! I'll handle this for you right away.",
      "Perfect! I've noted that down for you.",
      "I can help you with that. Let me gather the information.",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
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
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={setSelectedContact}
          userType={userType}
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
                        <span className="text-white text-sm font-medium">
                          {selectedContact.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {selectedContact.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-400 border border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{selectedContact.name}</h3>
                    <p className="text-xs text-gray-500">
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
                <div className="flex items-center space-x-1">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                    <PhoneIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                    <VideoCameraIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p className="text-sm">No messages yet. Start a conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwnMessage={message.sender === 'user'}
                    />
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
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
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 px-4 py-3 bg-white">
              <div className="flex items-end space-x-3">
                <button className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
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
                  className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
