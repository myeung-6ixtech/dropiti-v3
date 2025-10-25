'use client';

import { FiHome, FiX } from 'react-icons/fi';

interface ShareActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty: () => void;
}

export default function ShareActionMenu({ 
  isOpen, 
  onClose, 
  onSelectProperty 
}: ShareActionMenuProps) {
  if (!isOpen) return null;

  const handlePropertyClick = () => {
    onSelectProperty();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-up Menu */}
      <div className="absolute bottom-full left-0 right-0 mb-2 z-50 animate-slide-up">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mx-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Share Content</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Action Options */}
          <div className="flex items-center space-x-4">
            {/* Property Option */}
            <button
              onClick={handlePropertyClick}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FiHome className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Property</span>
            </button>

            {/* Placeholder for future options */}
            <div className="flex flex-col items-center space-y-2 p-3 opacity-50 cursor-not-allowed">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-xs">More</span>
              </div>
              <span className="text-xs font-medium text-gray-400">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

