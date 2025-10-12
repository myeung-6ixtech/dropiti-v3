'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MobileNotificationsContextType {
  isBottomSheetOpen: boolean;
  openBottomSheet: () => void;
  closeBottomSheet: () => void;
}

const MobileNotificationsContext = createContext<MobileNotificationsContextType | undefined>(undefined);

export const MobileNotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const openBottomSheet = useCallback(() => {
    setIsBottomSheetOpen(true);
  }, []);

  const closeBottomSheet = useCallback(() => {
    setIsBottomSheetOpen(false);
  }, []);

  return (
    <MobileNotificationsContext.Provider
      value={{
        isBottomSheetOpen,
        openBottomSheet,
        closeBottomSheet,
      }}
    >
      {children}
    </MobileNotificationsContext.Provider>
  );
};

export const useMobileNotifications = (): MobileNotificationsContextType => {
  const context = useContext(MobileNotificationsContext);
  if (context === undefined) {
    throw new Error('useMobileNotifications must be used within a MobileNotificationsProvider');
  }
  return context;
};
