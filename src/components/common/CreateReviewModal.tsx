'use client';

import { useState } from 'react';
import { useResponsiveModal } from '@/hooks/useResponsiveModal';
import { REVIEW_TYPES } from '@/constants/review';
import { StarIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreateReviewModalProps } from '@/types/review';

export default function CreateReviewModal({
  isOpen,
  onClose,
  onSubmit,
  reviewType,
  otherPartyName,
  propertyTitle
}: CreateReviewModalProps) {
  const { ModalComponent } = useResponsiveModal({
    mobileTitle: 'Leave a Review',
    mobileHeight: 'medium',
    isOpen,
    onClose
  });

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalComponent>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Leave a Review</h2>
            <p className="text-sm text-gray-600 mt-1">
              Share your experience with {otherPartyName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Property Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Property:</span> {propertyTitle}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Review Type:</span> {
                reviewType === REVIEW_TYPES.TENANT_TO_LANDLORD 
                  ? 'Tenant to Landlord' 
                  : 'Landlord to Tenant'
              }
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl transition-colors hover:scale-110"
                  disabled={isSubmitting}
                >
                  <StarIcon 
                    className={`h-8 w-8 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="form-textarea w-full"
              placeholder="Share your experience with this person..."
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Be honest and constructive in your feedback
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </ModalComponent>
  );
}
