'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  MapPinIcon, 
  HomeIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  StarIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
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

// Mock property data - in real app, this would come from an API
const mockProperty = {
  id: '1',
  title: 'Modern 2BR Apartment in Central',
  description: 'Beautiful 2-bedroom apartment in the heart of downtown with stunning city views. This newly renovated unit features an open-concept living area, modern appliances, and premium finishes throughout. Perfect for young professionals or small families looking for a convenient and comfortable living space.',
  location: 'Downtown, City Center',
  bedrooms: 2,
  bathrooms: 2,
  price: 2500,
  imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
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

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(mockProperty);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [params.id]);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      setEditSection(null);
      // Show success message or redirect
      alert('Property updated successfully!');
    }, 1000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditSection(null);
    // Reset to original data
    setProperty(mockProperty);
  };

  const startEditing = (section: string) => {
    setIsEditing(true);
    setEditSection(section);
  };

  const stopEditing = () => {
    setIsEditing(false);
    setEditSection(null);
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Edit Property Listing</h1>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Listing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
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
              <div className="flex-1">
                {editSection === 'basic' && isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
                      <input
                        type="text"
                        value={property.title}
                        onChange={(e) => setProperty({...property, title: e.target.value})}
                        className="form-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={property.location}
                        onChange={(e) => setProperty({...property, location: e.target.value})}
                        className="form-input w-full"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                        <input
                          type="number"
                          value={property.bedrooms}
                          onChange={(e) => setProperty({...property, bedrooms: parseInt(e.target.value)})}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                        <input
                          type="number"
                          value={property.bathrooms}
                          onChange={(e) => setProperty({...property, bathrooms: parseInt(e.target.value)})}
                          className="form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min. Lease (months)</label>
                        <input
                          type="number"
                          value={property.minimumLease}
                          onChange={(e) => setProperty({...property, minimumLease: parseInt(e.target.value)})}
                          className="form-input w-full"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => stopEditing()}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => stopEditing()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
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
                    {isEditing && (
                      <button
                        onClick={() => startEditing('basic')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        Edit Basic Info
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">About this place</h2>
              {isEditing && (
                <button
                  onClick={() => startEditing('description')}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Edit
                </button>
              )}
            </div>
            {editSection === 'description' && isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={property.description}
                  onChange={(e) => setProperty({...property, description: e.target.value})}
                  rows={4}
                  className="form-textarea w-full"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => stopEditing()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => stopEditing()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            )}
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">What this place offers</h2>
              {isEditing && (
                <button
                  onClick={() => startEditing('amenities')}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Edit
                </button>
              )}
            </div>
            {editSection === 'amenities' && isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={true}
                        className="form-checkbox"
                      />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => stopEditing()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => stopEditing()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Property details</h2>
              {isEditing && (
                <button
                  onClick={() => startEditing('details')}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Edit
                </button>
              )}
            </div>
            {editSection === 'details' && isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property type</label>
                    <select
                      value={property.details.type}
                      onChange={(e) => setProperty({
                        ...property, 
                        details: {...property.details, type: e.target.value}
                      })}
                      className="form-select w-full"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Condo">Condo</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Furnished</label>
                    <select
                      value={property.details.furnished}
                      onChange={(e) => setProperty({
                        ...property, 
                        details: {...property.details, furnished: e.target.value}
                      })}
                      className="form-select w-full"
                    >
                      <option value="Fully Furnished">Fully Furnished</option>
                      <option value="Partially Furnished">Partially Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pets allowed</label>
                    <select
                      value={property.details.petsAllowed ? 'Yes' : 'No'}
                      onChange={(e) => setProperty({
                        ...property, 
                        details: {...property.details, petsAllowed: e.target.value === 'Yes'}
                      })}
                      className="form-select w-full"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
                    <select
                      value={property.details.parking ? 'Available' : 'Not available'}
                      onChange={(e) => setProperty({
                        ...property, 
                        details: {...property.details, parking: e.target.value === 'Available'}
                      })}
                      className="form-select w-full"
                    >
                      <option value="Available">Available</option>
                      <option value="Not available">Not available</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => stopEditing()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => stopEditing()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* House Rules */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">House rules</h2>
              {isEditing && (
                <button
                  onClick={() => startEditing('rules')}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Edit
                </button>
              )}
            </div>
            {editSection === 'rules' && isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {property.rules.map((rule, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => {
                          const newRules = [...property.rules];
                          newRules[index] = e.target.value;
                          setProperty({...property, rules: newRules});
                        }}
                        className="form-input flex-1"
                      />
                      <button
                        onClick={() => {
                          const newRules = property.rules.filter((_, i) => i !== index);
                          setProperty({...property, rules: newRules});
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setProperty({...property, rules: [...property.rules, '']});
                  }}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Add Rule
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => stopEditing()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => stopEditing()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {property.rules.map((rule) => (
                  <div key={rule} className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-700">{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
