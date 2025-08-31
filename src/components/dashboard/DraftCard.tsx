'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface DraftCardProps {
  draft: {
    id: string;
    property_uuid: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    last_saved_at: string;
    status: string;
    property_type: string;
    rental_space: string;
    address: string;
    num_bedroom: number;
    num_bathroom: number;
    rental_price: number;
    amenities: string[];
    display_image: string;
    completion_percentage: number;
  };
  onContinue: (draftId: string) => void;
  onDelete: (draftId: string) => void;
}

export default function DraftCard({ draft, onContinue, onDelete }: DraftCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await onDelete(draft.property_uuid);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {draft.title || 'Untitled Draft'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Last saved: {formatDate(draft.last_saved_at)}
          </p>
        </div>
        
        <div className="flex gap-2 ml-3">
          <button
            onClick={() => onContinue(draft.property_uuid)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            Continue
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      
      {/* Completion Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Completion</span>
          <span className="text-sm text-gray-500">
            {draft.completion_percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getCompletionColor(draft.completion_percentage)}`}
            style={{ width: `${draft.completion_percentage}%` }}
          />
        </div>
      </div>
      
      {/* Property Details */}
      {draft.description && (
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {draft.description}
        </p>
      )}
      
      {/* Property Info */}
      <div className="flex flex-wrap gap-2 mb-4">
        {draft.property_type && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {draft.property_type}
          </span>
        )}
        {draft.rental_space && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {draft.rental_space}
          </span>
        )}
        {draft.num_bedroom && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {draft.num_bedroom} bed
          </span>
        )}
        {draft.num_bathroom && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {draft.num_bathroom} bath
          </span>
        )}
        {draft.rental_price && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            ${draft.rental_price}/month
          </span>
        )}
      </div>
      
      {/* Address */}
      {draft.address && (
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Address:</span> {draft.address}
        </div>
      )}
      
      {/* Created Date */}
      <div className="text-xs text-gray-400">
        Created: {formatDate(draft.created_at)}
      </div>
    </div>
  );
}
