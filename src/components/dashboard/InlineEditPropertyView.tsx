'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { propertiesAPI } from '@/lib/api-client';
import { PropertyData, PROPERTY_TYPE, RESIDENTIAL_TYPE, PropertyTypeValue, ResidentialTypeValue } from '@/types/property';
import { formatAddressForDatabase } from '@/utils/addressFormatter';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/context/ToastContext';
import { BasicInfoSection } from './property-sections/BasicInfoSection';
import { LocationSection } from './property-sections/LocationSection';
import { PropertyDetailsSection } from './property-sections/PropertyDetailsSection';
import { AmenitiesSection } from './property-sections/AmenitiesSection';
import { RentalInfoSection } from './property-sections/RentalInfoSection';
import { PhotosSection } from './property-sections/PhotosSection';

interface InlineEditPropertyViewProps {
  propertyId: string;
  onSave?: () => void;
}

export default function InlineEditPropertyView({ propertyId, onSave }: InlineEditPropertyViewProps) {
  const [propertyData, setPropertyData] = useState<PropertyData>({});
  const propertyDataRef = useRef<PropertyData>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tempData, setTempData] = useState<Partial<PropertyData>>({});
  const [originalData, setOriginalData] = useState<PropertyData>({});
  const router = useRouter();
  const { showToast } = useToast();

  const normalizeAmenities = useCallback((amenities: unknown): string[] => {
    if (Array.isArray(amenities)) {
      return amenities;
    } else if (amenities && typeof amenities === 'string') {
      return [amenities];
    } else if (amenities && typeof amenities === 'object') {
      return Object.values(amenities).filter(val => typeof val === 'string') as string[];
    }
    return [];
  }, []);

  const transformApiDataToPropertyData = useCallback((apiProperty: Record<string, unknown>): PropertyData => {
    // Transform API property data to PropertyData format
    return {
      propertyType: ((apiProperty.details as Record<string, unknown>)?.propertyType as PropertyTypeValue) || PROPERTY_TYPE.RESIDENTIAL,
      residentialType: ((apiProperty.details as Record<string, unknown>)?.residentialType as ResidentialTypeValue) || RESIDENTIAL_TYPE.APARTMENT,
      rentalSpace: ((apiProperty.details as Record<string, unknown>)?.rentalSpace as string) === 'partial-apartment' ? 'partial-apartment' :
                   ((apiProperty.details as Record<string, unknown>)?.rentalSpace as string) === 'shared-space' ? 'shared-space' :
                   ((apiProperty.details as Record<string, unknown>)?.rentalSpace as string) === 'private-room' ? 'private-room' : 'entire-apartment',
      address: {
        unit: (apiProperty.details as Record<string, unknown>)?.unit as string || '',
        floor: (apiProperty.details as Record<string, unknown>)?.floor as string || '',
        block: (apiProperty.details as Record<string, unknown>)?.block as string || '',
        building: (apiProperty.address as Record<string, unknown>)?.building as string || (apiProperty.details as Record<string, unknown>)?.buildingName as string || '',
        addressLine1: (apiProperty.address as Record<string, unknown>)?.addressLine1 as string || '',
        addressLine2: (apiProperty.address as Record<string, unknown>)?.addressLine2 as string || '',
        district: (apiProperty.address as Record<string, unknown>)?.district as string || '',
        state: (apiProperty.address as Record<string, unknown>)?.state as string || '',
        country: (apiProperty.address as Record<string, unknown>)?.country as string || '',
        city: (apiProperty.address as Record<string, unknown>)?.city as string || (apiProperty.address as Record<string, unknown>)?.district as string || '',
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
      amenities: normalizeAmenities(apiProperty.amenities),
      photos: [], // Initialize as empty array since we can't convert strings to Files
      displayImage: apiProperty.display_image as string || '',
      uploadedImages: apiProperty.uploaded_images as string[] || [],
      rentalDetails: {
        listingName: apiProperty.title as string || '',
        listingDescription: apiProperty.description as string || '',
        rentalPrice: apiProperty.price as number || 0,
        availableDate: apiProperty.availableDate as string || null,
      },
      status: apiProperty.status as 'draft' | 'published' | 'archived' | 'expired' || 'draft',
    };
  }, [normalizeAmenities]);

  // Load existing property data
  const loadPropertyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await propertiesAPI.getPropertyByUuid(propertyId);
      if (response.success && response.data?.property) {
        const transformedData = transformApiDataToPropertyData(response.data.property);
        setPropertyData(transformedData);
        propertyDataRef.current = transformedData; // Initialize ref
        setTempData(transformedData);
        setOriginalData(transformedData);
      }
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, transformApiDataToPropertyData]);

  useEffect(() => {
    loadPropertyData();
  }, [loadPropertyData]);

  const startEditing = (section: string) => {
    console.log('InlineEditPropertyView: startEditing called for section:', section);
    console.log('InlineEditPropertyView: propertyData before setting tempData:', propertyData);
    
    // Ensure amenities is always an array when starting to edit and set proper defaults
    const normalizedPropertyData = {
      ...propertyData,
      propertyType: propertyData.propertyType || PROPERTY_TYPE.RESIDENTIAL,
      residentialType: propertyData.residentialType || RESIDENTIAL_TYPE.APARTMENT,
      rentalSpace: propertyData.rentalSpace || 'entire-apartment',
      amenities: normalizeAmenities(propertyData.amenities)
    };
    
    console.log('InlineEditPropertyView: normalizedPropertyData:', normalizedPropertyData);
    setEditingSection(section);
    setTempData(normalizedPropertyData);
    setErrors({});
  };

  const cancelEditing = () => {
    console.log('InlineEditPropertyView: cancelEditing called');
    console.log('InlineEditPropertyView: originalData before setting tempData:', originalData);
    
    // Ensure amenities is always an array when canceling and set proper defaults
    const normalizedOriginalData = {
      ...originalData,
      propertyType: originalData.propertyType || PROPERTY_TYPE.RESIDENTIAL,
      residentialType: originalData.residentialType || RESIDENTIAL_TYPE.APARTMENT,
      rentalSpace: originalData.rentalSpace || 'entire-apartment',
      amenities: normalizeAmenities(originalData.amenities)
    };
    
    console.log('InlineEditPropertyView: normalizedOriginalData:', normalizedOriginalData);
    setEditingSection(null);
    setTempData(normalizedOriginalData);
    setErrors({});
  };

  const saveSection = async (section: string) => {
    try {      
      // If this is the photos section, skip API call (PhotosSection handles it)
      if (section === 'photos') {
        setEditingSection(null);
        setErrors({});
        return;
      }
      
      setIsSaving(true);
      // Small delay to ensure all state updates have been processed
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Use ref to ensure we have the latest data
      const currentPropertyData = propertyDataRef.current;
      const updatedData = { ...currentPropertyData, ...tempData };
      setPropertyData(updatedData);
      
      // Transform back to API format and save
      const apiData = transformPropertyDataToApi(updatedData);
      console.log('InlineEditPropertyView: About to call updateProperty with:', { propertyId, apiData });
      
      const response = await propertiesAPI.updateProperty(propertyId, apiData);
      console.log('InlineEditPropertyView: updateProperty response:', response);
      
      if (response.success) {
        // Show appropriate toast message based on the section
        const toastMessages: Record<string, string> = {
          'basic': 'Unit details have been updated successfully.',
          'location': 'The location details have been updated successfully.',
          'photos': 'The photos have been updated.',
          'default': 'Property updated successfully.'
        };
        
        const toastMessage = toastMessages[section] || toastMessages.default;
        showToast('success', toastMessage);
        
        // IMPORTANT: Update propertyData BEFORE changing editing state
        setPropertyData(updatedData);  // Keep this one
        setEditingSection(null);
        setErrors({});
        setOriginalData(updatedData);
        onSave?.();
      } else {
        console.error('InlineEditPropertyView: API Error Details:', {
          error: response.error,
          status: response.status,
          data: response.data
        });
        throw new Error(response.error || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to update. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('constraint')) {
          errorMessage = 'Invalid property data. Please check your input values.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'You do not have permission to update this property.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Property not found. Please refresh the page and try again.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ [section]: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const transformPropertyDataToApi = (propertyData: PropertyData) => {
    // Transform PropertyData back to API format
    const apiData = {
      title: propertyData.rentalDetails?.listingName || 'Property Listing',
      description: propertyData.rentalDetails?.listingDescription || 'Property description',
      address: formatAddressForDatabase(propertyData.address),
      property_type: propertyData.propertyType || 'residential', // Ensure property_type is always set
      rental_space: propertyData.rentalSpace || 'entire-apartment', // Ensure rental_space is always set (match create API format)
      num_bedroom: propertyData.unitDetails?.bedrooms || 0,
      num_bathroom: propertyData.unitDetails?.bathrooms || 0,
      gross_area_size: propertyData.unitDetails?.grossArea || 0,
      gross_area_size_unit: 'sqft',
      furnished: propertyData.unitDetails?.furnished || 'non-furnished',
      pets_allowed: propertyData.unitDetails?.petsAllowed || false,
      amenities: propertyData.amenities || [],
      rental_price: propertyData.rentalDetails?.rentalPrice || 0,
      rental_price_currency: 'HKD',
      availability_date: propertyData.rentalDetails?.availableDate 
        ? new Date(propertyData.rentalDetails.availableDate).toISOString()
        : null,
      status: propertyData.status || 'draft',
      display_image: propertyData.displayImage || '',
      uploaded_images: propertyData.uploadedImages || [],
      // Also include photos field for backward compatibility
      photos: propertyData.uploadedImages || [],
    };
       
    return apiData;
  };



  const updateTempField = useCallback((section: string, field: string, value: unknown) => {

    setTempData(prev => {
      // If section is empty, this is a top-level field update
      if (!section) {
        const newState = {
          ...prev,
          [field]: value
        };
        console.log('InlineEditPropertyView: setTempData new state:', newState);
        return newState;
      }
      
      // Otherwise, this is a section-based field update
      const currentSection = prev[section as keyof PropertyData];
      const sectionData = typeof currentSection === 'object' && currentSection !== null ? currentSection : {};
      
      const newState = {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
      return newState;
    });
    
    // ALSO update the main propertyData for immediate persistence
    if (!section) {
      setPropertyData(prev => {
        const newState = {
          ...prev,
          [field]: value
        };
        // Also update the ref to keep it in sync
        propertyDataRef.current = newState;
        return newState;
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
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
    <div className="inline-edit-container bg-white">
      {/* Header */}
      <div className="inline-edit-header">
        <div className="inline-edit-header-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-900" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 mb-0">Edit Property Listing</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Property Display with Inline Editing */}
      <div className="inline-edit-content">
        <div className="inline-edit-sections">
          {/* Photos Section */}
          <PhotosSection
            data={editingSection === 'photos' ? tempData : propertyData}
            isEditing={editingSection === 'photos'}
            onStartEdit={() => startEditing('photos')}
            onCancelEdit={cancelEditing}
            onSaveEdit={() => saveSection('photos')}
            onUpdateField={updateTempField}
            errors={errors}
            isSaving={isSaving}
            propertyId={propertyId}
            onPhotoSaveSuccess={() => {
              console.log('Photos saved successfully');
              // Optionally refresh data or show success message
            }}
            onPhotoSaveError={(error) => {
              console.error('Photo save error:', error);
              setErrors({ photos: error });
            }}
          />
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
            propertyId={propertyId}
            onUpdateField={updateTempField}
            errors={errors}
          />

          {/* Property Details Section */}
          <PropertyDetailsSection
            propertyId={propertyId}
            onUpdateField={updateTempField}
            errors={errors}
          />

          {/* Amenities Section */}
          <AmenitiesSection
            data={propertyData}
            propertyId={propertyId}
            onUpdateField={updateTempField}
            errors={errors}
          />
          {/* Rental Information Section */}
          <RentalInfoSection
            propertyId={propertyId}
            onUpdateField={updateTempField}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
}
