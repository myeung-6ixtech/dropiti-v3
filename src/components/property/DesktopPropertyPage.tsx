'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShareIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Bed, Bathtub, Clock } from '@/assets/icons';
import { getAmenityIcon } from '@/constants/amenity-icons';
import { DEFAULT_AVATAR_URL } from '@/constants';
import PropertyPricingCard from '@/components/common/PropertyPricingCard';
import PropertyMap from '@/components/common/PropertyMap';

interface DesktopPropertyPageProps {
  property: {
    title: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    minimum_lease?: number;
    price: number;
    description: string;
    amenities?: string[] | Record<string, unknown>;
    address?: Record<string, unknown>;
    show_specific_location?: boolean;
    available_date?: string;
    property_uuid: string;
    owner_id?: string;
  };
  landlord: {
    id: string;
    nhost_user_id: string;
    name: string;
    avatar?: string;
    avg_response_time?: string;
    rating: number;
    review_count: number;
  } | null;
  allImages: string[];
  handleCreateOffer: () => void;
  hasExistingOffer: boolean;
  openGallery: (index: number) => void;
  formatAddressDisplay: (address: Record<string, unknown> | undefined, showSpecific: boolean | undefined) => string;
  shouldTruncateDescription: (description: string) => boolean;
  isDescriptionExpanded: boolean;
  setIsDescriptionExpanded: (expanded: boolean) => void;
  amenitiesList: string[];
  groupedAmenities: Record<string, Array<{ id: string; name: string }>>;
  isOwner?: boolean;
  isAdminListing?: boolean;
  onRequestClaimListing?: () => void;
}

export default function DesktopPropertyPage({
  property,
  landlord,
  allImages,
  handleCreateOffer,
  hasExistingOffer,
  openGallery,
  formatAddressDisplay,
  shouldTruncateDescription,
  isDescriptionExpanded,
  setIsDescriptionExpanded,
  amenitiesList,
  groupedAmenities,
  isOwner = false,
  isAdminListing = false,
  onRequestClaimListing,
}: DesktopPropertyPageProps) {
  const router = useRouter();

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title}`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        
        // Show a toast or alert (you might want to use your toast system)
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  return (
    <div className="hidden md:block">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 text-gray-600 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-base font-semibold text-gray-900 mb-0">{property.title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image gallery — `uploaded_images` from listing */}
            {allImages.length > 0 && (
              <div className="space-y-4">
                <div
                  className="relative h-96 w-full rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity group"
                  onClick={() => openGallery(0)}
                >
                  <Image
                    src={allImages[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-80 rounded-full p-2">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {allImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {allImages.slice(0, 4).map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="relative h-20 w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openGallery(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') openGallery(index);
                        }}
                        aria-label={`View image ${index + 1} of ${allImages.length}`}
                      >
                        <Image
                          src={image}
                          alt={`${property.title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="25vw"
                        />
                      </div>
                    ))}
                    {allImages.length > 4 && (
                      <div
                        className="relative h-20 w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800"
                        onClick={() => openGallery(4)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') openGallery(4);
                        }}
                        aria-label={`View ${allImages.length - 4} more images`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <span className="text-sm font-medium">+{allImages.length - 4}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Property Title and Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <span>
                      {(() => {
                        const formattedAddress = formatAddressDisplay(property.address, property.show_specific_location);
                        return formattedAddress || property.location;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Property Stats - Key Details */}
              <div className="grid grid-cols-3 gap-6 py-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Bed className="h-10 w-10 text-gray-600" />
                    <span className="text-lg font-bold text-gray-900">{property.bedrooms}</span>
                    <p className="text-xs text-gray-600">Bedrooms</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Bathtub className="h-10 w-10 text-gray-600" />
                    <span className="text-lg font-bold text-gray-900">{property.bathrooms}</span>
                    <p className="text-xs text-gray-600">Bathrooms</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Clock className="h-10 w-10 text-gray-600" />
                    <span className="text-lg font-bold text-gray-900">{property.minimum_lease || 'N/A'}</span>
                    <p className="text-xs text-gray-600">Min. Lease (months)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About this place</h2>
              <div className="relative">
                <p className={`text-gray-600 leading-relaxed whitespace-pre-wrap font-medium ${
                  shouldTruncateDescription(property.description) && !isDescriptionExpanded 
                    ? 'line-clamp-3' 
                    : ''
                }`}>
                  {property.description}
                </p>
                {shouldTruncateDescription(property.description) && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>

            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">What this place offers</h2>
                <div className="space-y-6">
                  {Object.entries(groupedAmenities).map(([category, amenities]) => (
                    <div key={category}>
                      <h3 className="text-base font-medium text-gray-900 mb-3">{category}</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {(amenities as Array<{ id: string; name: string }>).map((amenity, index) => {
                            const AmenityIcon = getAmenityIcon(amenity.id);
                            return (
                              <div key={index} className="flex items-center space-x-3">
                                <div className="w-6 h-6 text-gray-600">
                                  <AmenityIcon className="h-6 w-6" />
                                </div>
                                <span className="text-gray-700 font-medium">{amenity.name}</span>
                              </div>
                            );
                          })}
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Landlord Section */}
            {landlord && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Meet your host</h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={landlord.avatar || DEFAULT_AVATAR_URL}
                      alt={landlord.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm font-medium text-gray-900 mb-0">{landlord.name || 'Landlord'}</h3>
                    <div className="flex items-center mt-1 mb-5">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs text-gray-600 ml-1">
                        {landlord.rating} ({landlord.review_count} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Where you'll be</h2>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <PropertyMap
                  address={property.address}
                  location={property.location}
                  showSpecificLocation={property.show_specific_location}
                  className="w-full"
                />
              </div>
              <div className="text-sm text-gray-600 mt-3">
                <p>📍 Click and drag to explore the area around this property</p>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PropertyPricingCard
                price={property.price}
                availableDate={property.available_date || null}
                landlord={landlord ? {
                  id: landlord.id,
                  nhost_user_id: landlord.nhost_user_id,
                  name: landlord.name || 'Landlord',
                  avatar: landlord.avatar || '',
                  rating: landlord.rating,
                  reviewCount: landlord.review_count,
                  responseTime: landlord.avg_response_time || 'Unknown',
                  verified: false,
                  responseRate: 98,
                  totalProperties: 1,
                } : {
                  id: '',
                  nhost_user_id: '',
                  name: 'Unknown Landlord',
                  avatar: '',
                  rating: 0,
                  reviewCount: 0,
                  responseTime: 'Unknown',
                  verified: false,
                  responseRate: 98,
                  totalProperties: 1,
                }}
                onCreateOffer={handleCreateOffer}
                onChatWithLandlord={() => {}}
                isOwner={isOwner}
                hasExistingOffer={hasExistingOffer}
                isAdminListing={isAdminListing}
                onRequestClaimListing={onRequestClaimListing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
