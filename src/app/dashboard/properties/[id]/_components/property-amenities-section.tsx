"use client"

interface PropertyAmenitiesSectionProps {
  amenities: string[]
}

export function PropertyAmenitiesSection({ amenities }: PropertyAmenitiesSectionProps) {
  if (!amenities || amenities.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {amenities.map((amenity, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 capitalize">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
