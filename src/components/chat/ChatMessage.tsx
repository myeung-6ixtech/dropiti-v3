'use client';

import React from 'react';
import Image from 'next/image';
import PropertyShareCard from './PropertyShareCard';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  avatar?: string;
  senderName: string;
  status?: 'sent' | 'delivered' | 'read';
  messageType?: 'text' | 'property_share';
  metadata?: Record<string, unknown>;
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
          <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
        );
      case 'read':
        return (
          <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwnMessage && (
          <div className="flex-shrink-0 mr-3">
            {message.avatar ? (
              <Image
                src={message.avatar}
                alt={message.senderName}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {message.senderName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        {message.messageType === 'property_share' && message.metadata?.property_data ? (
          <div className="flex flex-col space-y-2">
            <PropertyShareCard
              property={message.metadata.property_data as Record<string, unknown>}
              shareContext={message.metadata.share_context as Record<string, unknown>}
              onViewProperty={() => {
                console.log('Property viewed from chat:', message.metadata?.property_uuid);
              }}
            />
            {/* Timestamp for property share */}
            <div className={`text-xs ${isOwnMessage ? 'text-right text-gray-500' : 'text-left text-gray-500'}`}>
              <span>{formatTime(message.timestamp)}</span>
              {isOwnMessage && <span className="ml-2">{getStatusIcon(message.status)}</span>}
            </div>
          </div>
        ) : (
          <div className={`px-4 py-2 rounded-lg ${
            isOwnMessage 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
            
            {/* Message Status and Time */}
            <div className={`flex items-center justify-between mt-1 text-xs ${
              isOwnMessage ? 'text-purple-100' : 'text-gray-500'
            }`}>
              <span>{formatTime(message.timestamp)}</span>
              {isOwnMessage && getStatusIcon(message.status)}
            </div>
          </div>
        )}

        {/* Avatar for own messages */}
        {isOwnMessage && (
          <div className="flex-shrink-0 ml-3">
            {message.avatar ? (
              <Image
                src={message.avatar}
                alt="You"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  You
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
