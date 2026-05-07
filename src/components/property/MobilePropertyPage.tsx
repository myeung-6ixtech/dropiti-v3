'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShareIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Bed, Bathtub, Clock } from '@/assets/icons';
import { getAmenityIcon } from '@/constants/amenity-icons';
import { DEFAULT_AVATAR_URL } from '@/constants';
import PropertyMap from '@/components/common/PropertyMap';
import { useResponsiveModal } from '@/hooks/useResponsiveModal';

interface MobilePropertyPageProps {
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
    property_uuid?: string;
  };
  landlord: {
    name: string;
    avatar?: string;
    avg_response_time?: string;
    rating: number;
    review_count: number;
  } | null;
  mainImage: string;
  allImages: string[];
  handleCreateOffer: () => void;
  hasExistingOffer: boolean;
  isAuthenticated: boolean;
  isOwner?: boolean;
  isAdminListing?: boolean;
  onRequestClaimListing?: () => void;
  formatAddressDisplay: (address: Record<string, unknown> | undefined, showSpecific: boolean | undefined) => string;
}

export default function MobilePropertyPage({
  property,
  landlord,
  mainImage,
  allImages,
  handleCreateOffer,
  hasExistingOffer,
  isAuthenticated,
  isOwner = false,
  isAdminListing = false,
  onRequestClaimListing,
  formatAddressDisplay
}: MobilePropertyPageProps) {
  const router = useRouter();
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  // Description modal
  const { ModalComponent: DescriptionModal } = useResponsiveModal({
    isOpen: isDescriptionModalOpen,
    onClose: () => setIsDescriptionModalOpen(false),
    mobileTitle: 'About this place',
    mobileHeight: 'large'
  });

  // Helper function to truncate description
  const truncateDescription = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const truncatedDescription = truncateDescription(property.description);
  const shouldShowSeeMore = property.description.length > 300;

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

  // Get amenities list
  const amenitiesList = property.amenities && Array.isArray(property.amenities) 
    ? property.amenities 
    : [];

  return (
    <div className="block md:hidden">
      {/* Mobile Hero Section - Full Width */}
      <div className="relative w-full h-[50vh]">
        {/* Main Hero Image */}
        <div className="relative w-full h-full">
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
          
          {/* Gradient Overlay for Better Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Mobile Navigation Overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4">
            <div className="flex items-center justify-between">
              {/* Back Button - White Circle */}
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Share Button */}
              <div className="flex items-center">
                <button 
                  onClick={handleShare}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ShareIcon className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Image Gallery Indicator */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2">
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Content Container */}
      <div className="px-4 mb-5">
        {/* Property Title and Location */}
        <div className="py-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <div className="flex items-center text-gray-600">
            <span className="text-xs">
              {(() => {
                const formattedAddress = formatAddressDisplay(property.address, property.show_specific_location);
                return formattedAddress || property.location;
              })()}
            </span>
          </div>
        </div>

        {/* Property Stats - Horizontal Layout */}
        <div className="flex items-center justify-around py-6 border-y border-gray-200">
          <div className="flex flex-col items-center">
            <Bed className="h-6 w-6 text-gray-600 mb-1" />
            <span className="text-xs font-medium text-gray-900">{property.bedrooms}</span>
            <span className="text-xs text-gray-500">Bedrooms</span>
          </div>
          <div className="flex flex-col items-center">
            <Bathtub className="h-6 w-6 text-gray-600 mb-1" />
            <span className="text-xs font-medium text-gray-900">{property.bathrooms}</span>
            <span className="text-xs text-gray-500">Bathrooms</span>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="h-6 w-6 text-gray-600 mb-1" />
            <span className="text-xs font-medium text-gray-900">{property.minimum_lease || 'N/A'}</span>
            <span className="text-xs text-gray-500">Min. Lease</span>
          </div>
        </div>
      </div>

      {/* Create Offer / Request to Claim Section */}
      <div className="px-4 py-6 bg-white">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {isAdminListing ? 'Make an offer or claim' : 'Make an Offer'}
              </h3>
              <p className="text-xs text-gray-600">
                {isAdminListing
                  ? isAuthenticated
                    ? 'Submit a rental offer to Dropiti, or request to transfer this listing to your landlord account.'
                    : 'Sign in to send an offer to Dropiti or to request claiming this listing for your account.'
                  : 'Start your rental journey'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">${property.price}</div>
              <div className="text-xs text-gray-500">per month</div>
            </div>
          </div>

          {isOwner ? (
            <button
              onClick={() => router.push(`/dashboard/properties/edit/${property.property_uuid || 'unknown'}`)}
              className="btn-secondary w-full py-4 rounded-xl font-semibold text-base hover:bg-gray-100 transition-colors"
            >
              Edit Your Listing
            </button>
          ) : !isAuthenticated ? (
            <button
              onClick={() => router.push('/auth/signin')}
              className="btn-primary w-full bg-black text-white py-4 rounded-xl font-semibold text-base hover:bg-gray-800 transition-colors"
            >
              {isAdminListing ? 'Sign In' : 'Sign In to Make an Offer'}
            </button>
          ) : hasExistingOffer ? (
            <div className="space-y-3">
              <button
                disabled
                className="w-full bg-gray-400 text-white py-4 rounded-xl font-semibold text-base cursor-not-allowed opacity-75"
              >
                Offer Made
              </button>
              {isAdminListing ? (
                <button
                  type="button"
                  onClick={() => onRequestClaimListing?.()}
                  className="btn-secondary w-full py-4 rounded-xl font-semibold text-base hover:bg-gray-100 transition-colors"
                >
                  Request to Claim Listing
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleCreateOffer}
                className="btn-primary w-full bg-black text-white py-4 rounded-xl font-semibold text-base hover:bg-gray-800 transition-colors"
              >
                Create Offer
              </button>
              {isAdminListing ? (
                <button
                  type="button"
                  onClick={() => onRequestClaimListing?.()}
                  className="btn-secondary w-full py-4 rounded-xl font-semibold text-base hover:bg-gray-100 transition-colors"
                >
                  Request to Claim Listing
                </button>
              ) : null}
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {isAdminListing
                ? 'Claim this listing? Reach out to our Service Centre'
                : 'No booking fees • Secure payment'}
            </p>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About this place</h2>
          <div className="text-gray-600 leading-relaxed font-medium">
            {truncatedDescription}
          </div>
          {shouldShowSeeMore && (
            <button
              onClick={() => setIsDescriptionModalOpen(true)}
              className="btn-secondary w-full mt-4 py-3 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              See More
            </button>
          )}
        </div>
      </div>

      {/* Amenities Section */}
      {amenitiesList.length > 0 && (
        <div className="px-4 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 gap-4">
              {amenitiesList.map((amenity, index) => {
                const AmenityIcon = getAmenityIcon(amenity);
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 text-gray-600">
                      <AmenityIcon className="h-6 w-6" />
                    </div>
                    <span className="text-xs text-gray-700 font-medium">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Map Section */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Where you'll be</h2>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <PropertyMap 
              address={(() => {
                const formattedAddress = formatAddressDisplay(property.address, property.show_specific_location);
                return formattedAddress || property.location;
              })()}
              location={property.location}
              className="w-full"
              disableGeocoding={false}
            />
          </div>
          <div className="text-xs text-gray-600 mt-3">
            <p>📍 Tap and drag to explore the area around this property</p>
          </div>
        </div>
      </div>

      {/* Landlord Section */}
      {landlord && (
        <div className="px-4 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Meet the Landlord</h2>
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
                <h3 className="text-xs font-semibold text-gray-900 mb-0">{landlord.name}</h3>
                {!isAdminListing && (
                  <div className="flex items-center mt-1 mb-5">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs text-gray-600 ml-1">
                      {landlord.rating} ({landlord.review_count} reviews)
                    </span>
                  </div>
                )}
                {isAdminListing ? (
                  <button
                    type="button"
                    onClick={() => onRequestClaimListing?.()}
                    className="btn-primary w-full bg-black text-white py-4 rounded-xl text-xs font-semibold hover:bg-gray-800 transition-colors text-center"
                  >
                    Reach out to Admin
                  </button>
                ) : (
                  <button className="btn-primary w-full bg-black text-white py-4 rounded-xl text-xs font-semibold hover:bg-gray-800 transition-colors">
                    Chat with Landlord
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Modal */}
      <DescriptionModal>
        <div className="p-6">
          <div className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
            {property.description}
          </div>
        </div>
      </DescriptionModal>
    </div>
  );
}
