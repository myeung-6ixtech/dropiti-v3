'use client';

import { useState } from 'react';
import { 
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import PropertyCard from '@/components/PropertyCard';

interface Step7RentalDetailsProps {
  data?: {
    propertyType?: string;
    residentialType?: string;
    rentalSpace?: string;
    address?: {
      unit?: string;
      floor?: string;
      block?: string;
      buildingName?: string;
      addressLine1?: string;
      addressLine2?: string;
      district?: string;
      state?: string;
      country?: string;
    };
    unitDetails?: {
      grossArea?: number;
      netArea?: number;
      bedrooms?: number;
      bathrooms?: number;
      furnished?: string;
      petsAllowed?: boolean;
    };
    amenities?: string[];
    photos?: File[];
    rentalDetails?: {
      listingName?: string;
      listingDescription?: string;
      rentalPrice?: number;
      availableDate?: Date | string | null;
    };
  };
  onUpdate: (data: { rentalDetails?: {
    listingName?: string;
    listingDescription?: string;
    rentalPrice?: number;
    availableDate?: Date | string | null;
  } }) => void;
}

export default function Step7RentalDetails({ data, onUpdate }: Step7RentalDetailsProps) {
  const [rentalDetails, setRentalDetails] = useState(data?.rentalDetails || {
    listingName: '',
    listingDescription: '',
    rentalPrice: undefined,
    availableDate: undefined,
  });

  const handleInputChange = (field: string, value: string | number | Date | null | undefined) => {
    const updatedRentalDetails = { ...rentalDetails, [field]: value };
    setRentalDetails(updatedRentalDetails);
    onUpdate({ rentalDetails: updatedRentalDetails });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Create a mock property object for the PropertyCard preview
  const createPreviewProperty = () => {
    const address = data?.address;
    const location = address ? [
      address.unit && `Unit ${address.unit}`,
      address.floor && `Floor ${address.floor}`,
      address.block && address.block,
      address.buildingName,
      address.addressLine1,
      address.addressLine2,
      address.district,
      address.state,
      address.country
    ].filter(Boolean).join(', ') : 'Location not specified';

    return {
      id: 'preview',
      property_uuid: 'preview-uuid',
      title: rentalDetails.listingName || 'Your Property Listing',
      description: rentalDetails.listingDescription || 'Beautiful property in a great location',
      location: location,
      price: rentalDetails.rentalPrice || 0,
      bedrooms: data?.unitDetails?.bedrooms || 0,
      bathrooms: data?.unitDetails?.bathrooms || 0,
      imageUrl: data?.photos && data.photos.length > 0 
        ? URL.createObjectURL(data.photos[0]) 
        : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      details: {
        type: data?.propertyType || 'residential',
        furnished: data?.unitDetails?.furnished || 'non-furnished',
        petsAllowed: data?.unitDetails?.petsAllowed || false,
        parking: false,
      },
      rules: [],
      amenities: data?.amenities || [],
      minimumLease: 12,
      availableDate: rentalDetails.availableDate ? 
        (typeof rentalDetails.availableDate === 'string' ? 
          rentalDetails.availableDate : 
          rentalDetails.availableDate.toISOString()
        ) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: 'preview-owner',
    };
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Final details and preview
        </h3>
        <p className="text-gray-600 mb-6">
          Add the final details for your listing and see how it will appear to potential tenants.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Rental Details Form */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Rental Details</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="form-label">
                    Listing Name *
                  </label>
                  <input
                    type="text"
                    value={rentalDetails.listingName || ''}
                    onChange={(e) => handleInputChange('listingName', e.target.value)}
                    placeholder="e.g., Modern 2BR Apartment in Central"
                    className="form-input"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Create an attractive title for your listing (max 100 characters)
                  </p>
                </div>

                <div>
                  <label className="form-label">
                    Description
                  </label>
                  <textarea
                    value={rentalDetails.listingDescription || ''}
                    onChange={(e) => handleInputChange('listingDescription', e.target.value)}
                    placeholder="Describe your property, its features, and what makes it special..."
                    className="form-textarea"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="form-label">
                    Monthly Rental Price (HKD) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={rentalDetails.rentalPrice || ''}
                      onChange={(e) => handleInputChange('rentalPrice', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 25000"
                      className="form-input pl-10"
                      required
                    />
                  </div>
                  {rentalDetails.rentalPrice && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(rentalDetails.rentalPrice)} per month
                    </p>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    Available Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={rentalDetails.availableDate ? 
                        (typeof rentalDetails.availableDate === 'string' ? 
                          rentalDetails.availableDate.split('T')[0] : 
                          rentalDetails.availableDate.toISOString().split('T')[0]
                        ) : ''
                      }
                      onChange={(e) => handleInputChange('availableDate', e.target.value)}
                      className="form-input pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - PropertyCard Preview */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Preview</h4>
              <p className="text-sm text-gray-600 mb-4">
                This is how your listing will appear to potential tenants
              </p>
              
              <div className="transform scale-90 origin-top-left">
                <PropertyCard property={createPreviewProperty()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
