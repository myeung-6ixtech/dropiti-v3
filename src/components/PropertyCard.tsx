'use client';

import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { 
  PencilIcon
} from '@heroicons/react/24/outline';
import { Bed, Bathtub } from '@/assets/icons';
import Image from 'next/image';
import Link from 'next/link';
import { propertyCardClasses } from '@/styles/property-card';
import { capitalizeWords } from '@/lib/utils';
import { resolvePropertyLocation } from '@/lib/normalize-listing';

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

  // Handle both Property interface and API response data
  const propertyUuid = property?.property_uuid || '';
  const title = property?.title || 'No Title';
  const location = resolvePropertyLocation(property);
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
    if (!location || location === 'No Location' || location === 'Location not specified') {
      return '';
    }
    
    // Try to parse the location to extract District and Country
    // Location format is: "building, addressLine1, addressLine2, district, state, country"
    if (location.includes(',')) {
      const parts = location.split(',').map(part => part.trim());
      console.log('PropertyCard: Location parts:', parts);
      
      // Find district and country in the parts array
      // District is typically one of the last 3 parts, country is usually the last
      let district = '';
      let country = '';
      
      // Country is usually the last part
      if (parts.length > 0) {
        country = parts[parts.length - 1];
      }
      
      // District is usually the second-to-last or third-to-last part
      // Look for common district patterns or use the second-to-last part
      if (parts.length >= 2) {
        // Try the second-to-last part first (most common case)
        district = parts[parts.length - 2];
        
        // If we have more parts, check if there's a more likely district candidate
        if (parts.length >= 3) {
          // Check if the third-to-last part looks more like a district
          const thirdToLast = parts[parts.length - 3];
          // If the second-to-last looks like a state and third-to-last looks like a district
          if (thirdToLast && !thirdToLast.match(/^\d+$/) && thirdToLast.length > 2) {
            district = thirdToLast;
          }
        }
      }
      
      
      // If we have both district and country, show them (capitalized)
      if (district && country && district !== country) {
        const result = `${capitalizeWords(district)}, ${capitalizeWords(country)}`;
        return result;
      }
      
      return capitalizeWords(parts[parts.length - 1]);
    }
    
    // For simple addresses without commas, return capitalized
    console.log('PropertyCard: Simplified location (no commas):', location);
    return capitalizeWords(location);
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
              className={`btn-secondary`}
              title="View Incoming Offers"
            >
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

