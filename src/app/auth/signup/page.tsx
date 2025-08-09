'use client';

import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="auth-container">
      {/* Left Side - Form (50%) */}
      <div className="auth-form-section">
        <SignUpForm />
      </div>

      {/* Right Side - Content (50%) */}
      <div className="auth-content-section">
        <div className="auth-content-wrapper">
          <div className="max-w-md">
            <h2 className="auth-heading">
              Join dropiti
            </h2>
            <p className="auth-description">
              Create your account and start your journey in real estate. Whether you're looking to rent or list properties, we've got you covered.
            </p>
            <div className="auth-content-spacing">
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span className="auth-feature-text">Create your profile</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span className="auth-feature-text">Browse properties</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span className="auth-feature-text">Connect with landlords</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span className="auth-feature-text">Manage your listings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
