'use client';

import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { MapPinIcon, HomeIcon, CurrencyDollarIcon, PencilIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
  property: Property & { 
    property_uuid?: string;
    // Dashboard-specific fields
    id?: string;
    address?: string;
    rental_price?: number;
    num_bedroom?: number;
    num_bathroom?: number;
    display_image?: string | null;
    property_type?: string;
  };
  onViewDetails?: (uuid: string) => void;
  isDashboard?: boolean; // New prop to indicate dashboard view
}

export default function PropertyCard({ property, onViewDetails, isDashboard = false }: PropertyCardProps) {
  const router = useRouter();

  // Debug: Log the property data to see what's being received
  console.log('PropertyCard received property:', property);

  // Handle both Property interface and API response data
  const propertyUuid = property?.property_uuid || '';
  const title = property?.title || 'No Title';
  const description = property?.description || 'No Description';
  const location = property?.location || property?.address || 'No Location';
  const price = property?.price || property?.rental_price || 0;
  const imageUrl = property?.imageUrl || property?.display_image || '';
  const propertyType = property?.property_type || '';

  // Get the correct bathroom and bedroom values
  const getBedrooms = () => {
    // Prioritize the correct field names
    return property?.num_bedroom || property?.bedrooms || 0;
  };

  const getBathrooms = () => {
    // Prioritize the correct field names
    return property?.num_bathroom || property?.bathrooms || 0;
  };

  // Format address for better display
  const getFormattedAddress = () => {
    if (!location || location === 'No Location') return '';
    
    // If it's already formatted with commas, return as is
    if (location.includes(',')) {
      return location;
    }
    
    // For simple addresses, return as is
    return location;
  };

  const handleViewDetails = () => {
    if (onViewDetails && propertyUuid) {
      onViewDetails(propertyUuid);
    } else if (propertyUuid) {
      router.push(`/property/${propertyUuid}`);
    } else {
      console.error('No property UUID available for navigation');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
      {/* Dashboard Edit Icon - Top Right */}
      {isDashboard && (
        <div className="absolute top-3 right-3 z-10">
          <Link
            href={`/dashboard/properties/edit/${propertyUuid}`}
            className="bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 flex items-center justify-center border border-gray-200"
            title="Edit Listing"
          >
            <PencilIcon className="h-4 w-4 text-gray-700" />
          </Link>
        </div>
      )}

      {/* Property Image */}
      <div className="relative h-48 w-full">
        {imageUrl && imageUrl.trim() !== '' ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <HomeIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        {/* Property Features */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{isDashboard ? getFormattedAddress() : location}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <HomeIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span>{getBedrooms()} bed{getBedrooms() !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <span>{getBathrooms()} bath{getBathrooms() !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Property Type for Dashboard */}
          {isDashboard && propertyType && (
            <div className="text-xs text-gray-500 capitalize">
              {propertyType}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-1" />
            <span className="text-xl font-bold text-gray-900">
              {price.toLocaleString()}
            </span>
            <span className="text-gray-600 ml-1">/month</span>
          </div>
        </div>

        {/* Dashboard Actions */}
        {isDashboard ? (
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              View Details
            </button>
            <Link
              href={`/dashboard/properties/edit/${propertyUuid}`}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
              title="View Incoming Offers"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              Offers
            </Link>
          </div>
        ) : (
          /* Regular View Details Button */
          <button
            onClick={handleViewDetails}
            className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

