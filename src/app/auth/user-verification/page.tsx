'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthenticationStatus, useUserData } from '@nhost/nextjs';
import { nhostAuthService } from '@/services/auth/nhostAuthService';
import { authClasses } from '@/styles/auth';
import { useToast } from '@/context/ToastContext';

function UserVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const nhostUser = useUserData();
  const [isResending, setIsResending] = useState(false);

  const verifiedParam = searchParams.get('verified');
  const email = nhostUser?.email ?? '';

  // After user clicks the link in the email, Nhost may redirect here with ?verified=1
  useEffect(() => {
    if (authLoading || !isAuthenticated || !nhostUser) return;
    if (nhostUser.emailVerified) {
      window.history.replaceState({}, document.title, window.location.pathname);
      router.replace('/dashboard');
      return;
    }
    if (verifiedParam === '1') {
      // Refetch may have updated session; reload to get latest emailVerified
      window.location.reload();
    }
  }, [authLoading, isAuthenticated, nhostUser, verifiedParam, router]);

  // Not authenticated — send to sign in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/user-verification?verified=1`
        : undefined;
      const result = await nhostAuthService.resendVerificationEmail(email, redirectTo);
      if (result.success) {
        showToast('success', 'Verification email sent. Please check your inbox.');
      } else {
        showToast('error', result.error ?? 'Failed to send verification email.');
      }
    } catch {
      showToast('error', 'Failed to send verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleIveVerified = () => {
    // Reload so Nhost refetches session and emailVerified updates
    window.location.reload();
  };

  if (authLoading || (!isAuthenticated && !nhostUser)) {
    return (
      <div className={authClasses.container}>
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // If already verified, redirect is handled in useEffect; show loading briefly
  if (nhostUser?.emailVerified) {
    return (
      <div className={authClasses.container}>
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
            <p className="text-gray-600">Taking you to your account...</p>
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
            <Link href="/" className={authClasses.backLink}>
              ← Back to homepage
            </Link>
          </div>

          <div className={authClasses.sectionSpacing}>
            <h1 className={authClasses.title}>Verify your email</h1>
            <p className={authClasses.subtitle}>
              We sent a verification link to <strong>{email}</strong>. Click the link in that email to verify your account.
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className={authClasses.button}
            >
              {isResending ? 'Sending…' : 'Resend verification email'}
            </button>
            <button
              type="button"
              onClick={handleIveVerified}
              className={authClasses.buttonSecondary}
            >
              I&apos;ve verified my email
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            After clicking the link in the email, click &quot;I&apos;ve verified my email&quot; or refresh the page.
          </p>

          <div className={`${authClasses.sectionSpacing} text-center`}>
            <p className={authClasses.textCenter}>
              <Link href="/auth/signin" className={authClasses.link}>
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className={authClasses.contentSection}>
        <div className={authClasses.contentWrapper}>
          <div className="max-w-md">
            <h2 className={authClasses.headingWhite}>Check your inbox</h2>
            <p className={authClasses.descriptionWhite}>
              We need to verify your email address. Check the inbox for {email} and click the link we sent.
            </p>
            <div className={authClasses.contentSpacing}>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite} />
                <span className={authClasses.featureTextWhite}>Secure verification</span>
              </div>
              <div className={authClasses.featureItem}>
                <div className={authClasses.featureDotWhite} />
                <span className={authClasses.featureTextWhite}>One-click confirm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className={authClasses.container}>
          <div className="flex items-center justify-center w-full min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <UserVerificationContent />
    </Suspense>
  );
}
