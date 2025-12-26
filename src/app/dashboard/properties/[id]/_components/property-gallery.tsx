"use client"

import Image from 'next/image'

interface PropertyGalleryProps {
  displayImage: string
  title: string
}

export function PropertyGallery({ displayImage, title }: PropertyGalleryProps) {
  if (!displayImage) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <Image
        src={displayImage}
        alt={title}
        width={800}
        height={256}
        className="w-full h-64 object-cover"
      />
    </div>
  )
}
