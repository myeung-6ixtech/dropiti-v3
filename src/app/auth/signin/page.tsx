'use client';

import SignInForm from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className="auth-container">
      {/* Left Side - Form (50%) */}
      <div className="auth-form-section">
        <SignInForm />
      </div>

      {/* Right Side - Content (50%) */}
      <div className="auth-content-section">
        <div className="auth-content-wrapper">
          <div className="max-w-md">
            <h2 className="auth-heading">
              Welcome to Dropiti
            </h2>
            <p className="auth-description">
              Find your perfect property or list your space with our comprehensive real estate platform.
            </p>
            <div className="auth-content-spacing">
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span className="auth-feature-text">Search thousands of properties</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span className="auth-feature-text">Secure authentication</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span className="auth-feature-text">Manage your properties</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
