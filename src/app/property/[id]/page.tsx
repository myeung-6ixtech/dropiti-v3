'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
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
  Elevator
} from '@/assets/icons';
import Footer from '@/components/common/Footer';
import CreateOfferModal from '@/components/common/CreateOfferModal';
import PropertyPricingCard from '@/components/common/PropertyPricingCard';
import { Property } from '@/types';

// Mock property data - in real app, this would come from an API
const mockProperty: Property & {
  images: string[];
  amenities: string[];
  landlord: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    responseTime: string;
    verified: boolean;
  };
  details: {
    type: string;
    furnished: string;
    petsAllowed: boolean;
    parking: boolean;
    laundry: boolean;
    heating: boolean;
    cooling: boolean;
    wifi: boolean;
    security: boolean;
    elevator: boolean;
    balcony: boolean;
    gym: boolean;
    pool: boolean;
  };
  description: string;
  rules: string[];
  availableDate: string | null;
  minimumLease: number;
  deposit: number;
  utilities: string[];
} = {
  id: '1',
  title: 'Modern 2BR Apartment in Central',
  description: 'Beautiful 2-bedroom apartment in the heart of downtown with stunning city views. This newly renovated unit features an open-concept living area, modern appliances, and premium finishes throughout. Perfect for young professionals or small families looking for a convenient and comfortable living space.',
  location: 'Downtown, City Center',
  bedrooms: 2,
  bathrooms: 2,
  price: 2500,
  imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',

  ownerId: 'landlord1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  images: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  ],
  amenities: [
    'WiFi', 'Air Conditioning', 'Heating', 'Dishwasher', 'Washing Machine', 
    'Dryer', 'Parking', 'Gym', 'Pool', 'Security System', 'Elevator'
  ],
  landlord: {
    id: 'landlord1',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    rating: 4.8,
    reviewCount: 127,
    responseTime: '1 hour',
    verified: true,
  },
  details: {
    type: 'Apartment',
    furnished: 'Fully Furnished',
    petsAllowed: true,
    parking: true,
    laundry: true,
    heating: true,
    cooling: true,
    wifi: true,
    security: true,
    elevator: true,
    balcony: true,
    gym: true,
    pool: true,
  },
  rules: [
    'No smoking',
    'No parties or events',
    'Quiet hours after 10 PM',
    'Pet deposit required',
    'Maximum 2 occupants',
  ],
  availableDate: new Date('2024-02-01').toISOString(),
  minimumLease: 12,
  deposit: 2500,
  utilities: ['Electricity', 'Water', 'Internet', 'Trash'],
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property] = useState(mockProperty);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOfferModalOpen, setIsCreateOfferModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [params.id]);

  const handleCreateOffer = () => {
    setIsCreateOfferModalOpen(true);
  };

  const handleChatWithLandlord = () => {
    // Navigate to chat page
    router.push(`/dashboard/chat?landlord=${property.landlord.id}`);
  };

  const handleOfferSubmit = (offerData: {
    rentalPrice: number;
    leaseDuration: number;
    paymentFrequency: string;
    moveInDate: string;
  }) => {
    // Handle the offer submission here
    console.log('Offer submitted:', offerData);
    // You can add API call here to submit the offer
    alert(`Offer submitted successfully!\nRental Price: ${offerData.rentalPrice}\nLease Duration: ${offerData.leaseDuration} months\nPayment Frequency: ${offerData.paymentFrequency}\nMove-in Date: ${offerData.moveInDate}`);
  };

//   const yarn = (amount: number) => {
//     return new Intl.NumberFormat('en-HK', {
//       style: 'currency',
//       currency: 'HKD',
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      'WiFi': Wifi,
      'Air Conditioning': AirConditioner,
      'Heating': Lightning,
      'Dishwasher': Oven,
      'Washing Machine': WashingMachine,
      'Dryer': WashingMachine,
      'Parking': ParkingSign,
      'Gym': Gym,
      'Pool': SwimmingPool,
      'Security System': SecurityGuard,
      'Elevator': Elevator
    };
    
    return iconMap[amenity] || null;
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
                  src={property.images[selectedImage]}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-full rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Property image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

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
                    <span className="font-semibold">{property.minimumLease}</span>
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
                {property.amenities.map((amenity) => {
                  const AmenityIcon = getAmenityIcon(amenity);
                  return (
                    <div key={amenity} className="flex items-center space-x-3">
                      {AmenityIcon ? (
                        <AmenityIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 bg-gray-300 rounded-full flex-shrink-0" />
                      )}
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Property type</span>
                  <p className="font-medium">{property.details.type}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Furnished</span>
                  <p className="font-medium">{property.details.furnished}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Pets allowed</span>
                  <p className="font-medium">{property.details.petsAllowed ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Parking</span>
                  <p className="font-medium">{property.details.parking ? 'Available' : 'Not available'}</p>
                </div>
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">House rules</h2>
              <div className="space-y-2">
                {property.rules.map((rule) => (
                  <div key={rule} className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-700">{rule}</span>
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* Right Column - Pricing and Actions */}
          <PropertyPricingCard
            price={property.price}
            deposit={property.deposit}
            availableDate={property.availableDate}
            minimumLease={property.minimumLease}
            landlord={property.landlord}
            details={{
              type: property.details.type,
              furnished: property.details.furnished,
              petsAllowed: property.details.petsAllowed
            }}
            onCreateOffer={handleCreateOffer}
            onChatWithLandlord={handleChatWithLandlord}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Create Offer Modal */}
      <CreateOfferModal
        isOpen={isCreateOfferModalOpen}
        onClose={() => setIsCreateOfferModalOpen(false)}
        propertyId={Array.isArray(params.id) ? params.id[0] : params.id}
        currentPrice={property.price}
        onOfferSubmit={handleOfferSubmit}
      />
    </div>
  );
}
