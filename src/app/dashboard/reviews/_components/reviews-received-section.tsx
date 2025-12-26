"use client"

import { Review } from '@/types/review'
import ReviewCard from '@/components/reviews/ReviewCard'
import { ReviewsEmptyState } from './reviews-empty-state'

interface ReviewsReceivedSectionProps {
  reviews: Review[]
}

export function ReviewsReceivedSection({ reviews }: ReviewsReceivedSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Reviews You've Received
        </h2>
        <p className="text-gray-600">
          What others are saying about you and your properties.
        </p>
      </div>

      {reviews.length === 0 ? (
        <ReviewsEmptyState
          title="No reviews received"
          description="You haven't received any reviews yet."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.reviewUuid}
              review={review}
              showPropertyInfo={true}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
