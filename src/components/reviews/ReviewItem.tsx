'use client';

import Image from 'next/image';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { getSafeProfileImage } from '@/lib/utils';
import type { Review } from '@/types/review';

interface ReviewItemProps {
  review: Review;
  renderStars: (rating: number) => React.ReactNode;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ReviewItem({ review, renderStars }: ReviewItemProps) {
  return (
    <div className="dashboard-review-item">
      <div className="dashboard-review-content">
        <div className="dashboard-review-avatar">
          <Image
            src={getSafeProfileImage(review.reviewer?.photoUrl, '/images/Portrait_Placeholder.png')}
            alt={review.reviewer?.displayName || 'Reviewer'}
            width={40}
            height={40}
            className="dashboard-review-avatar-image"
          />
        </div>
        <div className="dashboard-review-details">
          <div className="dashboard-review-header">
            <div>
              <h4 className="dashboard-review-reviewer">{review.reviewer?.displayName || 'Unknown Reviewer'}</h4>
              <p className="dashboard-review-property">{review.property?.title || 'Property not specified'}</p>
            </div>
            <div className="dashboard-review-rating">
              {renderStars(review.rating)}
            </div>
          </div>
          <p className="dashboard-review-comment">{review.comment || 'No comment provided'}</p>
          <div className="dashboard-review-date">
            <CalendarIcon className="dashboard-review-date-icon" />
            {formatDate(review.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}


