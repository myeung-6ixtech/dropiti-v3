'use client';

import { useState } from 'react';

import Link from 'next/link';
import { nhost } from '@/lib/nhost';
import { authClasses, authFormPatterns } from '@/styles/auth';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/change-password`;
      const { error: nhostError } = await nhost.auth.resetPassword({
        email,
        options: { redirectTo },
      });

      if (nhostError) {
        setError('Failed to send reset email. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={authClasses.container}>
        <div className={authClasses.formSection}>
          <div className={authClasses.formWrapper}>
            <div className={authClasses.sectionSpacing}>
              <Link href="/" className={authClasses.backLink}>
                ← Back to homepage
              </Link>
            </div>
            
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
                  <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className={authClasses.title}>
                  Check Your Email
                </h1>
                <p className={authClasses.subtitle}>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="btn-secondary  w-full justify-center items-center"
                >
                  Send Another Reset Email
                </button>
                <div className="space-y-3">
                <Link href="/auth/signin" className={authClasses.link}>
                  Back to Sign In
                </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Content (50%) */}
        <div className={authClasses.contentSection}>
          <div className={authClasses.contentWrapper}>
            <div className="max-w-md">
              <h2 className={authClasses.headingWhite}>
                Forgot Your Password?
              </h2>
              <p className={authClasses.descriptionWhite}>
                Don't worry! It happens to the best of us. Enter your email address and we'll send you a secure link to reset your password.
              </p>
              <div className={authClasses.contentSpacing}>
                <div className={authClasses.featureItem}>
                  <div className={authClasses.featureDotWhite}></div>
                  <span className={authClasses.featureTextWhite}>Secure password reset</span>
                </div>
                <div className={authClasses.featureItem}>
                  <div className={authClasses.featureDotWhite}></div>
                  <span className={authClasses.featureTextWhite}>Instant email delivery</span>
                </div>
                <div className={authClasses.featureItem}>
                  <div className={authClasses.featureDotWhite}></div>
                  <span className={authClasses.featureTextWhite}>Easy to use</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={authClasses.container}>
      {/* Left Side - Form (50%) */}
      <div className={authClasses.formSection}>
        <div className={authClasses.formWrapper}>
          <div className={authClasses.sectionSpacing}>
            <Link href="/" className={authClasses.backLink}>
              ← Back to homepage
            </Link>
          </div>
          
          <div>
            <div className={authClasses.sectionSpacing}>
              <h1 className={authClasses.title}>
                Reset Your Password
              </h1>
              <p className={authClasses.subtitle}>
                Enter your email address and we'll send you a secure link to reset your password.
              </p>
            </div>
            
            {error && (
              <div className={authClasses.error}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className={authClasses.form}>
              <div className={authFormPatterns.field.container}>
                <label className={authFormPatterns.field.label}>
                  Email address <span className={authFormPatterns.field.required}>*</span>
                </label>
                <input 
                  type="email"
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={authFormPatterns.field.input}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className={authClasses.button}
                >
                  {isLoading ? 'Sending Reset Email...' : 'Send Reset Email'}
                </button>
              </div>
            </form>

            <div className={`${authClasses.sectionSpacing} text-center`}>
              <p className={authClasses.textCenter}>
                Remember your password?{" "}
                <Link href="/auth/signin" className={authClasses.link}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Content (50%) */}
      <div className={authClasses.contentSection}>
        <div className={authClasses.contentWrapper}>
          <div className="max-w-md">
            <h2 className={authClasses.headingWhite}>
              Forgot Your Password?
            </h2>
            <p className={authClasses.descriptionWhite}>
              Don't worry! It happens to the best of us. Enter your email address and we'll send you a secure link to reset your password.
            </p>
            <div className={authClasses.contentSpacing}>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Secure password reset</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Instant email delivery</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Easy to use</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
