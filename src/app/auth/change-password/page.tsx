'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthenticationStatus } from '@nhost/nextjs';
import { nhost } from '@/lib/nhost';
import { authClasses, authFormPatterns } from '@/styles/auth';

function ChangePasswordForm() {
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Clean token from URL once we have resolved auth state (so it's not left in address bar)
  useEffect(() => {
    if (authLoading) return;
    if (typeof window === 'undefined') return;
    const hasToken = window.location.search.includes('refreshToken') || window.location.search.includes('token');
    if (hasToken && window.location.pathname === '/auth/change-password') {
      window.history.replaceState({}, document.title, '/auth/change-password');
    }
  }, [authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: nhostError } = await nhost.auth.changePassword({ newPassword: password });

      if (nhostError) {
        setError('Failed to change password. The link may have expired — please request a new reset email.');
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      console.error('Password change error:', err);
      setError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading: Nhost may still be exchanging the reset-link token for a session
  if (authLoading) {
    return (
      <div className={authClasses.container}>
        <div className={authClasses.formSection}>
          <div className="flex items-center justify-center w-full min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
        <div className={authClasses.contentSection}>
          <div className={authClasses.contentWrapper} />
        </div>
      </div>
    );
  }

  // Not authenticated after loading: invalid or expired reset link
  if (!isAuthenticated) {
    return (
      <div className={authClasses.container}>
        <div className={authClasses.formSection}>
          <div className={authClasses.formWrapper}>
            <div className={authClasses.sectionSpacing}>
              <Link href="/" className={authClasses.backLink}>← Back to homepage</Link>
            </div>
            <div className="text-center">
              <h1 className={authClasses.title}>Invalid or expired link</h1>
              <p className={authClasses.subtitle}>
                This reset password link is invalid or has already expired. Please request a new reset email.
              </p>
              <div className="mt-6 space-y-3">
                <Link href="/auth/reset-password" className={authClasses.button}>
                  Request new reset email
                </Link>
                <br />
                <Link href="/auth/signin" className={authClasses.link}>Back to sign in</Link>
              </div>
            </div>
          </div>
        </div>
        <div className={authClasses.contentSection}>
          <div className={authClasses.contentWrapper}>
            <div className="max-w-md">
              <h2 className={authClasses.headingWhite}>Link expired</h2>
              <p className={authClasses.descriptionWhite}>
                Password reset links expire for security. Request a new one and use it soon.
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
              <Link href="/" className={authClasses.backLink}>← Back to homepage</Link>
            </div>

            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className={authClasses.title}>Password Changed Successfully!</h1>
                <p className={authClasses.subtitle}>
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>

              <div className="space-y-3">
                <button onClick={() => router.push('/auth/signin')} className={authClasses.button}>
                  Sign In with New Password
                </button>
                <Link href="/" className={authClasses.link}>Back to Homepage</Link>
              </div>
            </div>
          </div>
        </div>

        <div className={authClasses.contentSection}>
          <div className={authClasses.contentWrapper}>
            <div className="max-w-md">
              <h2 className={authClasses.headingWhite}>Password Updated!</h2>
              <p className={authClasses.descriptionWhite}>
                Your password has been successfully changed. You can now access your account with your new secure password.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={authClasses.container}>
      <div className={authClasses.formSection}>
        <div className={authClasses.formWrapper}>
          <div className={authClasses.sectionSpacing}>
            <Link href="/" className={authClasses.backLink}>← Back to homepage</Link>
          </div>

          <div>
            <div className={authClasses.sectionSpacing}>
              <h1 className={authClasses.title}>Create New Password</h1>
              <p className={authClasses.subtitle}>
                Enter your new password below. Make sure it's secure and easy to remember.
              </p>
            </div>

            {error && <div className={authClasses.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={authClasses.form}>
              <div className={authFormPatterns.fieldWithIcon.container}>
                <label className={authFormPatterns.fieldWithIcon.label}>
                  New Password <span className={authFormPatterns.fieldWithIcon.required}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
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
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>

              <div className={authFormPatterns.fieldWithIcon.container}>
                <label className={authFormPatterns.fieldWithIcon.label}>
                  Confirm New Password <span className={authFormPatterns.fieldWithIcon.required}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
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
                    {showConfirmPassword ? 'Hide' : 'Show'}
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
                Remember your password?{' '}
                <Link href="/auth/signin" className={authClasses.link}>Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={authClasses.contentSection}>
        <div className={authClasses.contentWrapper}>
          <div className="max-w-md">
            <h2 className={authClasses.headingWhite}>Create New Password</h2>
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
