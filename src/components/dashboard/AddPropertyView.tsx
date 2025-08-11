'use client';

import { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Step1PropertyType from '@/components/add-property/Step1PropertyType';
import Step2RentalSpace from '@/components/add-property/Step2RentalSpace';
import Step3Address from '@/components/add-property/Step3Address';
import Step4UnitDetails from '@/components/add-property/Step4UnitDetails';
import Step5Amenities from '@/components/add-property/Step5Amenities';
import Step6Photos from '@/components/add-property/Step6Photos';
import Step7RentalDetails from '@/components/add-property/Step7RentalDetails';
import Step8Summary from '@/components/add-property/Step8Summary';
import { propertiesAPI } from '@/lib/api-client';
import { PropertyData } from '@/types';

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
  // TODO: userType is currently unused but required by the interface
  // This will be used in future features for tenant vs landlord specific flows
  console.log('Current user type:', userType); // Temporary usage to satisfy linter
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState<PropertyData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Validate required data
      if (!isFormComplete()) {
        setSubmitError('Please complete all required fields before submitting.');
        return;
      }

      // For now, use a mock ownerId - in a real app, this would come from auth context
      const ownerId = 'mock-owner-id-123'; // TODO: Get from auth context
      
      console.log('Submitting property data:', propertyData);
      
      // Call the API to create the property
      const response = await propertiesAPI.createProperty(propertyData, ownerId);
      
      if (response.success) {
        console.log('Property created successfully:', response.data);
        
        // Show success message
        alert('Property added successfully!');
        
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
              <h2 className="text-xl font-semibold text-gray-900">Add Property</h2>
              <p className="text-sm text-gray-500">Step {currentStep} of {steps.length}</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="hidden lg:flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium ${
                  currentStep > step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : currentStep === step.id
                    ? 'border-blue-600 text-blue-600'
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
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Step Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-gray-600 mt-1">
                {steps[currentStep - 1].description}
              </p>
            </div>

            {/* Step Content */}
            <div className="px-6 py-6">
              {renderStep()}
            </div>

            {/* Step Navigation */}
            {currentStep !== 8 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="form-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Previous
                  </button>

                  <button
                    onClick={nextStep}
                    disabled={!isStepComplete(currentStep)}
                    className="form-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
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
