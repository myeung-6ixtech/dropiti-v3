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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Draft Status Badge - Top Right */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Draft
        </span>
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

          {/* Property Type */}
          {draft.property_type && (
            <div className={propertyCardClasses.features.type}>
              {draft.property_type}
            </div>
          )}
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



        {/* Last Saved Info */}
        <div className="text-xs text-gray-500 mb-4">
          Last saved: {formatDate(draft.last_saved_at)}
        </div>

        {/* Draft Actions */}
        <div className={propertyCardClasses.actions.container}>
          <button
            onClick={() => onContinue(draft.property_uuid)}
            className={`${propertyCardClasses.actions.button} ${propertyCardClasses.actions.buttonPrimary}`}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`${propertyCardClasses.actions.button} bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center`}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
