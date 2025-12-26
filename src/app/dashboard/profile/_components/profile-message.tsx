"use client"

interface ProfileMessageProps {
  type: 'success' | 'error'
  message: string
  onDismiss: () => void
}

export function ProfileMessage({ type, message, onDismiss }: ProfileMessageProps) {
  return (
    <div className={`mb-6 border rounded-lg p-4 ${
      type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  )
}
