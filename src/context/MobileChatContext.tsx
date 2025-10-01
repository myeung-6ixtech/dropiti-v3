'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MobileChatContextType {
  isBottomSheetOpen: boolean;
  selectedRoomId: string | null;
  openBottomSheet: () => void;
  closeBottomSheet: () => void;
  openChat: (roomId: string) => void;
  closeChat: () => void;
}

const MobileChatContext = createContext<MobileChatContextType | undefined>(undefined);

export const MobileChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const openBottomSheet = useCallback(() => {
    setIsBottomSheetOpen(true);
  }, []);

  const closeBottomSheet = useCallback(() => {
    setIsBottomSheetOpen(false);
    setSelectedRoomId(null);
  }, []);

  const openChat = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
  }, []);

  const closeChat = useCallback(() => {
    setSelectedRoomId(null);
  }, []);

  return (
    <MobileChatContext.Provider
      value={{
        isBottomSheetOpen,
        selectedRoomId,
        openBottomSheet,
        closeBottomSheet,
        openChat,
        closeChat,
      }}
    >
      {children}
    </MobileChatContext.Provider>
  );
};

export const useMobileChat = (): MobileChatContextType => {
  const context = useContext(MobileChatContext);
  if (context === undefined) {
    throw new Error('useMobileChat must be used within a MobileChatProvider');
  }
  return context;
};
