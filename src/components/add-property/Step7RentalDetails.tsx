'use client';

import { useState } from 'react';
import { 
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Step7RentalDetailsProps {
  data?: {
    rentalDetails?: {
      listingName?: string;
      listingDescription?: string;
      rentalPrice?: number;
      availableDate?: Date | string | null;
    };
  };
  onUpdate: (data: any) => void;
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

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Basic rental details
        </h3>
        <p className="text-gray-600 mb-6">
          Provide essential information about your rental listing that will help tenants understand your property.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Listing Name */}
          <div className="md:col-span-2">
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

          {/* Rental Price */}
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

          {/* Available Date */}
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
                value={(() => {
                  if (!rentalDetails.availableDate) return '';
                  try {
                    const date = new Date(rentalDetails.availableDate);
                    if (isNaN(date.getTime())) return '';
                    return date.toISOString().split('T')[0];
                  } catch {
                    return '';
                  }
                })()}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue && dateValue.trim()) {
                    try {
                      const date = new Date(dateValue);
                      if (!isNaN(date.getTime())) {
                        handleInputChange('availableDate', date);
                      } else {
                        handleInputChange('availableDate', null);
                      }
                    } catch (error) {
                      console.error('Invalid date:', dateValue);
                      handleInputChange('availableDate', null);
                    }
                  } else {
                    handleInputChange('availableDate', null);
                  }
                }}
                className="form-input pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              When will the property be available for rent?
            </p>
          </div>
        </div>

        {/* Listing Description */}
        <div>
          <label className="form-label">
            Listing Description *
          </label>
          <textarea
            value={rentalDetails.listingDescription || ''}
            onChange={(e) => handleInputChange('listingDescription', e.target.value)}
            placeholder="Describe your property, its features, location, and what makes it special..."
            rows={6}
            className="form-textarea"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide a detailed description of your property (max 1000 characters)
          </p>
        </div>
      </div>

      {/* Preview Card */}
      {(rentalDetails.listingName || rentalDetails.rentalPrice || rentalDetails.availableDate) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Listing Preview</h4>
          <div className="space-y-3">
            {rentalDetails.listingName && (
              <div>
                <span className="text-sm font-medium text-gray-500">Title:</span>
                <p className="text-gray-900">{rentalDetails.listingName}</p>
              </div>
            )}
            {rentalDetails.rentalPrice && (
              <div>
                <span className="text-sm font-medium text-gray-500">Price:</span>
                <p className="text-gray-900 font-semibold">{formatCurrency(rentalDetails.rentalPrice)}/month</p>
              </div>
            )}
            {rentalDetails.availableDate && (
              <div>
                <span className="text-sm font-medium text-gray-500">Available:</span>
                <p className="text-gray-900">
                  {(() => {
                    try {
                      const date = new Date(rentalDetails.availableDate);
                      if (isNaN(date.getTime())) return 'Invalid date';
                      return date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    } catch {
                      return 'Invalid date';
                    }
                  })()}
                </p>
              </div>
            )}
            {rentalDetails.listingDescription && (
              <div>
                <span className="text-sm font-medium text-gray-500">Description:</span>
                <p className="text-gray-900 text-sm line-clamp-3">{rentalDetails.listingDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Tips for a Great Listing</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use a clear, descriptive title that highlights key features</li>
          <li>• Set a competitive price based on similar properties in your area</li>
          <li>• Provide a detailed description that covers all important aspects</li>
          <li>• Be honest about availability dates and any restrictions</li>
          <li>• Highlight unique features or amenities that set your property apart</li>
        </ul>
      </div>
    </div>
  );
}
