'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatPropertyLocation } from '@/lib/utils';
import { Bed, Bathtub } from '@/assets/icons';
import Image from 'next/image';
import { propertyCardClasses } from '@/styles/property-card';

interface DraftCardProps {
  draft: {
    id: string;
    property_uuid: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    last_saved_at: string;
    status: string;
    property_type: string;
    rental_space: string;
    address: string;
    num_bedroom: number;
    num_bathroom: number;
    rental_price: number;
    amenities: string[];
    display_image: string;
    completion_percentage: number;
  };
  onContinue: (draftId: string) => void;
  onDelete: (draftId: string) => void;
}

export default function DraftCard({ draft, onContinue, onDelete }: DraftCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await onDelete(draft.property_uuid);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Extract District and Country for simplified display (same logic as PropertyCard)
  const getSimplifiedLocation = () => {
    if (!draft.address) return 'No Location';
    const location = formatPropertyLocation(draft.address);
    if (location === 'Address not specified') return 'No Location';
    
    if (location.includes(',')) {
      const parts = location.split(',').map(part => part.trim());
      if (parts.length >= 2) {
        const district = parts[0];
        const country = parts[parts.length - 1];
        if (district !== country) {
          return `${district}, ${country}`;
        }
        return district;
      }
      return parts[0];
    }
    return location;
  };

  return (
    <div className={propertyCardClasses.container}>
      {/* Draft Status Badge - Top Left */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Draft
        </span>
      </div>

      {/* Edit Icon - Top Right (matching PropertyCard design) */}
      <div className={propertyCardClasses.editIcon.container}>
        <button
          onClick={() => onContinue(draft.property_uuid)}
          className={propertyCardClasses.editIcon.link}
          title="Edit Draft"
        >
          <PencilIcon className={propertyCardClasses.editIcon.svg} />
        </button>
      </div>

      {/* Property Image */}
      <div className={propertyCardClasses.image.container}>
        {draft.display_image && draft.display_image.trim() !== '' ? (
          <Image
            src={draft.display_image}
            alt={draft.title || 'Draft Property'}
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
          {draft.title || 'Untitled Draft'}
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
                {draft.num_bedroom || 0} bed{(draft.num_bedroom || 0) !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className={propertyCardClasses.features.feature}>
              <Bathtub className={propertyCardClasses.features.icon} />
              <span className={propertyCardClasses.features.text}>
                {draft.num_bathroom || 0} bath{(draft.num_bathroom || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className={propertyCardClasses.price.container}>
          <div className="flex items-center">
            <span className={propertyCardClasses.price.amount}>
              {(draft.rental_price || 0).toLocaleString()}
            </span>
            <span className={propertyCardClasses.price.unit}>/month</span>
          </div>
        </div>

        {/* Delete Button - Secondary black-stroke button */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete Draft'}
        </button>
      </div>
    </div>
  );
}