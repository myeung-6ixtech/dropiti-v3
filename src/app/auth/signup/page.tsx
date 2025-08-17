'use client';

import SignUpForm from '@/components/auth/SignUpForm';
import { authClasses } from '@/styles/auth';

export default function SignUpPage() {
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
            <h2 className={authClasses.heading}>
              Join Dropiti
            </h2>
            <p className={authClasses.description}>
              Create your account and start managing your properties with our comprehensive real estate platform.
            </p>
            <div className={authClasses.contentSpacing}>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDot}></div>
                <span className={authClasses.featureText}>List your properties</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDot}></div>
                <span className={authClasses.featureText}>Connect with tenants</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDot}></div>
                <span className={authClasses.featureText}>Manage applications</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
