'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { auth, confirmPasswordReset, verifyPasswordResetCode, applyActionCode } from '@/lib/firebase';
import { useToast } from '@/context/ToastContext';
import AuthActionLoading from '@/components/auth/AuthActionLoading';
import EmailVerificationSuccess from '@/components/auth/EmailVerificationSuccess';
import PasswordResetSuccess from '@/components/auth/PasswordResetSuccess';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import AuthActionError from '@/components/auth/AuthActionError';

function AuthActionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [actionMode, setActionMode] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');
  const { showToast } = useToast();

  // Validate the action code and determine the mode
  useEffect(() => {
    const validateAction = async () => {
      if (!oobCode || !mode) {
        showToast('error', 'Invalid action link. Please check your email for the correct link.');
        setError('Invalid action link. Please check your email for the correct link.');
        setIsValidating(false);
        return;
      }

      setActionMode(mode);

      try {
        if (mode === 'resetPassword') {
          // For password reset, verify the code
          await verifyPasswordResetCode(auth, oobCode);
          setIsValidToken(true);
        } else if (mode === 'verifyEmail') {
          // For email verification, apply the code
          await applyActionCode(auth, oobCode);
          setSuccess(true);
        } else {
          const errorMsg = 'Invalid action mode. Please check your email for the correct link.';
          showToast('error', errorMsg);
          setError(errorMsg);
        }
      } catch (error: unknown) {
        console.error('Action validation error:', error);
        
        const firebaseError = error as { code?: string };
        let errorMsg = 'Invalid action link. Please check your email for the correct link.';
        
        switch (firebaseError.code) {
          case 'auth/invalid-action-code':
            errorMsg = 'This action link has expired or is invalid. Please request a new one.';
            break;
          case 'auth/expired-action-code':
            errorMsg = 'This action link has expired. Please request a new one.';
            break;
          case 'auth/user-disabled':
            errorMsg = 'This account has been disabled. Please contact support.';
            break;
        }
        
        showToast('error', errorMsg);
        setError(errorMsg);
      } finally {
        setIsValidating(false);
      }
    };

    validateAction();
  }, [oobCode, mode, showToast]);

  const handlePasswordReset = async (password: string, confirmPassword: string) => {
    setError('');

    // Validation
    if (password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters long.';
      showToast('error', errorMsg);
      setError(errorMsg);
      return;
    }

    if (password !== confirmPassword) {
      const errorMsg = 'Passwords do not match.';
      showToast('error', errorMsg);
      setError(errorMsg);
      return;
    }

    if (!oobCode) {
      const errorMsg = 'Invalid reset link. Please request a new password reset.';
      showToast('error', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      showToast('success', 'Password reset successfully! You can now sign in with your new password.');
      setSuccess(true);
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      
      const firebaseError = error as { code?: string };
      let errorMsg = 'Failed to reset password. Please try again.';
      
      switch (firebaseError.code) {
        case 'auth/invalid-action-code':
          errorMsg = 'This reset link has expired or is invalid. Please request a new password reset.';
          break;
        case 'auth/expired-action-code':
          errorMsg = 'This reset link has expired. Please request a new password reset.';
          break;
        case 'auth/weak-password':
          errorMsg = 'Password is too weak. Please choose a stronger password.';
          break;
      }
      
      showToast('error', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return <AuthActionLoading />;
  }

  // Success state for email verification
  if (success && actionMode === 'verifyEmail') {
    return <EmailVerificationSuccess />;
  }

  // Success state for password reset
  if (success && actionMode === 'resetPassword') {
    return <PasswordResetSuccess />;
  }

  // Error state
  if (!isValidToken && actionMode === 'resetPassword') {
    return <AuthActionError error={error} actionMode={actionMode} />;
  }

  // Password reset form
  if (actionMode === 'resetPassword' && isValidToken) {
    return <PasswordResetForm onSubmit={handlePasswordReset} isLoading={isLoading} error={error} />;
  }

  // Default error state
  return <AuthActionError error={error} actionMode={actionMode} />;
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthActionForm />
    </Suspense>
  );
}
