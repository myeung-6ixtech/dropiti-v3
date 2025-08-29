'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth, confirmPasswordReset, verifyPasswordResetCode } from '@/lib/firebase';
import { authClasses, authFormPatterns } from '@/styles/auth';

function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  

  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode'); // Firebase action code

  // Validate the reset token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!oobCode) {
        setError('Invalid reset link. Please request a new password reset.');
        setIsValidating(false);
        return;
      }

      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidToken(true);
      } catch (error: unknown) {
        console.error('Token validation error:', error);
        
        const firebaseError = error as { code?: string };
        switch (firebaseError.code) {
          case 'auth/invalid-action-code':
            setError('This reset link has expired or is invalid. Please request a new password reset.');
            break;
          case 'auth/expired-action-code':
            setError('This reset link has expired. Please request a new password reset.');
            break;
          default:
            setError('Invalid reset link. Please request a new password reset.');
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!oobCode) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (error: unknown) {
      console.error('Password change error:', error);
      
              const firebaseError = error as { code?: string };
        switch (firebaseError.code) {
        case 'auth/invalid-action-code':
          setError('This reset link has expired or is invalid. Please request a new password reset.');
          break;
        case 'auth/expired-action-code':
          setError('This reset link has expired. Please request a new password reset.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        default:
          setError('Failed to change password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className={authClasses.container}>
        <div className={authClasses.formSection}>
          <div className={authClasses.formWrapper}>
            <div className="flex items-center justify-center w-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Validating reset link...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Content (50%) */}
        <div className={authClasses.contentSection}>
          <div className={authClasses.contentWrapper}>
            <div className="max-w-md">
              <h2 className={authClasses.headingWhite}>
                Validating Reset Link
              </h2>
              <p className={authClasses.descriptionWhite}>
                Please wait while we verify your password reset link...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  Password Changed Successfully!
                </h1>
                <p className={authClasses.subtitle}>
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-green-700">
                    <p className="font-medium">What happens next?</p>
                    <ul className="mt-2 space-y-1 text-green-600">
                      <li>• Your password has been securely updated</li>
                      <li>• You can now sign in with your new password</li>
                      <li>• All your data and settings remain unchanged</li>
                      <li>• For security, old sessions have been invalidated</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/auth/signin" className={authClasses.button}>
                  Sign In with New Password
                </Link>
                
                <Link href="/" className={authClasses.link}>
                  Back to Homepage
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
                Password Updated!
              </h2>
              <p className={authClasses.descriptionWhite}>
                Your password has been successfully changed. You can now access your account with your new secure password.
              </p>
              <div className={authClasses.contentSpacing}>
                <div className={authClasses.featureItem}>
                  <div className={authClasses.featureDotWhite}></div>
                  <span className={authClasses.featureTextWhite}>Secure password updated</span>
                </div>
                <div className={authClasses.featureItem}>
                  <div className={authClasses.featureDotWhite}></div>
                  <span className={authClasses.featureTextWhite}>Account protected</span>
                </div>
                <div className={authClasses.featureItem}>
                  <div className={authClasses.featureDotWhite}></div>
                  <span className={authClasses.featureTextWhite}>Ready to sign in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
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
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className={authClasses.title}>
                  Invalid Reset Link
                </h1>
                <p className={authClasses.subtitle}>
                  {error || 'This password reset link is invalid or has expired.'}
                </p>
              </div>
              
              <div className="space-y-3">
                <Link href="/auth/reset-password" className={authClasses.button}>
                  Request New Reset Link
                </Link>
                
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
                Link Expired
              </h2>
              <p className={authClasses.descriptionWhite}>
                Password reset links expire for security reasons. Request a new one to continue with your password reset.
              </p>
              <div className={authClasses.contentSpacing}>
                <div className={authClasses.featureItem}>
                  <div className={authClasses.featureDotWhite}></div>
                  <span className={authClasses.featureTextWhite}>Security first</span>
                </div>
                <div className={authClasses.featureItem}>
                  <div className={authClasses.featureDotWhite}></div>
                  <span className={authClasses.featureTextWhite}>Fresh reset link</span>
                </div>
                <div className={authClasses.featureItem}>
                  <div className={authClasses.featureDotWhite}></div>
                  <span className={authClasses.featureTextWhite}>Quick and easy</span>
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
                Create New Password
              </h1>
              <p className={authClasses.subtitle}>
                Enter your new password below. Make sure it's secure and easy to remember.
              </p>
            </div>
            
            {error && (
              <div className={authClasses.error}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className={authClasses.form}>
              <div className={authFormPatterns.fieldWithIcon.container}>
                <label className={authFormPatterns.fieldWithIcon.label}>
                  New Password <span className={authFormPatterns.fieldWithIcon.required}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={authFormPatterns.fieldWithIcon.input}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={authFormPatterns.fieldWithIcon.icon}
                    disabled={isLoading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div className={authFormPatterns.fieldWithIcon.container}>
                <label className={authFormPatterns.fieldWithIcon.label}>
                  Confirm New Password <span className={authFormPatterns.fieldWithIcon.required}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={authFormPatterns.fieldWithIcon.input}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={authFormPatterns.fieldWithIcon.icon}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || !password.trim() || !confirmPassword.trim()}
                  className={authClasses.button}
                >
                  {isLoading ? 'Updating Password...' : 'Update Password'}
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
              Create New Password
            </h2>
            <p className={authClasses.descriptionWhite}>
              Choose a strong, secure password that you'll remember. Your new password will protect your account and all your data.
            </p>
            <div className={authClasses.contentSpacing}>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Strong password requirements</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Secure account access</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite}></div>
                <span className={authClasses.featureTextWhite}>Data protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ChangePasswordForm />
    </Suspense>
  );
}
