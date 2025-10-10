'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SignInForm from '@/components/auth/SignInForm';
import { authClasses } from '@/styles/auth';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function SignInPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !redirectedRef.current) {
      redirectedRef.current = true;
      showToast('success', 'User successfully authenticated');
      
      // Check for callback URL in search params
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl');
      
      // Use replace to prevent back button issues
      router.replace(callbackUrl || '/dashboard');
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

  // Don't render the signin form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={authClasses.container}>
      {/* Left Side - Form (50%) */}
      <div className={authClasses.formSection}>
        <SignInForm />
      </div>

      {/* Right Side - Content (50%) */}
      <div className={authClasses.contentSection}>
        <div className={authClasses.contentWrapper}>
          <div className="max-w-md">
            <h2 className={authClasses.headingWhite}>
              Welcome to Dropiti
            </h2>
            <p className={authClasses.descriptionWhite}>
              Find your perfect property or list your space with our comprehensive real estate platform.
            </p>
            <div className={authClasses.contentSpacing}>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Search thousands of properties</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Secure authentication</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Manage your properties</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
