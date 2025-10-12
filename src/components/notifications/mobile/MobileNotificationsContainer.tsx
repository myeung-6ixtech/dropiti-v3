'use client';

import React, { useEffect } from 'react';
import { useMobileNotifications } from '@/context/MobileNotificationsContext';
import NotificationsBottomSheet from './NotificationsBottomSheet';

export default function MobileNotificationsContainer() {
  const { isBottomSheetOpen } = useMobileNotifications();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isBottomSheetOpen) {
      document.body.classList.add('mobile-chat-open');
    } else {
      document.body.classList.remove('mobile-chat-open');
    }

    return () => {
      document.body.classList.remove('mobile-chat-open');
    };
  }, [isBottomSheetOpen]);

  return (
    <>
      <NotificationsBottomSheet />
    </>
  );
}
