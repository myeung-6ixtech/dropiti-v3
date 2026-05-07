'use client';

import { FiHome, FiEye, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

interface PropertyShareCardProps {
  property: Record<string, unknown>;
  shareContext?: Record<string, unknown>;
  onViewProperty?: () => void;
}

export default function PropertyShareCard({ 
  property, 
  shareContext, 
  onViewProperty
}: PropertyShareCardProps) {

  const getContextBadge = () => {
    if (!shareContext?.reason) return null;
    
    const badges = {
      budget_match: { text: 'Budget Match', color: 'bg-green-100 text-green-800' },
      location_match: { text: 'Location Match', color: 'bg-blue-100 text-blue-800' },
      availability_match: { text: 'Available Now', color: 'bg-orange-100 text-orange-800' },
      general: { text: 'Recommended', color: 'bg-purple-100 text-purple-800' }
    };
    
    const badge = badges[shareContext.reason as keyof typeof badges];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };


  const propertyId = (property.property_uuid as string | undefined) || (property.id as string | undefined);
  // Try multiple image sources in order of preference
  const propertyImage = property.image_url || 
                       property.imageUrl || 
                       property.displayImage || 
                       (Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : null) ||
                       (Array.isArray(property.uploadedImages) && property.uploadedImages.length > 0 ? property.uploadedImages[0] : null);

  // Debug logging for image resolution
  console.log('[PropertyShareCard] Image resolution:', {
    propertyId,
    title: property.title,
    sources: {
      image_url: property.image_url,
      imageUrl: property.imageUrl,
      displayImage: property.displayImage,
      images: property.images,
      uploadedImages: property.uploadedImages
    },
    resolvedImage: propertyImage,
    hasImage: !!propertyImage
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-sm">
      {/* Property Image */}
      <div className="relative h-48 bg-gray-100">
        {propertyImage ? (
          <Image
            src={propertyImage}
            alt={String(property.title || 'Property')}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FiHome className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Context Badge */}
        {getContextBadge() && (
          <div className="absolute top-2 left-2">
            {getContextBadge()}
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        <Link 
          href={`/property/${propertyId}`}
          target="_blank"
          className="block hover:text-purple-600 transition-colors"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-purple-600">
            {String(property.title || 'Property')}
          </h3>
        </Link>
        
        <div className="flex items-center text-gray-600 mb-2">
          <FiDollarSign className="h-4 w-4 mr-1" />
          <span className="font-medium text-sm">
            {Number(property.price || 0)?.toLocaleString()} {String(property.currency || 'HKD')}/month
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{String(property.location || 'Location not specified')}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span className="mr-4">{Number(property.bedrooms || 0)} bed</span>
          <span>{Number(property.bathrooms || 0)} bath</span>
        </div>

        {/* Personalized Message */}
        {shareContext?.personalized_message ? (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700 italic">
              "{String(shareContext.personalized_message)}"
            </p>
          </div>
        ) : null}

        {/* Action Button */}
        <div className="flex">
          <Link
            href={`/property/${propertyId}`}
            target="_blank"
            className="w-full flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            onClick={onViewProperty}
          >
            <FiEye className="h-4 w-4 mr-1" />
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

