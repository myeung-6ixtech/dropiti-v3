"use client"

interface PropertyDescriptionSectionProps {
  description: string
}

export function PropertyDescriptionSection({ description }: PropertyDescriptionSectionProps) {
  if (!description) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
      <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
    </div>
  )
}
