'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

export default function Toast({ 
  message, 
  type = 'error', 
  duration = 5000, 
  onClose, 
  isVisible 
}: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-black text-white border-red-500';
      case 'success':
        return 'bg-green-600 text-white border-green-500';
      case 'warning':
        return 'bg-yellow-600 text-white border-yellow-500';
      case 'info':
        return 'bg-blue-600 text-white border-blue-500';
      default:
        return 'bg-black text-white border-gray-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`
          ${getToastStyles()}
          border-2 rounded-lg px-4 py-3 shadow-lg
          flex items-center space-x-3 min-w-[300px] max-w-[500px]
          transition-all duration-300 ease-in-out
          ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        `}
      >
        <span className="text-lg">{getIcon()}</span>
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsAnimating(false);
            setTimeout(onClose, 300);
          }}
          className="text-white hover:text-gray-300 transition-colors p-1"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
