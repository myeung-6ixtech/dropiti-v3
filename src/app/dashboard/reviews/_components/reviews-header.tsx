"use client"

interface ReviewsHeaderProps {
  title?: string
  description?: string
}

export function ReviewsHeader({ 
  title = "Reviews",
  description = "Manage your reviews and see what others are saying about you"
}: ReviewsHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  )
}
