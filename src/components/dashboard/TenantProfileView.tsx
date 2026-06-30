'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { tenantsAPI } from '@/lib/api-client';
import { fetchMyTenantProfile, buildTenantProfileUpsertPayload, type TenantProfileEmbeddedUser } from '@/lib/tenant-profiles';
import { useTenantProfileDisplayUser } from '@/hooks/useTenantProfileDisplayUser';
import type { TenantProfileData } from '@/types/tenant';
import Step1BasicInfo from '@/components/tenant-profile/Step1BasicInfo';
import Step2Preferences from '@/components/tenant-profile/Step2Preferences';
import Step3Review from '@/components/tenant-profile/Step3Review';

const steps = [
  { id: 1, title: 'Basic Information', description: 'Tell us about yourself' },
  { id: 2, title: 'Preferences & Logistics', description: 'Set your rental preferences' },
  { id: 3, title: 'Review & Confirm', description: 'Review and publish your profile' },
];

export default function TenantProfileView() {
  const { user: authUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<TenantProfileData>({});
  const [profileUser, setProfileUser] = useState<TenantProfileEmbeddedUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const nhostUserId = authUser?.id || '';

  // Load existing profile data
  useEffect(() => {
    if (!nhostUserId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchMyTenantProfile(nhostUserId);
        if (res.success && res.data) {
          setProfileData(res.data);
          setProfileUser(res.user ?? null);
        } else if (res.notFound) {
          setProfileData({});
          setProfileUser(null);
        }
      } catch (error) {
        console.error(error);
        showToast('error', 'Failed to load tenant profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [nhostUserId, showToast]);

  const updateProfileData = (data: Partial<TenantProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const publishProfile = async () => {
    if (!nhostUserId) return;
    try {
      setIsSubmitting(true);

      await tenantsAPI.upsertTenantProfile(
        buildTenantProfileUpsertPayload(profileData, nhostUserId, 'active'),
      );
      
      showToast('success', 'Tenant profile published successfully!');
      router.push('/dashboard/tenant-profile');
    } catch (e) {
      console.error('Publish tenant profile failed:', e);
      showToast('error', 'Failed to publish profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profileData.tenant_listing_title && profileData.tenant_listing_description);
      case 2:
        return !!(profileData.budget_min && profileData.budget_max && profileData.preferred_locations && (profileData.preferred_locations?.length || 0) > 0);
      case 3:
        return isFormComplete();
      default:
        return false;
    }
  };

  const isFormComplete = (): boolean => {
    return !!(
      profileData.tenant_listing_title &&
      profileData.tenant_listing_description &&
      profileData.budget_min &&
      profileData.budget_max &&
      profileData.preferred_locations &&
      profileData.preferred_locations.length > 0
    );
  };

  const { displayUser } = useTenantProfileDisplayUser(nhostUserId, profileUser, {
    displayName: authUser?.displayName,
    name: authUser?.name,
    avatar: authUser?.avatar || authUser?.photoUrl,
    email: authUser?.email,
    id: nhostUserId,
  });

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo data={profileData} onUpdate={updateProfileData} />;
      case 2:
        return <Step2Preferences data={profileData} onUpdate={updateProfileData} />;
      case 3:
        return <Step3Review data={profileData} user={displayUser} onSubmit={publishProfile} isSubmitting={isSubmitting} />;
      default:
        return <Step1BasicInfo data={profileData} onUpdate={updateProfileData} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to manage your tenant profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-0">
                Tenant Profile
              </h2>
              <p className="text-sm text-gray-500 mb-0">
                Step {currentStep} of {steps.length}
              </p>
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
            {currentStep !== 3 && (
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


