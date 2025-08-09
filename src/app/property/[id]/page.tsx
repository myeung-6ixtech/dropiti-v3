'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  MapPinIcon, 
  HomeIcon, 
  CurrencyDollarIcon, 
  UserIcon,
  CalendarIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
  ShareIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Footer from '@/components/common/Footer';
import CreateOfferModal from '@/components/common/CreateOfferModal';
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
  availableDate: Date;
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
  available: true,
  landlordId: 'landlord1',
  createdAt: new Date(),
  updatedAt: new Date(),
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
  availableDate: new Date('2024-02-01'),
  minimumLease: 12,
  deposit: 2500,
  utilities: ['Electricity', 'Water', 'Internet', 'Trash'],
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(mockProperty);
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

  const handleOfferSubmit = (offerData: any) => {
    // Handle the offer submission here
    console.log('Offer submitted:', offerData);
    // You can add API call here to submit the offer
    alert(`Offer submitted successfully!\nRental Price: ${offerData.rentalPrice}\nLease Duration: ${offerData.leaseDuration} months\nPayment Frequency: ${offerData.paymentFrequency}\nMove-in Date: ${offerData.moveInDate}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
    }).format(amount);
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
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
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

            {/* Landlord Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hosted by {property.landlord.name}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Image
                      src={property.landlord.avatar}
                      alt={property.landlord.name}
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    {property.landlord.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                        <CheckCircleIcon className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{property.landlord.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{property.landlord.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{property.landlord.reviewCount} reviews</span>
                      <span>•</span>
                      <span>Responds within {property.landlord.responseTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <PhoneIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <EnvelopeIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing and Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Pricing Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(property.price)}
                    </span>
                    <span className="text-gray-600 ml-1">/month</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Available</p>
                    <p className="text-sm font-medium text-gray-900">
                      {property.availableDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Additional Costs */}
                <div className="space-y-2 py-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security deposit</span>
                    <span className="font-medium">{formatCurrency(property.deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilities</span>
                    <span className="font-medium">Included</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleCreateOffer}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Create Offer
                  </button>
                  <button
                    onClick={handleChatWithLandlord}
                    className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Chat with Landlord
                  </button>
                </div>

                {/* Contact Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center">
                    No booking fees • Secure payment
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Quick facts</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum lease:</span>
                    <span className="font-medium">{property.minimumLease} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Furnished:</span>
                    <span className="font-medium">{property.details.furnished}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pets:</span>
                    <span className="font-medium">{property.details.petsAllowed ? 'Allowed' : 'Not allowed'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
