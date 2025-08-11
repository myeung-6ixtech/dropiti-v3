'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { propertiesAPI, offersAPI } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { 
  MapPinIcon, 
  HomeIcon, 
  CalendarIcon,
  StarIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import {
  Wifi,
  AirConditioner,
  Lightning,
  Oven,
  WashingMachine,
  ParkingSign,
  Gym,
  SwimmingPool,
  SecurityGuard,
  Elevator,
  TV,
  Balcony,
  Home,
  Clean
} from '@/assets/icons';
import Footer from '@/components/common/Footer';
import CreateOfferModal from '@/components/common/CreateOfferModal';
import PropertyPricingCard from '@/components/common/PropertyPricingCard';
import { usersAPI } from '@/lib/api-client'; // Added import for usersAPI

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
  const [propertyData, setPropertyData] = useState<PropertyWithLandlord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOfferModalOpen, setIsCreateOfferModalOpen] = useState(false);
  const { user: authUser } = useAuth(); // Get user from context

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

      console.log('Creating offer with data:', offerData);
      console.log('Property ID:', propertyData.property.property_uuid);
      console.log('Landlord Firebase UID:', propertyData.landlord.firebase_uid);

      // Call the create-offer API
      const response = await offersAPI.createOffer({
        propertyId: propertyData.property.property_uuid,
        initiatorFirebaseUid: authUser.id,
        recipientFirebaseUid: propertyData.landlord.firebase_uid,
        proposingRentPrice: offerData.rentalPrice,
        numLeasingMonths: offerData.leaseDuration,
        paymentFrequency: offerData.paymentFrequency,
        moveInDate: offerData.moveInDate,
        currency: 'HKD', // Default to HKD
      });

      if (response.success) {
        alert(`Offer submitted successfully!\nOffer ID: ${response.data.offer_key}\nRental Price: ${offerData.rentalPrice} HKD\nLease Duration: ${offerData.leaseDuration} months\nPayment Frequency: ${offerData.paymentFrequency}\nMove-in Date: ${offerData.moveInDate}`);
        
        // Close the modal
        setIsCreateOfferModalOpen(false);
      } else {
        alert(`Failed to submit offer: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      alert(`Error creating offer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      'wifi': Wifi,
      'air-conditioning': AirConditioner,
      'heating': Lightning,
      'tv': TV,
      'dishwasher': Oven,
      'washer': WashingMachine,
      'dryer': WashingMachine,
      'parking': ParkingSign,
      'gym': Gym,
      'pool': SwimmingPool,
      'security': SecurityGuard,
      'elevator': Elevator,
      'balcony': Balcony,
      'workspace': Home,
      'phone': Home,
      'furnished': Home,
      'utilities-included': Lightning,
      'cleaning': Clean
    };
    
    return iconMap[amenity] || Home; // Use Home icon as default fallback
  };

  const getAmenityDisplayName = (amenityId: string) => {
    const amenityMap: { [key: string]: string } = {
      'wifi': 'WiFi',
      'air-conditioning': 'Air Conditioning',
      'heating': 'Heating',
      'tv': 'TV',
      'dishwasher': 'Dishwasher',
      'washer': 'Washing Machine',
      'dryer': 'Dryer',
      'parking': 'Parking',
      'gym': 'Gym',
      'pool': 'Swimming Pool',
      'security': 'Security System',
      'elevator': 'Elevator',
      'balcony': 'Balcony',
      'workspace': 'Workspace',
      'phone': 'Phone',
      'furnished': 'Furnished',
      'utilities-included': 'Utilities Included',
      'cleaning': 'Cleaning Service'
    };
    
    return amenityMap[amenityId] || amenityId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50">
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

  // Fallback image URL for when no images are available
  const fallbackImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

  // Get the main display image or fallback
  const mainImage = property.image_url || property.display_image || fallbackImage;

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div className="relative h-96 w-full rounded-xl overflow-hidden">
                <Image
                  src={mainImage}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {/* Assuming property.images is an array of URLs */}
                {/* This part of the mock data was removed, so we'll use a placeholder or remove if not available */}
                {/* For now, we'll just show a placeholder grid */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative h-20 w-full rounded-lg overflow-hidden bg-gray-200"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Images */}
            {property.uploaded_images && Array.isArray(property.uploaded_images) && property.uploaded_images.length > 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">More photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.uploaded_images.map((image, index) => (
                    <div key={index} className="relative h-32 w-full rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${property.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">More photos</h2>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No additional photos available</p>
                </div>
              </div>
            )}

            {/* Property Title and Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-1" />
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
                    <HomeIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold">{property.bedrooms}</span>
                  </div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <div className="h-4 w-4 text-gray-400">🛁</div>
                    <span className="font-semibold">{property.bathrooms}</span>
                  </div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
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
                        <AmenityIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Property type</span>
                  <p className="font-medium">{String(property.details?.type || 'Unknown')}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Furnished</span>
                  <p className="font-medium">{String(property.details?.furnished || 'Unknown')}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Pets allowed</span>
                  <p className="font-medium">{Boolean(property.details?.petsAllowed) ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Parking</span>
                  <p className="font-medium">{Boolean(property.details?.parking) ? 'Available' : 'Not available'}</p>
                </div>
              </div>
            </div>


          </div>

          {/* Right Column - Pricing and Actions */}
          {(() => {
            console.log('Rendering PropertyPricingCard with landlord:', landlord);
            return (
              <PropertyPricingCard
                price={property.price}
                deposit={0} // Assuming no deposit for now, as it's not in the mock data
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
    </div>
  );
}
