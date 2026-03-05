'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { propertiesAPI, offersAPI } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Footer from '@/components/common/Footer';
import CreateOfferModal from '@/components/common/CreateOfferModal';
import { groupAmenitiesByCategory } from '@/constants/amenities';
import MobilePropertyPage from '@/components/property/MobilePropertyPage';
import DesktopPropertyPage from '@/components/property/DesktopPropertyPage';
import SEO, { createPropertySchema } from '@/components/SEO';

interface PropertyData {
  id: string;
  property_uuid: string;
  title: string;
  description: string;
  location: string;
  address?: Record<string, unknown>; // Raw address data
  show_specific_location?: boolean; // Whether to show full address or just district/country
  price: number;
  bedrooms: number;
  bathrooms: number;
  image_url?: string;
  display_image?: string;
  uploaded_images?: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
  details?: Record<string, unknown>;
  amenities?: string[] | Record<string, unknown>; // Handle both array and JSONB
  minimum_lease?: number;
  available_date?: string;
  owner_id?: string;
}

interface LandlordData {
  id: string;
  uuid: string; // Add uuid for navigation
  nhost_user_id: string;
  name: string;
  email: string;
  avatar?: string;
  verified: boolean;
  rating: number;
  review_count: number;
  response_time: string;
  response_rate: number;
  total_properties: number;
  total_guests: number;
}

interface PropertyWithLandlord {
  property: PropertyData;
  landlord: LandlordData | null;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [propertyData, setPropertyData] = useState<PropertyWithLandlord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOfferModalOpen, setIsCreateOfferModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [hasExistingOffer, setHasExistingOffer] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { user: authUser, isAuthenticated } = useAuth(); // Get user from context

  // Function to check if description needs truncation (500 characters)
  const shouldTruncateDescription = (description: string) => {
    if (!description) return false;
    return description.length > 500;
  };

  // Function to format address based on show_specific_location flag
  const formatAddressDisplay = (address: Record<string, unknown> | undefined, showSpecificLocation: boolean | undefined) => {
    if (!address || !showSpecificLocation) {
      // If show_specific_location is false or undefined, only show district and country
      const district = address?.district || 'Unknown District';
      const country = address?.country || 'Unknown Country';
      return `${district}, ${country}`;
    }
    
    // If show_specific_location is true, show full formatted address
    // This will use the existing location field which is already formatted
    return null; // Return null to use the existing location field
  };

  // Function to check if the current user has existing offers for this property
  const checkExistingOffer = useCallback(async (propertyUuid: string, userId: string) => {
    if (!userId || !propertyUuid || !isAuthenticated) return;

    try {
      const response = await offersAPI.getOffersByInitiator(userId);

      if (response.success && response.data) {
        // Check if any of the user's active offers are for this property
        const hasOffer = response.data.some((offer: { 
          property_uuid: string; 
          offer_status: string; 
          is_active: boolean;
        }) => 
          offer.property_uuid === propertyUuid && 
          offer.is_active && 
          (offer.offer_status === 'pending' || offer.offer_status === 'accepted')
        );

        setHasExistingOffer(hasOffer);
      }
    } catch (error) {
      console.error('Failed to check existing offers:', error);
    }
  }, [isAuthenticated]);

  // Image navigation functions - defined at top level to avoid conditional hook calls
  const nextImage = useCallback(() => {
    if (propertyData?.property?.uploaded_images) {
      const images = propertyData.property.uploaded_images;
      if (Array.isArray(images)) {
        setSelectedImageIndex((prev) => 
          prev === images.length - 1 ? 0 : prev + 1
        );
      }
    }
  }, [propertyData?.property?.uploaded_images]);

  const previousImage = useCallback(() => {
    if (propertyData?.property?.uploaded_images) {
      const images = propertyData.property.uploaded_images;
      if (Array.isArray(images)) {
        setSelectedImageIndex((prev) => 
          prev === 0 ? images.length - 1 : prev - 1
        );
      }
    }
  }, [propertyData?.property?.uploaded_images]);

  // Gallery functions - defined at top level to avoid conditional hook calls
  const openGallery = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryModalOpen(true);
  }, []);

  const closeGallery = useCallback(() => {
    setIsGalleryModalOpen(false);
  }, []);

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isGalleryModalOpen) return;
      
      switch (event.key) {
        case 'Escape':
          closeGallery();
          break;
        case 'ArrowLeft':
          previousImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryModalOpen, closeGallery, nextImage, previousImage]);

  useEffect(() => {
    const loadProperty = async () => {
      if (params.id) {
        try {
          setIsLoading(true);
          setError(null);

          const response = await propertiesAPI.getPropertyByUuid(params.id as string);

          if (response.success && response.data) {
            setPropertyData(response.data);

            if (authUser?.id) {
              checkExistingOffer(response.data.property.property_uuid, authUser.id);
            }
          } else {
            setError(response.error || 'Failed to load property');
          }
        } catch (error) {
          console.error('Failed to load property:', error);
          setError('Failed to load property data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProperty();
  }, [params.id, authUser?.id, checkExistingOffer]);

  // Check for existing offers when auth user changes
  useEffect(() => {
    if (authUser?.id && propertyData?.property?.property_uuid) {
      checkExistingOffer(propertyData.property.property_uuid, authUser.id);
    }
  }, [authUser?.id, propertyData?.property?.property_uuid, checkExistingOffer]);

  const handleCreateOffer = () => {
    setIsCreateOfferModalOpen(true);
  };


  const handleOfferSubmit = async (offerData: {
    rentalPrice: number;
    leaseDuration: number;
    paymentFrequency: string;
    moveInDate: string;
  }) => {
    try {
      // Check if user is authenticated
      if (!authUser?.id) {
        alert('You must be logged in to create an offer');
        return;
      }

      // Check if we have property and landlord data
      if (!propertyData?.property?.property_uuid || !propertyData?.landlord?.nhost_user_id) {
        alert('Unable to create offer: Missing property or landlord information');
        return;
      }

      // Call the create-offer API
      const response = await offersAPI.createOffer({
        propertyId: propertyData.property.property_uuid,
        initiatorFirebaseUid: authUser.id,
        recipientFirebaseUid: propertyData.landlord?.nhost_user_id || '',
        proposingRentPrice: offerData.rentalPrice,
        numLeasingMonths: offerData.leaseDuration,
        paymentFrequency: offerData.paymentFrequency,
        moveInDate: offerData.moveInDate,
        currency: 'HKD'
      });

      if (response.success) {
        // Show success toast
        showToast('success', 'Offer Successfully Created!');
        
        // Update the hasExistingOffer state immediately
        setHasExistingOffer(true);
        
        // Close the modal
        setIsCreateOfferModalOpen(false);
        
        // Redirect to dashboard applications after a short delay
        setTimeout(() => {
          router.push('/dashboard/applications');
        }, 1500); // 1.5 second delay to show the toast
      } else {
        showToast('error', `Failed to submit offer: ${response.error || 'Unknown error'}`);
      }
    } catch (error: unknown) {
      // Handle 409 Conflict error (duplicate offer) - this is expected behavior
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'status' in error.response && 
          error.response.status === 409) {
        // This is expected - user already has an offer for this property
        showToast('error', 'You already have a pending offer for this property');
        setHasExistingOffer(true);
      } else {
        // This is an unexpected error - log it for debugging
        console.error('Unexpected error creating offer:', error);
        showToast('error', `Error creating offer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !propertyData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The property you are looking for could not be found.'}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { property, landlord } = propertyData;

  // Get the main display image or fallback
  const mainImage = property.image_url || property.display_image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
  
  // Get all images for the gallery - prioritize uploaded_images, fallback to main image
  const allImages = (() => {
    if (property.uploaded_images && Array.isArray(property.uploaded_images) && property.uploaded_images.length > 0) {
      return property.uploaded_images;
    }
    // If no uploaded images, use the main image as the only image
    return [mainImage];
  })();

  // Get amenities list
  const amenitiesList = property.amenities && Array.isArray(property.amenities) 
    ? property.amenities 
    : [];

  // Group amenities by category
  const groupedAmenities = groupAmenitiesByCategory(
    Array.isArray(property.amenities) 
      ? property.amenities 
      : []
  );

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Component with Structured Data */}
      <SEO
        title={`${property.title} - ${new Intl.NumberFormat('en-HK', {
          style: 'currency',
          currency: 'HKD',
          minimumFractionDigits: 0,
        }).format(property.price)} | Dropiti`}
        description={`${property.title} - ${property.description?.substring(0, 150)}... Find this and more properties on Dropiti.`}
        canonical={`/property/${property.property_uuid}`}
        image={property.display_image || property.image_url}
        type="website"
        keywords={[
          'property rental',
          'apartment',
          'house',
          'rent',
          'Hong Kong',
          'real estate',
          property.title,
          `${property.bedrooms} bedroom`,
          `${property.bathrooms} bathroom`,
        ]}
        structuredData={createPropertySchema({
          id: property.property_uuid,
          title: property.title,
          description: property.description || '',
          price: property.price,
          currency: 'HKD',
          address: typeof property.address === 'string' ? property.address : JSON.stringify(property.address),
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          images: allImages,
          landlord: {
            name: landlord?.name || 'Property Owner',
            email: landlord?.email || '',
          },
        })}
      />

      {/* Mobile Property Page */}
      <MobilePropertyPage
        property={property}
        landlord={landlord}
        mainImage={mainImage}
        allImages={allImages}
        handleCreateOffer={handleCreateOffer}
        hasExistingOffer={hasExistingOffer}
        isAuthenticated={isAuthenticated}
        isOwner={authUser?.id === property.owner_id}
        formatAddressDisplay={(address: Record<string, unknown> | undefined, showSpecific: boolean | undefined) => formatAddressDisplay(address, showSpecific) || ''}
      />

      {/* Desktop Property Page */}
      <DesktopPropertyPage
        property={property}
        landlord={landlord}
        allImages={allImages}
        handleCreateOffer={handleCreateOffer}
        hasExistingOffer={hasExistingOffer}
        openGallery={openGallery}
        formatAddressDisplay={(address: Record<string, unknown> | undefined, showSpecific: boolean | undefined) => formatAddressDisplay(address, showSpecific) || ''}
        shouldTruncateDescription={shouldTruncateDescription}
        isDescriptionExpanded={isDescriptionExpanded}
        setIsDescriptionExpanded={setIsDescriptionExpanded}
        amenitiesList={amenitiesList}
        groupedAmenities={groupedAmenities}
      />


      {/* Footer */}
      <Footer />

      {/* Create Offer Modal */}
      <CreateOfferModal
        isOpen={isCreateOfferModalOpen}
        onClose={() => setIsCreateOfferModalOpen(false)}
        propertyId={property.property_uuid}
        currentPrice={property.price}
        recipientFirebaseUid={landlord?.nhost_user_id}
        onOfferSubmit={handleOfferSubmit}
      />

      {/* Image Gallery Modal */}
      {isGalleryModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeGallery}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Main Image */}
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[selectedImageIndex]}
                alt={`${property.title} - Image ${selectedImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Image Counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-white bg-black bg-opacity-50 rounded-full px-4 py-2">
                <span className="text-sm font-medium">
                  {selectedImageIndex + 1} of {allImages.length}
                </span>
              </div>
            )}

            {/* Thumbnail Navigation */}
            {allImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === selectedImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
