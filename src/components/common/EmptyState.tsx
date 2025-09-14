import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export default function EmptyState({
  icon = '📋',
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-sm">
        {/* Icon */}
        <div className="text-gray-400 mb-6">
          <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">{icon}</span>
          </div>
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
        
        {/* Action Button */}
        {(actionText && actionHref) && (
          <Link
            href={actionHref}
            className="btn-primary inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {actionText}
          </Link>
        )}
        
        {(actionText && onActionClick) && (
          <button
            onClick={onActionClick}
            className="btn-primary inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}
