"use client"

import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/outline'
import ReviewItem from '@/components/reviews/ReviewItem'
import { Review } from '@/types/review'

interface DashboardReviewsSectionProps {
  reviews: Review[]
  renderStars: (rating: number) => React.ReactNode
  viewAllText: string
  yourReviewsText: string
  noReviewsYetText: string
  reviewsWillAppearText: string
}

export function DashboardReviewsSection({
  reviews,
  renderStars,
  viewAllText,
  yourReviewsText,
  noReviewsYetText,
  reviewsWillAppearText
}: DashboardReviewsSectionProps) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">{yourReviewsText}</h2>
        <Link
          href="/dashboard/reviews"
          className="dashboard-card-link"
        >
          {viewAllText}
        </Link>
      </div>
      
      <div className="dashboard-card-content">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem key={review.id} review={review} renderStars={renderStars} />
          ))
        ) : (
          <div className="dashboard-review-empty">
            <div className="text-gray-500">
              <StarIcon className="dashboard-review-empty-icon" />
              <p className="dashboard-review-empty-text">{noReviewsYetText}</p>
              <p className="dashboard-review-empty-subtext">{reviewsWillAppearText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
