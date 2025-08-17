'use client';

import SignInForm from '@/components/auth/SignInForm';
import { authClasses } from '@/styles/auth';

export default function SignInPage() {
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
            <h2 className={authClasses.heading}>
              Welcome to Dropiti
            </h2>
            <p className={authClasses.description}>
              Find your perfect property or list your space with our comprehensive real estate platform.
            </p>
            <div className={authClasses.contentSpacing}>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDot}></div>
                <span className={authClasses.featureText}>Search thousands of properties</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDot}></div>
                <span className={authClasses.featureText}>Secure authentication</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDot}></div>
                <span className={authClasses.featureText}>Manage your properties</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
