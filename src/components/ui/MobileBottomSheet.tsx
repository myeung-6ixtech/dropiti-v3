'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export default function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium'
}: MobileBottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('mobile-chat-open');
    } else {
      document.body.classList.remove('mobile-chat-open');
    }

    return () => {
      document.body.classList.remove('mobile-chat-open');
    };
  }, [isOpen]);

  // Drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragOffset(0);
    
    // Prevent default to avoid scrolling issues
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartY;
    
    // Only allow downward dragging with cap
    if (deltaY > 0) {
      const cappedDeltaY = Math.min(deltaY, 200); // Cap at 200px
      setDragOffset(cappedDeltaY);
      
      // Apply transform to bottom sheet
      if (bottomSheetRef.current) {
        bottomSheetRef.current.style.transform = `translateY(${cappedDeltaY}px)`;
      }
    }
    
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Close if dragged down more than 50px
    if (dragOffset > 50) {
      onClose();
    } else {
      // Snap back to original position
      if (bottomSheetRef.current) {
        bottomSheetRef.current.style.transform = 'translateY(0)';
      }
    }
    
    // Reset drag state
    setDragOffset(0);
    setDragStartY(0);
  };

  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    small: 'mobile-modal-small',
    medium: 'mobile-modal-medium', 
    large: 'mobile-modal-large',
    full: 'mobile-modal-full'
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-chat-backdrop"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Bottom Sheet */}
      <div 
        ref={bottomSheetRef}
        className={`mobile-chat-bottom-sheet ${sizeClasses[size]}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Handle Bar */}
        <div className="mobile-chat-handle-container">
          <div className="mobile-chat-handle" />
        </div>

        {/* Header */}
        {title && (
          <div className="mobile-chat-header">
            <h2 className="mobile-chat-title">{title}</h2>
            <button
              onClick={onClose}
              className="mobile-chat-close-button"
              aria-label="Close"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="mobile-chat-list">
          {children}
        </div>
      </div>
    </>
  );
}
