'use client';

import { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Step1PropertyType from '@/components/add-property/Step1PropertyType';
import Step2RentalSpace from '@/components/add-property/Step2RentalSpace';
import Step3Address from '@/components/add-property/Step3Address';
import Step4UnitDetails from '@/components/add-property/Step4UnitDetails';
import Step5Amenities from '@/components/add-property/Step5Amenities';
import Step6Photos from '@/components/add-property/Step6Photos';
import Step7RentalDetails from '@/components/add-property/Step7RentalDetails';
import Step8Summary from '@/components/add-property/Step8Summary';
import { propertiesAPI } from '@/lib/api-client';
import { uploadService } from '@/lib/upload-client';
import { PropertyData, PropertyDataForAPI } from '@/types';

const steps = [
  { id: 1, title: 'Property Type', description: 'Select your property type' },
  { id: 2, title: 'Rental Space', description: 'Choose rental space type' },
  { id: 3, title: 'Address', description: 'Enter property address' },
  { id: 4, title: 'Unit Details', description: 'Fill in unit details' },
  { id: 5, title: 'Amenities', description: 'Select amenities' },
  { id: 6, title: 'Photos', description: 'Upload property photos' },
  { id: 7, title: 'Rental Details', description: 'Basic rental information' },
  { id: 8, title: 'Summary', description: 'Review and submit' },
];

interface AddPropertyViewProps {
  userType?: 'tenant' | 'landlord';
}

export default function AddPropertyView({ userType = 'landlord' }: AddPropertyViewProps) {
  const { user: authUser, isAuthenticated } = useAuth();
  // TODO: userType is currently unused but required by the interface
  // This will be used in future features for tenant vs landlord specific flows
  console.log('Current user type:', userType); // Temporary usage to satisfy linter
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState<PropertyData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [draftId, setDraftId] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const updatePropertyData = (data: Partial<PropertyData>) => {
    setPropertyData(prev => ({ ...prev, ...data }));
    // Clear any previous submit errors when data changes
    if (submitError) setSubmitError(null);
  };

  const nextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveDraft = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !authUser?.id) {
        showToast('error', 'You must be logged in to save a draft.');
        return;
      }

      // For drafts, we only need minimal data (at least a title)
      const hasMinimalData = propertyData.rentalDetails?.listingName || 
                             propertyData.propertyType || 
                             propertyData.address?.addressLine1;
      
      if (!hasMinimalData) {
        showToast('error', 'Please add at least a property name, type, or address to save a draft.');
        return;
      }

      // Use the actual authenticated user's ID
      const ownerId = authUser.id;
      
      // Prepare property data for draft
      const draftData: PropertyDataForAPI = {
        ...propertyData,
        photos: [], // Drafts don't need photos initially
      };
      
      console.log('Saving draft data:', draftData);
      console.log('Using owner ID:', ownerId);
      
      // Call the API to create the draft
      const response = await propertiesAPI.createProperty(draftData, ownerId, true);
      
      if (response.success && response.data) {
        console.log('Draft saved successfully:', response.data);
        setDraftId(response.data.property_uuid);
        
        // Show success message
        showToast('success', 'Draft saved successfully!');
      } else {
        throw new Error(response.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save draft';
      showToast('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !authUser?.id) {
        setSubmitError('You must be logged in to create a property listing.');
        return;
      }

      // Validate required data
      if (!isFormComplete()) {
        setSubmitError('Please complete all required fields before submitting.');
        return;
      }

      // Upload photos to S3 if they exist
      let photoUrls: string[] = [];
      if (propertyData.photos && propertyData.photos.length > 0) {
        try {
          console.log('Uploading photos to S3...');
          const uploadResponse = await uploadService.uploadPropertyPhotos(propertyData.photos);
          
          if (uploadResponse.success && uploadResponse.data?.uploadedFiles) {
            photoUrls = uploadResponse.data.uploadedFiles.map(file => file.url);
            console.log('Photos uploaded successfully:', photoUrls);
          } else {
            throw new Error(uploadResponse.error || 'Failed to upload photos');
          }
        } catch (uploadError) {
          console.error('Error uploading photos:', uploadError);
          setSubmitError('Failed to upload photos. Please try again.');
          return;
        }
      }

      // Use the actual authenticated user's ID
      const ownerId = authUser.id;
      
      // Prepare property data with photo URLs
      const propertyDataWithPhotos: PropertyDataForAPI = {
        ...propertyData,
        photos: photoUrls, // Array of S3 URLs - this is what the API now expects
      };
      
      console.log('Submitting property data:', propertyDataWithPhotos);
      console.log('Using owner ID:', ownerId);
      
      // Call the API to create the property
      const response = await propertiesAPI.createProperty(propertyDataWithPhotos, ownerId, false);
      
      if (response.success) {
        console.log('Property created successfully:', response.data);
        
        // Show success message
        showToast('success', 'Property added successfully!');
        
        // Redirect to properties list or dashboard
        router.push('/dashboard/properties');
      } else {
        throw new Error(response.error || 'Failed to create property');
      }
      
    } catch (error) {
      console.error('Error adding property:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else if (typeof error === 'string') {
        setSubmitError(error);
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormComplete = (): boolean => {
    // Check if all required steps are complete
    return (
      !!propertyData.propertyType &&
      !!propertyData.residentialType &&
      !!propertyData.rentalSpace &&
      !!propertyData.address?.addressLine1 &&
      !!propertyData.address?.district &&
      propertyData.unitDetails?.bedrooms !== undefined &&
      propertyData.unitDetails?.bathrooms !== undefined &&
      !!propertyData.amenities?.length &&
      !!propertyData.photos?.length &&
      !!propertyData.rentalDetails?.listingName &&
      !!propertyData.rentalDetails?.rentalPrice
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PropertyType data={propertyData} onUpdate={updatePropertyData} />;
      case 2:
        return <Step2RentalSpace data={propertyData} onUpdate={updatePropertyData} />;
      case 3:
        return <Step3Address data={propertyData} onUpdate={updatePropertyData} />;
      case 4:
        return <Step4UnitDetails data={propertyData} onUpdate={updatePropertyData} />;
      case 5:
        return <Step5Amenities data={propertyData} onUpdate={updatePropertyData} />;
      case 6:
        return <Step6Photos data={propertyData} onUpdate={updatePropertyData} />;
      case 7:
        return <Step7RentalDetails data={propertyData} onUpdate={updatePropertyData} />;
      case 8:
        return <Step8Summary data={propertyData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      default:
        return <Step1PropertyType data={propertyData} onUpdate={updatePropertyData} />;
    }
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(propertyData.propertyType && propertyData.residentialType);
      case 2:
        return !!propertyData.rentalSpace;
      case 3:
        return !!(propertyData.address?.addressLine1 && propertyData.address?.district);
      case 4:
        return !!(propertyData.unitDetails?.bedrooms !== undefined && propertyData.unitDetails?.bathrooms !== undefined);
      case 5:
        return !!propertyData.amenities?.length;
      case 6:
        return !!propertyData.photos?.length;
      case 7:
        return !!(propertyData.rentalDetails?.listingName && propertyData.rentalDetails?.rentalPrice);
      case 8:
        return isFormComplete();
      default:
        return false;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-0">
                {draftId ? 'Edit Draft' : 'Add Property'}
              </h2>
              <p className="text-sm text-gray-500 mb-0">
                {draftId ? `Draft: ${propertyData.rentalDetails?.listingName || 'Untitled'}` : `Step ${currentStep} of ${steps.length}`}
              </p>
              {draftId && (
                <p className="text-xs text-blue-600 mt-1">
                  Working on saved draft
                </p>
              )}
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="hidden lg:flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium ${
                  currentStep > step.id
                    ? 'bg-black border-black text-white'
                    : currentStep === step.id
                    ? 'border-black text-black'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckIcon className="h-3 w-3" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-4 h-0.5 mx-1 ${
                    currentStep > step.id ? 'bg-black' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Step Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-0">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-gray-600 mt-1 mb-0">
                {steps[currentStep - 1].description}
              </p>
            </div>

            {/* Step Content */}
            <div className="px-6 py-6">
              {renderStep()}
            </div>

            {/* Step Navigation */}
            {currentStep !== 8 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="btn-secondary inline-flex items-center justify-center w-auto max-w-[200px] gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeftIcon className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    {/* Save Draft Button - Only show after Step 2 */}
                    {currentStep > 2 && (
                      <button
                        onClick={saveDraft}
                        disabled={isSubmitting}
                        className="btn-secondary inline-flex items-center justify-center w-auto max-w-[200px] gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Save Draft</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={!isStepComplete(currentStep)}
                    className="form-button inline-flex items-center justify-center w-auto max-w-[200px] gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
