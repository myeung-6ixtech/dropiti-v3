'use client';

import React, { useEffect } from 'react';
import { useMobileChat } from '@/context/MobileChatContext';
import ChatBottomSheet from './ChatBottomSheet';
import FullScreenChat from './FullScreenChat';

export default function MobileChatContainer() {
  const { isBottomSheetOpen, selectedRoomId } = useMobileChat();

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (isBottomSheetOpen || selectedRoomId) {
      document.body.classList.add('mobile-chat-open');
    } else {
      document.body.classList.remove('mobile-chat-open');
    }

    return () => {
      document.body.classList.remove('mobile-chat-open');
    };
  }, [isBottomSheetOpen, selectedRoomId]);

  return (
    <>
      <ChatBottomSheet />
      <FullScreenChat />
    </>
  );
}
