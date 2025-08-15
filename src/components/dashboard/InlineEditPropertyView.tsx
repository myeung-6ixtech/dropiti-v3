'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { propertiesAPI } from '@/lib/api-client';
import { PropertyData } from '@/types/property';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { BasicInfoSection } from './property-sections/BasicInfoSection';
import { LocationSection } from './property-sections/LocationSection';
import { PropertyDetailsSection } from './property-sections/PropertyDetailsSection';
import { AmenitiesSection } from './property-sections/AmenitiesSection';
import { RentalInfoSection } from './property-sections/RentalInfoSection';
import { PhotosSection } from './property-sections/PhotosSection';

interface InlineEditPropertyViewProps {
  propertyId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function InlineEditPropertyView({ propertyId, onSave, onCancel }: InlineEditPropertyViewProps) {
  const [propertyData, setPropertyData] = useState<PropertyData>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tempData, setTempData] = useState<Partial<PropertyData>>({});
  const [originalData, setOriginalData] = useState<PropertyData>({});
  const router = useRouter();

  // Load existing property data
  const loadPropertyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await propertiesAPI.getPropertyByUuid(propertyId);
      if (response.success && response.data?.property) {
        const transformedData = transformApiDataToPropertyData(response.data.property);
        setPropertyData(transformedData);
        setTempData(transformedData);
        setOriginalData(transformedData);
      }
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadPropertyData();
  }, [loadPropertyData]);

  const transformApiDataToPropertyData = (apiProperty: Record<string, unknown>): PropertyData => {
    // Transform API property data to PropertyData format
    return {
      propertyType: ((apiProperty.details as Record<string, unknown>)?.propertyType as string) === 'residential' ? 'residential' : 'commercial',
      residentialType: ((apiProperty.details as Record<string, unknown>)?.residentialType as string) === 'serviced-apartment' ? 'serviced-apartment' : 
                      ((apiProperty.details as Record<string, unknown>)?.residentialType as string) === 'village-house' ? 'village-house' :
                      ((apiProperty.details as Record<string, unknown>)?.residentialType as string) === 'condo' ? 'condo' : 'apartment',
      rentalSpace: ((apiProperty.details as Record<string, unknown>)?.rentalSpace as string) === 'partial-apartment' ? 'partial-apartment' :
                   ((apiProperty.details as Record<string, unknown>)?.rentalSpace as string) === 'shared-space' ? 'shared-space' :
                   ((apiProperty.details as Record<string, unknown>)?.rentalSpace as string) === 'private-room' ? 'private-room' : 'entire-apartment',
      address: {
        unit: (apiProperty.details as Record<string, unknown>)?.unit as string || '',
        floor: (apiProperty.details as Record<string, unknown>)?.floor as string || '',
        block: (apiProperty.details as Record<string, unknown>)?.block as string || '',
        buildingName: (apiProperty.details as Record<string, unknown>)?.buildingName as string || '',
        addressLine1: (apiProperty.address as Record<string, unknown>)?.addressLine1 as string || (apiProperty.address as Record<string, unknown>)?.street as string || '',
        addressLine2: (apiProperty.address as Record<string, unknown>)?.addressLine2 as string || '',
        district: (apiProperty.address as Record<string, unknown>)?.district as string || (apiProperty.address as Record<string, unknown>)?.city as string || '',
        state: (apiProperty.address as Record<string, unknown>)?.state as string || '',
        country: (apiProperty.address as Record<string, unknown>)?.country as string || '',
        showSpecificLocation: (apiProperty.address as Record<string, unknown>)?.showSpecificLocation as boolean || false,
      },
      unitDetails: {
        grossArea: (apiProperty.details as Record<string, unknown>)?.grossArea as number || 0,
        netArea: (apiProperty.details as Record<string, unknown>)?.netArea as number || 0,
        bedrooms: apiProperty.bedrooms as number || 0,
        bathrooms: apiProperty.bathrooms as number || 0,
        furnished: ((apiProperty.details as Record<string, unknown>)?.furnished as string) === 'fully' ? 'fully' :
                   ((apiProperty.details as Record<string, unknown>)?.furnished as string) === 'partially' ? 'partially' : 'non-furnished',
        petsAllowed: (apiProperty.details as Record<string, unknown>)?.petsAllowed as boolean || false,
      },
      amenities: apiProperty.amenities as string[] || [],
      photos: [], // Initialize as empty array since we can't convert strings to Files
      rentalDetails: {
        listingName: apiProperty.title as string || '',
        listingDescription: apiProperty.description as string || '',
        rentalPrice: apiProperty.price as number || 0,
        availableDate: apiProperty.availableDate as string || null,
      },
    };
  };

  const startEditing = (section: string) => {
    setEditingSection(section);
    setTempData(propertyData);
    setErrors({});
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setTempData(originalData);
    setErrors({});
  };

  const saveSection = async (section: string) => {
    try {
      setIsSaving(true);
      
      // Update the main property data
      const updatedData = { ...propertyData, ...tempData };
      setPropertyData(updatedData);
      
      // Transform back to API format and save
      const apiData = transformPropertyDataToApi(updatedData);
      const response = await propertiesAPI.updateProperty(propertyId, apiData);
      
      if (response.success) {
        setEditingSection(null);
        setErrors({});
        setOriginalData(updatedData);
        onSave?.();
      } else {
        throw new Error(response.error || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      setErrors({ [section]: 'Failed to update. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const transformPropertyDataToApi = (propertyData: PropertyData) => {
    // Transform PropertyData back to API format
    return {
      title: propertyData.rentalDetails?.listingName || 'Property Listing',
      description: propertyData.rentalDetails?.listingDescription || 'Property description',
      location: buildLocationString(propertyData.address),
      price: propertyData.rentalDetails?.rentalPrice || 0,
      bedrooms: propertyData.unitDetails?.bedrooms || 0,
      bathrooms: propertyData.unitDetails?.bathrooms || 0,
      details: {
        propertyType: propertyData.propertyType,
        residentialType: propertyData.residentialType,
        rentalSpace: propertyData.rentalSpace,
        unit: propertyData.address?.unit,
        floor: propertyData.address?.floor,
        block: propertyData.address?.block,
        buildingName: propertyData.address?.buildingName,
        grossArea: propertyData.unitDetails?.grossArea,
        netArea: propertyData.unitDetails?.netArea,
        furnished: propertyData.unitDetails?.furnished,
        petsAllowed: propertyData.unitDetails?.petsAllowed,
        photoUrls: propertyData.photos,
      },
      amenities: propertyData.amenities || [],
      minimumLease: 12,
      availableDate: propertyData.rentalDetails?.availableDate 
        ? new Date(propertyData.rentalDetails.availableDate).toISOString()
        : null,
    };
  };

  const buildLocationString = (address: PropertyData['address']) => {
    if (!address) return '';
    const parts = [];
    if (address.buildingName) parts.push(address.buildingName);
    if (address.addressLine1) parts.push(address.addressLine1);
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.district) parts.push(address.district);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);
    return parts.join(', ');
  };

  const updateTempField = (section: string, field: string, value: unknown) => {
    setTempData(prev => {
      const currentSection = prev[section as keyof PropertyData];
      const sectionData = typeof currentSection === 'object' && currentSection !== null ? currentSection : {};
      
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
    });
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
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave?.()}
                className="btn-primary"
              >
                Done Editing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Display with Inline Editing */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Basic Information Section */}
          <BasicInfoSection
            data={propertyData}
            tempData={tempData}
            isEditing={editingSection === 'basic'}
            onStartEdit={() => startEditing('basic')}
            onCancelEdit={cancelEditing}
            onSaveEdit={() => saveSection('basic')}
            onUpdateField={updateTempField}
            errors={errors}
            isSaving={isSaving}
          />

          {/* Location Section */}
          <LocationSection
            data={propertyData}
            tempData={tempData}
            isEditing={editingSection === 'location'}
            onStartEdit={() => startEditing('location')}
            onCancelEdit={cancelEditing}
            onSaveEdit={() => saveSection('location')}
            onUpdateField={updateTempField}
            errors={errors}
            isSaving={isSaving}
          />

          {/* Property Details Section */}
          <PropertyDetailsSection
            data={propertyData}
            tempData={tempData}
            isEditing={editingSection === 'details'}
            onStartEdit={() => startEditing('details')}
            onCancelEdit={cancelEditing}
            onSaveEdit={() => saveSection('details')}
            onUpdateField={updateTempField}
            errors={errors}
            isSaving={isSaving}
          />

          {/* Amenities Section */}
          <AmenitiesSection
            data={propertyData}
            tempData={tempData}
            isEditing={editingSection === 'amenities'}
            onStartEdit={() => startEditing('amenities')}
            onCancelEdit={cancelEditing}
            onSaveEdit={() => saveSection('amenities')}
            onUpdateField={updateTempField}
            errors={errors}
            isSaving={isSaving}
          />

          {/* Rental Information Section */}
          <RentalInfoSection
            data={propertyData}
            tempData={tempData}
            isEditing={editingSection === 'rental'}
            onStartEdit={() => startEditing('rental')}
            onCancelEdit={cancelEditing}
            onSaveEdit={() => saveSection('rental')}
            onUpdateField={updateTempField}
            errors={errors}
            isSaving={isSaving}
          />

          {/* Photos Section */}
          <PhotosSection
            data={propertyData}
            tempData={tempData}
            isEditing={editingSection === 'photos'}
            onStartEdit={() => startEditing('photos')}
            onCancelEdit={cancelEditing}
            onSaveEdit={() => saveSection('photos')}
            onUpdateField={updateTempField}
            errors={errors}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
