'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { propertiesAPI, offersAPI } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  StarIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import Footer from '@/components/common/Footer';
import CreateOfferModal from '@/components/common/CreateOfferModal';
import PropertyPricingCard from '@/components/common/PropertyPricingCard';
import { usersAPI } from '@/lib/api-client'; // Added import for usersAPI
import { getAmenityIcon, getAmenityDisplayName } from '@/constants/amenity-icons';
import { Bed, Bathtub, Clock } from '@/assets/icons';

interface PropertyData {
  id: string;
  property_uuid: string;
  title: string;
  description: string;
  location: string;
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
  firebase_uid: string;
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
  const { user: authUser } = useAuth(); // Get user from context

  // Function to check if the current user has existing offers for this property
  const checkExistingOffer = useCallback(async (propertyUuid: string, userId: string) => {
    if (!userId || !propertyUuid) return;
    
    try {
      const response = await offersAPI.getOffersByInitiator(userId);
      
      if (response.success && response.data) {
        // Check if any of the user's offers are for this property
        const hasOffer = response.data.some((offer: { property_uuid: string }) => 
          offer.property_uuid === propertyUuid
        );
        setHasExistingOffer(hasOffer);
      }
    } catch (error) {
      console.error('Failed to check existing offers:', error);
    }
  }, []);

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

  // Function to fetch landlord details using owner_id
  const fetchLandlordDetails = async (ownerId: string) => {
    try {
      console.log('Fetching landlord details for owner_id:', ownerId);
      const landlordResponse = await usersAPI.getUserByFirebaseUid(ownerId);
      
      if (landlordResponse.success && landlordResponse.data) {
        console.log('Landlord details fetched successfully:', landlordResponse.data);
        return {
          id: landlordResponse.data.id,
          uuid: landlordResponse.data.uuid, // Add uuid for navigation
          firebase_uid: landlordResponse.data.firebase_uid,
          name: landlordResponse.data.display_name || 'Unknown Landlord',
          email: landlordResponse.data.email || '',
          avatar: landlordResponse.data.photo_url || '',
          verified: landlordResponse.data.verified || false,
          rating: landlordResponse.data.rating || 0,
          review_count: landlordResponse.data.review_count || 0,
          response_time: landlordResponse.data.response_time || 'Unknown',
          response_rate: landlordResponse.data.response_rate || 98,
          total_properties: landlordResponse.data.total_properties || 1,
          total_guests: landlordResponse.data.total_guests || 0,
        };
      } else {
        console.log('Failed to fetch landlord details:', landlordResponse.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching landlord details:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadProperty = async () => {
      if (params.id) {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await propertiesAPI.getPropertyByUuid(params.id as string);
          
          if (response.success && response.data) {
            console.log('=== PROPERTY DATA DEBUG ===');
            console.log('Full API response:', response);
            console.log('Property data received:', response.data);
            console.log('Property object keys:', Object.keys(response.data.property));
            console.log('Property object:', response.data.property);
            
            // Check for landlord_firebase_uid specifically
            console.log('=== LANDLORD FIREBASE UID CHECK ===');
            console.log('Property owner_id:', response.data.property.owner_id);
            console.log('Property has owner_id:', !!response.data.property.owner_id);
            console.log('Property owner_id type:', typeof response.data.property.owner_id);
            
            // Fetch landlord details if we have an owner_id
            let landlordData = null;
            if (response.data.property.owner_id) {
              console.log('=== FETCHING LANDLORD DETAILS ===');
              landlordData = await fetchLandlordDetails(response.data.property.owner_id);
              console.log('Landlord data fetched:', landlordData);
            }
            
            // Combine property data with landlord data
            const combinedData = {
              property: response.data.property,
              landlord: landlordData
            };
            
            console.log('=== LANDLORD DATA CHECK ===');
            console.log('Combined data:', combinedData);
            console.log('Landlord data:', combinedData.landlord);
            console.log('Landlord data type:', typeof combinedData.landlord);
            console.log('Landlord is null:', combinedData.landlord === null);
            
            if (combinedData.landlord) {
              console.log('Landlord object keys:', Object.keys(combinedData.landlord));
              console.log('Landlord firebase_uid:', combinedData.landlord.firebase_uid);
            }
            
            console.log('=== END DEBUG ===');
            
            setPropertyData(combinedData);
            
            // Check if the current user has existing offers for this property
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
  }, [params.id]);

  // Check for existing offers when auth user changes
  useEffect(() => {
    if (authUser?.id && propertyData?.property?.property_uuid) {
      checkExistingOffer(propertyData.property.property_uuid, authUser.id);
    }
  }, [authUser?.id, propertyData?.property?.property_uuid, checkExistingOffer]);

  const handleCreateOffer = () => {
    setIsCreateOfferModalOpen(true);
  };

  const handleChatWithLandlord = () => {
    if (propertyData?.landlord) {
      // Navigate to chat page with landlord firebase_uid
      router.push(`/dashboard/chat?landlord=${propertyData.landlord.firebase_uid}`);
    }
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
      if (!propertyData?.property?.property_uuid || !propertyData?.landlord?.firebase_uid) {
        alert('Unable to create offer: Missing property or landlord information');
        return;
      }

      // Call the create-offer API
      const response = await offersAPI.createOffer({
        propertyId: propertyData.property.property_uuid,
        initiatorFirebaseUid: authUser.id,
        recipientFirebaseUid: propertyData.landlord?.firebase_uid || '',
        proposingRentPrice: offerData.rentalPrice,
        numLeasingMonths: offerData.leaseDuration,
        paymentFrequency: offerData.paymentFrequency,
        moveInDate: offerData.moveInDate,
        currency: 'HKD'
      });

      if (response.success) {
        // Show success toast
        showToast('success', 'Offer Successfully Created!');
        
        // Close the modal
        setIsCreateOfferModalOpen(false);
        
        // Redirect to dashboard applications after a short delay
        setTimeout(() => {
          router.push('/dashboard/applications');
        }, 1500); // 1.5 second delay to show the toast
      } else {
        showToast('error', `Failed to submit offer: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      showToast('error', `Error creating offer: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{property.title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ShareIcon className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <HeartIcon className="w-5 h-5" />
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
            {/* Image Gallery */}
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
                />
                {/* Hover overlay to indicate clickability */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-80 rounded-full p-2">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Image Thumbnails Gallery */}
              {allImages.length > 1 ? (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="relative h-20 w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openGallery(index)}
                    >
                      <Image
                        src={image}
                        alt={`${property.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {allImages.length > 4 && (
                    <div 
                      className="relative h-20 w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800"
                      onClick={() => openGallery(4)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <span className="text-sm font-medium">+{allImages.length - 4}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No additional photos available</p>
                </div>
              )}
            </div>

            {/* Property Title and Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">4.8</span>
                    <span className="text-gray-500 text-sm">(127 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Bed className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold">{property.bedrooms}</span>
                  </div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Bathtub className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold">{property.bathrooms}</span>
                  </div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold">{property.minimum_lease}</span>
                  </div>
                  <p className="text-sm text-gray-500">Min. Lease (months)</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this place</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 gap-4">
                {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
                  property.amenities.map((amenityId) => {
                    const AmenityIcon = getAmenityIcon(amenityId);
                    const displayName = getAmenityDisplayName(amenityId);
                    return (
                      <div key={amenityId} className="flex items-center space-x-3">
                        <AmenityIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700">{displayName}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">No amenities listed.</p>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Property Type</span>
                  <p className="text-gray-500 font-medium">{String(property.details?.type || 'Unknown')}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Furnished</span>
                  <p className="text-gray-500 font-medium">{String(property.details?.furnished || 'Unknown')}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Pets Allowed</span>
                  <p className="text-gray-500 font-medium">{Boolean(property.details?.petsAllowed) ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Parking</span>
                  <p className="text-gray-500 font-medium">{Boolean(property.details?.parking) ? 'Available' : 'Not available'}</p>
                </div>
              </div>
            </div>


          </div>

          {/* Right Column - Pricing and Actions */}
          {(() => {
            console.log('Rendering PropertyPricingCard with landlord:', landlord);
            const isOwner = authUser?.id === property.owner_id;
            
            return (
              <PropertyPricingCard
                price={property.price}
                availableDate={property.available_date || null}
                minimumLease={property.minimum_lease || 12}
                landlord={{
                  id: landlord?.id || '',
                  uuid: landlord?.uuid || '', // Add uuid for navigation
                  name: landlord?.name || 'Unknown Landlord',
                  avatar: landlord?.avatar || '',
                  rating: landlord?.rating || 0,
                  reviewCount: landlord?.review_count || 0,
                  responseTime: landlord?.response_time || 'Unknown',
                  verified: landlord?.verified || false,
                  responseRate: landlord?.response_rate || 98,
                  totalProperties: landlord?.total_properties || 5,
                }}
                details={{
                  type: (property.details?.type as string) || 'Unknown',
                  furnished: (property.details?.furnished as string) || 'Unknown',
                  petsAllowed: (property.details?.petsAllowed as boolean) || false
                }}
                onCreateOffer={handleCreateOffer}
                onChatWithLandlord={handleChatWithLandlord}
                isOwner={isOwner}
                hasExistingOffer={hasExistingOffer}
                onEditListing={() => router.push(`/dashboard/properties/edit/${property.property_uuid}`)}
              />
            );
          })()}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Create Offer Modal */}
      <CreateOfferModal
        isOpen={isCreateOfferModalOpen}
        onClose={() => setIsCreateOfferModalOpen(false)}
        propertyId={property.property_uuid}
        currentPrice={property.price}
        recipientFirebaseUid={landlord?.firebase_uid}
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
                className=" absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
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
