'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SignUpForm from '@/components/auth/SignUpForm';
import { authClasses } from '@/styles/auth';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function SignUpPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !redirectedRef.current) {
      redirectedRef.current = true;
      showToast('success', 'User successfully authenticated');
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={authClasses.container}>
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the signup form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={authClasses.container}>
      {/* Left Side - Form (50%) */}
      <div className={authClasses.formSection}>
        <SignUpForm />
      </div>

      {/* Right Side - Content (50%) */}
      <div className={authClasses.contentSection}>
        <div className={authClasses.contentWrapper}>
          <div className="max-w-md">
            <h2 className={authClasses.headingWhite}>
              Join Dropiti
            </h2>
            <p className={authClasses.descriptionWhite}>
              Create your account and start managing your properties with our comprehensive real estate platform.
            </p>
            <div className={authClasses.contentSpacing}>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>List your properties</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Connect with tenants</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Manage applications</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
