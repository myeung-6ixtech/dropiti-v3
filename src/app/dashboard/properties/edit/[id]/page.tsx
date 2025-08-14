'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  MapPinIcon, 
  CalendarIcon,
  ArrowLeftIcon,
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
import { propertiesAPI } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';

interface PropertyData {
  id: string;
  property_uuid: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  image_url: string;
  available: boolean;
  created_at: string;
  updated_at: string;
  details: {
    type: string;
    furnished: boolean;
    petsAllowed: boolean;
    parking: boolean;
  };
  amenities: string[];
  minimum_lease: number;
  available_date: string | null;
  owner_id: string;
  rules?: string[]; // Add optional rules field
}

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await propertiesAPI.getPropertyByUuid(params.id as string);
      
      if (response.success && response.data?.property) {
        const propertyData = response.data.property;
        
        // Check if the current user owns this property
        if (authUser?.id && propertyData.owner_id !== authUser.id) {
          setError('You do not have permission to edit this property');
          return;
        }
        
        setProperty(propertyData);
      } else {
        setError('Failed to fetch property data');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to fetch property data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!property) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const updates = {
        title: property.title,
        description: property.description,
        location: property.location,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        amenities: property.amenities,
        minimumLease: property.minimum_lease,
        availableDate: property.available_date,
        rules: property.rules || [],
      };
      
      const response = await propertiesAPI.updateProperty(property.id, updates);
      
      if (response.success) {
        setIsEditing(false);
        setEditSection(null);
        // Refresh the property data
        await fetchProperty();
        alert('Property updated successfully!');
      } else {
        setError('Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      setError('Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditSection(null);
    // Reset to original data
    if (property) {
      fetchProperty();
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Property Not Found</h2>
            <p className="text-yellow-700 mb-4">The property you're looking for could not be found.</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Go Back
            </button>
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
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
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
                src={property.image_url}
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {/* Assuming property.images is an array of URLs */}
              {/* For now, we'll use the single image_url */}
              <button
                key={0}
                onClick={() => setSelectedImage(0)}
                className={`relative h-20 w-full rounded-lg overflow-hidden ${
                  selectedImage === 0 ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <Image
                  src={property.image_url}
                  alt="Property image 1"
                  fill
                  className="object-cover"
                />
              </button>
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
                          value={property.minimum_lease}
                          onChange={(e) => setProperty({...property, minimum_lease: parseInt(e.target.value)})}
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
                          {/* HomeIcon is not imported, so using a placeholder */}
                          <span className="font-semibold">{property.bedrooms}</span>
                        </div>
                        <p className="text-sm text-gray-500">Bedrooms</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Using a placeholder for bathroom icon */}
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
                        checked={true} // Assuming all amenities are checked for editing
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
                      value={property.details.furnished ? 'Yes' : 'No'}
                      onChange={(e) => setProperty({
                        ...property, 
                        details: {...property.details, furnished: e.target.value === 'Yes'}
                      })}
                      className="form-select w-full"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
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
                  <p className="font-medium">{property.details.furnished ? 'Yes' : 'No'}</p>
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
                  {property.rules?.map((rule, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => {
                          const newRules = [...(property.rules || [])];
                          newRules[index] = e.target.value;
                          setProperty({...property, rules: newRules});
                        }}
                        className="form-input flex-1"
                      />
                      <button
                        onClick={() => {
                          const newRules = property.rules?.filter((_, i) => i !== index) || [];
                          setProperty({...property, rules: newRules});
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newRules = [...(property.rules || []), ''];
                      setProperty({...property, rules: newRules});
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Add Rule
                  </button>
                  <div className="flex space-x-2 pt-4">
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
              </div>
            ) : (
              <div className="space-y-2">
                {(property.rules || []).map((rule) => (
                  <div key={rule} className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">{rule}</span>
                  </div>
                ))}
                {(!property.rules || property.rules.length === 0) && (
                  <p className="text-sm text-gray-500">No rules specified</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
