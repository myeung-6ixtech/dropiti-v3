'use client';

import { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import Step1PropertyType from '@/components/add-property/Step1PropertyType';
import Step2RentalSpace from '@/components/add-property/Step2RentalSpace';
import Step3Address from '@/components/add-property/Step3Address';
import Step4UnitDetails from '@/components/add-property/Step4UnitDetails';
import Step5Amenities from '@/components/add-property/Step5Amenities';
import Step6Photos from '@/components/add-property/Step6Photos';
import Step7RentalDetails from '@/components/add-property/Step7RentalDetails';
import Step8Summary from '@/components/add-property/Step8Summary';
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

  const updatePropertyData = (data: Partial<PropertyData>) => {
    setPropertyData(prev => ({ ...prev, ...data }));
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
    try {
      // Here you would submit the property data to your API
      console.log('Submitting property data:', propertyData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success - redirect to properties list or dashboard
      alert('Property added successfully!');
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Error adding property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        return true;
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
