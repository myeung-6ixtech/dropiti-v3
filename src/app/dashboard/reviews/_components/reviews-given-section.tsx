"use client"

import { Review } from '@/types/review'
import ReviewCard from '@/components/reviews/ReviewCard'
import { ReviewsEmptyState } from './reviews-empty-state'

interface ReviewsGivenSectionProps {
  reviews: Review[]
}

export function ReviewsGivenSection({ reviews }: ReviewsGivenSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Reviews You've Given
        </h2>
        <p className="text-gray-600">
          Reviews you have written for other users and properties.
        </p>
      </div>

      {reviews.length === 0 ? (
        <ReviewsEmptyState
          title="No reviews given"
          description="You haven't written any reviews yet."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.reviewUuid}
              review={review}
              showPropertyInfo={true}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
