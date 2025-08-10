'use client';

import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { MapPinIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (id: string) => void;
}

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(property.id);
    } else {
      router.push(`/property/${property.id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Property Image */}
      <div className="relative h-48 w-full">
        {property.imageUrl && property.imageUrl.trim() !== '' ? (
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <HomeIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
        {!property.available && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            Not Available
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {property.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.description}
        </p>

        {/* Property Features */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{property.location}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <HomeIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-1" />
            <span className="text-xl font-bold text-gray-900">
              {property.price.toLocaleString()}
            </span>
            <span className="text-gray-600 ml-1">/month</span>
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={handleViewDetails}
          className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
