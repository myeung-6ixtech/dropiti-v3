"use client"

interface OffersHeaderProps {
  title: string
  description: string
}

export function OffersHeader({ title, description }: OffersHeaderProps) {
  return (
    <div className="mb-8">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
    </div>
  )
}
