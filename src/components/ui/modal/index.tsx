'use client';

import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center modal">
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`w-full h-full ${className ?? ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto overflow-x-hidden py-10 px-4 sm:px-6 modal">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-0 bg-black/30"
        onClick={onClose}
        aria-hidden
      />

      {/*
        Two-layer card:
          outer – carries the drop-shadow so it's never clipped
          inner – carries bg + overflow-hidden + rounded corners
        This keeps the shadow visible outside the card at all times.
      */}
      <div
        className={`relative z-10 w-full rounded-3xl shadow-[0_8px_40px_-4px_rgba(0,0,0,0.18),0_2px_12px_-2px_rgba(0,0,0,0.10)] ${className ?? ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className="relative flex max-h-[min(85dvh,900px)] flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-900"
        >
          <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            {children}
          </div>
        </div>

        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;
