"use client"

interface ActivityHeaderProps {
  title?: string
  description?: string
}

export function ActivityHeader({
  title = "Recent Activity",
  description = "Your recent actions and updates"
}: ActivityHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  )
}
