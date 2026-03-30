'use client';

import { useCallback } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import Modal from '@/components/ui/modal';
import MobileBottomSheet from '@/components/ui/MobileBottomSheet';

interface UseResponsiveModalOptions {
  mobileHeight?: 'small' | 'medium' | 'large' | 'full';
  mobileTitle?: string;
  preventBodyScroll?: boolean;
  isOpen: boolean;
  onClose: () => void;
  modalClassName?: string;
  showCloseButton?: boolean;
}

interface UseResponsiveModalReturn {
  ModalComponent: React.ComponentType<{ children: React.ReactNode }>;
}

export const useResponsiveModal = (options: UseResponsiveModalOptions): UseResponsiveModalReturn => {
  const { isMobile } = useSidebar();
  
  const ModalComponent = useCallback(({ children }: { children: React.ReactNode }) => {
    if (isMobile) {
      return (
        <MobileBottomSheet
          isOpen={options.isOpen}
          onClose={options.onClose}
          title={options.mobileTitle}
          size={options.mobileHeight || 'medium'}
        >
          {children}
        </MobileBottomSheet>
      );
    }
    
    return (
      <Modal
        isOpen={options.isOpen}
        onClose={options.onClose}
        className={options.modalClassName ?? "max-w-4xl w-full mx-4"}
        showCloseButton={options.showCloseButton ?? true}
      >
        {children}
      </Modal>
    );
  }, [options.isOpen, options.onClose, isMobile, options.mobileTitle, options.mobileHeight, options.showCloseButton]);
  
  return { ModalComponent };
};
