'use client';

import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { 
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Bed, Bathtub } from '@/assets/icons';
import Image from 'next/image';
import Link from 'next/link';
import { propertyCardClasses } from '@/styles/property-card';

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

  // Extract District and Country for simplified display
  const getSimplifiedLocation = () => {
    if (!location || location === 'No Location') return '';
    // Try to parse the location to extract District and Country
    // Location format is typically: "District, State, Country" or similar
    if (location.includes(',')) {
      const parts = location.split(',').map(part => part.trim());
      console.log('PropertyCard: Location parts:', parts);
      
      // If we have at least 2 parts, show District and Country
      if (parts.length >= 2) {
        const district = parts[5];
        const country = parts[parts.length - 1]; // Last part is usually country
        
        // If district and country are different, show both
        if (district !== country) {
          const result = `${district}, ${country}`;
          console.log('PropertyCard: Simplified location (District, Country):', result);
          return result;
        }
        // If they're the same, just show district
        console.log('PropertyCard: Simplified location (District only):', district);
        return district;
      }
      
      // If we have only 1 part, return as is
      console.log('PropertyCard: Simplified location (single part):', parts[0]);
      return parts[0];
    }
    
    // For simple addresses without commas, return as is
    console.log('PropertyCard: Simplified location (no commas):', location);
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
    <div className={propertyCardClasses.container}>
      {/* Dashboard Edit Icon - Top Right */}
      {isDashboard && (
        <div className={propertyCardClasses.editIcon.container}>
          <Link
            href={`/dashboard/properties/edit/${propertyUuid}`}
            className={propertyCardClasses.editIcon.link}
            title="Edit Listing"
          >
            <PencilIcon className={propertyCardClasses.editIcon.svg} />
          </Link>
        </div>
      )}

      {/* Property Image */}
      <div className={propertyCardClasses.image.container}>
        {imageUrl && imageUrl.trim() !== '' ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className={propertyCardClasses.image.placeholder}
          />
        ) : (
          <Image
            src="/images/placeholder.png"
            alt="Property placeholder"
            fill
            className={propertyCardClasses.image.placeholder}
          />
        )}
      </div>

      {/* Property Details */}
      <div className={propertyCardClasses.details}>
        <h3 className={propertyCardClasses.title}>
          {title}
        </h3>
        {/* Property Features */}
        <div className={propertyCardClasses.features.container}>
          <div className={propertyCardClasses.features.location}>
            <span>{getSimplifiedLocation()}</span>
          </div>
          
          <div className={propertyCardClasses.features.row}>
            <div className={propertyCardClasses.features.feature}>
              <Bed className={propertyCardClasses.features.icon} />
              <span className={propertyCardClasses.features.text}>
                {getBedrooms()} bed{getBedrooms() !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className={propertyCardClasses.features.feature}>
              <Bathtub className={propertyCardClasses.features.icon} />
              <span className={propertyCardClasses.features.text}>
                {getBathrooms()} bath{getBathrooms() !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Property Type for Dashboard */}
          {isDashboard && propertyType && (
            <div className={propertyCardClasses.features.type}>
              {propertyType}
            </div>
          )}
        </div>

        {/* Price */}
        <div className={propertyCardClasses.price.container}>
          <div className="flex items-center">
            <span className={propertyCardClasses.price.amount}>
              {price.toLocaleString()}
            </span>
            <span className={propertyCardClasses.price.unit}>/month</span>
          </div>
        </div>

        {/* Dashboard Actions */}
        {isDashboard ? (
          <div className={propertyCardClasses.actions.container}>
            <button
              onClick={handleViewDetails}
              className={`${propertyCardClasses.actions.button} ${propertyCardClasses.actions.buttonPrimary}`}
            >
              View Details
            </button>
            <Link
              href={`/dashboard/properties/${propertyUuid}/incoming-offers`}
              className={`${propertyCardClasses.actions.button} ${propertyCardClasses.actions.buttonSecondary}`}
              title="View Incoming Offers"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              Offers
            </Link>
          </div>
        ) : (
          /* Regular View Details Button */
          <button
            onClick={handleViewDetails}
            className={propertyCardClasses.actions.buttonFull}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

