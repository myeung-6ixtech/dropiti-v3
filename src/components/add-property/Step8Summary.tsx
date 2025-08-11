'use client';

import Image from 'next/image';
import { 
  CheckCircleIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

interface Step8SummaryProps {
  data?: {
    propertyType?: string;
    residentialType?: string;
    rentalSpace?: string;
    address?: {
      unit?: string;
      floor?: string;
      buildingName?: string;
      addressLine1?: string;
      district?: string;
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
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function Step8Summary({ data, onSubmit, isSubmitting = false }: Step8SummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getPropertyTypeDisplay = () => {
    if (data?.propertyType === 'residential') {
      const types: Record<string, string> = {
        'serviced-apartment': 'Serviced Apartment',
        'village-house': 'Village House',
        'apartment': 'Apartment',
        'condo': 'Condominium',
      };
      return types[data.residentialType || ''] || 'Residential';
    }
    return data?.propertyType || 'Not specified';
  };

  const getRentalSpaceDisplay = () => {
    const types: Record<string, string> = {
      'entire-apartment': 'Entire Apartment',
      'partial-apartment': 'Partial Apartment',
      'shared-space': 'Shared Space',
      'private-room': 'Private Room',
    };
    return types[data?.rentalSpace || ''] || 'Not specified';
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Review your property listing
        </h3>
        <p className="text-gray-600 mb-6">
          Please review all the information before submitting your property listing. You can go back to any step to make changes.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Type */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <HomeIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Property Type</h4>
            </div>
            <p className="text-gray-600">{getPropertyTypeDisplay()}</p>
            {data?.rentalSpace && (
              <p className="text-gray-500 text-sm mt-1">Space: {getRentalSpaceDisplay()}</p>
            )}
          </div>

          {/* Address */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <MapPinIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Address</h4>
            </div>
            {data?.address ? (
              <div className="text-gray-600 text-sm space-y-1">
                {data.address.unit && <p>Unit {data.address.unit}</p>}
                {data.address.floor && <p>Floor {data.address.floor}</p>}
                {data.address.buildingName && <p>{data.address.buildingName}</p>}
                {data.address.addressLine1 && <p>{data.address.addressLine1}</p>}
                {data.address.district && <p>{data.address.district}</p>}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Address not specified</p>
            )}
          </div>

          {/* Unit Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <HomeIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Unit Details</h4>
            </div>
            {data?.unitDetails ? (
              <div className="text-gray-600 text-sm space-y-1">
                {data.unitDetails.bedrooms !== undefined && (
                  <p>Bedrooms: {data.unitDetails.bedrooms === 0 ? 'Studio' : data.unitDetails.bedrooms}</p>
                )}
                {data.unitDetails.bathrooms && <p>Bathrooms: {data.unitDetails.bathrooms}</p>}
                {data.unitDetails.grossArea && <p>Gross Area: {data.unitDetails.grossArea} sq ft</p>}
                {data.unitDetails.furnished && (
                  <p>Furnished: {data.unitDetails.furnished.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                )}
                {data.unitDetails.petsAllowed !== undefined && (
                  <p>Pets: {data.unitDetails.petsAllowed ? 'Allowed' : 'Not allowed'}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Unit details not specified</p>
            )}
          </div>

          {/* Rental Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Rental Details</h4>
            </div>
            {data?.rentalDetails ? (
              <div className="text-gray-600 text-sm space-y-1">
                {data.rentalDetails.listingName && <p className="font-medium">{data.rentalDetails.listingName}</p>}
                {data.rentalDetails.rentalPrice && (
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(data.rentalDetails.rentalPrice)}/month
                  </p>
                )}
                {data.rentalDetails.availableDate && (
                  <p>Available: {(() => {
                    try {
                      const date = new Date(data.rentalDetails.availableDate);
                      if (isNaN(date.getTime())) return 'Invalid date';
                      return date.toLocaleDateString();
                    } catch {
                      return 'Invalid date';
                    }
                  })()}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Rental details not specified</p>
            )}
          </div>
        </div>

        {/* Amenities */}
        {data?.amenities && data.amenities.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <WifiIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Amenities ({data.amenities.length})</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.amenities.map((amenityId: string) => (
                <span
                  key={amenityId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {amenityId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {data?.photos && data.photos.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <PhotoIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Photos ({data.photos.length})</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.photos.slice(0, 4).map((photo: File, index: number) => (
                <div key={index} className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    width={200}
                    height={113}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {data.photos.length > 4 && (
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-sm">+{data.photos.length - 4} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description Preview */}
        {data?.rentalDetails?.listingDescription && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Description</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {data.rentalDetails.listingDescription}
            </p>
          </div>
        )}
      </div>

      {/* Submission */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">
              Ready to submit your listing?
            </h4>
            <p className="text-blue-700 text-sm">
              By submitting this listing, you agree to our terms of service and confirm that all information provided is accurate and truthful.
            </p>
          </div>
        </div>
        
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="mt-4 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Property Listing'
          )}
        </button>
      </div>
    </div>
  );
}
