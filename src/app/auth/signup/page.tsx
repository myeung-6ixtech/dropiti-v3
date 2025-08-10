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
              Join Dropiti
            </h2>
            <p className="auth-description">
              Create your account and start managing your properties with our comprehensive real estate platform.
            </p>
            <div className="auth-content-spacing">
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span className="auth-feature-text">List your properties</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span className="auth-feature-text">Connect with tenants</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span className="auth-feature-text">Manage applications</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
