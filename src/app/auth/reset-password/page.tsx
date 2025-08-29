'use client';

import { useState } from 'react';

import Link from 'next/link';
import { auth, sendPasswordResetEmail } from '@/lib/firebase';
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
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      
      // Handle specific Firebase error codes
      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many reset attempts. Please try again later.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
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
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">What happens next?</p>
                    <ul className="mt-2 space-y-1 text-blue-600">
                      <li>• Check your email inbox (and spam folder)</li>
                      <li>• Click the reset link in the email</li>
                      <li>• Create a new password</li>
                      <li>• Sign in with your new password</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="btn-outline w-full"
                >
                  Send Another Reset Email
                </button>
                
                <Link href="/auth/signin" className={authClasses.link}>
                  Back to Sign In
                </Link>
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
