"use client"

interface SavedPropertiesHeaderProps {
  title?: string
  description?: string
}

export function SavedPropertiesHeader({
  title = "Saved Properties",
  description = "Your favorite properties"
}: SavedPropertiesHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  )
}
