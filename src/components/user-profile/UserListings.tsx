'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { HomeIcon, StarIcon } from '@heroicons/react/24/outline';
import { propertiesAPI } from '@/lib/api-client';
import CreateOfferModal from '@/components/common/CreateOfferModal';

interface UserListingsProps {
  userFirebaseUid: string;
}

interface Property {
  id: string;
  property_uuid: string;
  title: string;
  description: string;
  location: string;
  rental_price?: number;
  rental_price_currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  photos?: string[];
  rating?: number;
  review_count?: number;
}

export default function UserListings({ userFirebaseUid }: UserListingsProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  useEffect(() => {
    const fetchUserProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await propertiesAPI.getListings({
          landlord_firebase_uid: userFirebaseUid,
          limit: 20,
          offset: 0
        });
        
        if (response.success && response.data) {
          setProperties(response.data);
        } else {
          setError(response.error || 'Failed to load properties');
        }
      } catch (error) {
        console.error('Failed to fetch user properties:', error);
        setError('Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };

    if (userFirebaseUid) {
      fetchUserProperties();
    }
  }, [userFirebaseUid]);

  const handleCreateOffer = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setIsOfferModalOpen(true);
  };

  const handleCloseOfferModal = () => {
    setIsOfferModalOpen(false);
    setSelectedPropertyId('');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <HomeIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Current Listings</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <HomeIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Current Listings</h2>
        </div>
        <div className="text-center py-8 text-red-500">
          <HomeIcon className="h-12 w-12 mx-auto mb-4 text-red-300" />
          <p className="text-lg font-medium">Error loading properties</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <HomeIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Current Listings</h2>
          <span className="text-sm text-gray-500">({properties.length})</span>
        </div>
        
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <div key={property.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 group">
                <div className="relative">
                  <Image
                    src={property.photos && property.photos.length > 0 ? property.photos[0] : '/images/placeholder.png'}
                    alt={property.title}
                    width={400}
                    height={400}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {property.rating && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                      <StarIcon className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs font-medium">{property.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">
                    {property.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{property.location}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{property.bedrooms || 0} bed • {property.bathrooms || 0} bath</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      {property.rental_price_currency || '$'} {property.rental_price ? property.rental_price.toLocaleString() : 'N/A'}/month
                    </span>
                    <button
                      onClick={() => handleCreateOffer(property.property_uuid)}
                      className="text-xs btn-primary px-3 py-1 rounded-lg"
                    >
                      Create Offer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HomeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No properties listed yet</p>
            <p className="text-sm">This user hasn't listed any properties for rent.</p>
          </div>
        )}
      </div>

      {/* Create Offer Modal */}
      {isOfferModalOpen && (
        <CreateOfferModal
          isOpen={isOfferModalOpen}
          onClose={handleCloseOfferModal}
          propertyId={selectedPropertyId}
        />
      )}
    </>
  );
}
