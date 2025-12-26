"use client"

import { ReviewOpportunity } from '@/types/review'
import ReviewOpportunityCard from '@/components/reviews/ReviewOpportunityCard'
import { ReviewsEmptyState } from './reviews-empty-state'

interface UpcomingReviewsSectionProps {
  opportunities: ReviewOpportunity[]
  onCreateReview: (opportunity: ReviewOpportunity) => void
}

export function UpcomingReviewsSection({
  opportunities,
  onCreateReview
}: UpcomingReviewsSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Upcoming Reviews
        </h2>
        <p className="text-gray-600">
          You can submit reviews for these completed offers. Reviews help the community make better decisions.
        </p>
      </div>

      {opportunities.length === 0 ? (
        <ReviewsEmptyState
          title="No upcoming reviews"
          description="You don't have any offers that are ready for review yet."
        />
      ) : (
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <ReviewOpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onCreateReview={() => onCreateReview(opportunity)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
