'use client';

import ChatView from '@/components/dashboard/ChatView';

export default function ChatPage() {
  return (
    <div className="h-full">
      <ChatView userType="tenant" />
    </div>
  );
}
