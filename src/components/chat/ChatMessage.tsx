'use client';

import React from 'react';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  avatar?: string;
  senderName: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusIcon = (status?: 'sent' | 'delivered' | 'read') => {
    if (!status || !isOwnMessage) return null;
    
    switch (status) {
      case 'sent':
        return (
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
        );
      case 'read':
        return (
          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
            {message.avatar ? (
              <Image
                src={message.avatar}
                alt={message.senderName}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-xs font-medium">
                {message.senderName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`ml-2 ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
          <div
            className={`px-3 py-2 rounded-lg shadow-sm ${
              isOwnMessage
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          <div className={`mt-1 flex items-center space-x-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
            {isOwnMessage && getStatusIcon(message.status)}
          </div>
        </div>
      </div>
    </div>
  );
}
