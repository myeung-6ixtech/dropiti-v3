'use client';

import React from 'react';
import Image from 'next/image';

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

interface ChatSidebarProps {
  contacts: ChatContact[];
  selectedContact: ChatContact | null;
  onContactSelect: (contact: ChatContact) => void;
  userType: 'tenant' | 'landlord';
  isLoading?: boolean;
}

export default function ChatSidebar({ contacts, selectedContact, onContactSelect, userType, isLoading = false }: ChatSidebarProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {userType === 'tenant' ? 'Landlords & Support' : 'Tenants & Support'}
        </h2>
        <p className="text-xs text-gray-500">
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
        </p>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-6 text-center text-gray-500">
            <p className="text-sm">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500">
            <p className="text-sm">No contacts available</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onContactSelect(contact)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center">
                  {/* Avatar */}
                  <div className="flex-shrink-0 relative">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      {contact.avatar ? (
                        <Image
                          src={contact.avatar}
                          alt={contact.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Online indicator */}
                    {contact.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-400 border border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      {contact.unreadCount > 0 && (
                        <span className="flex-shrink-0 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {contact.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatTime(contact.lastMessageTime)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
