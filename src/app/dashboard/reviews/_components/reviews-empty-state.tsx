"use client"

interface ReviewsEmptyStateProps {
  title: string
  description: string
}

export function ReviewsEmptyState({ title, description }: ReviewsEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  )
}
