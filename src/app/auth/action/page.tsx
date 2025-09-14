'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { auth, confirmPasswordReset, verifyPasswordResetCode, applyActionCode } from '@/lib/firebase';
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

  // Validate the action code and determine the mode
  useEffect(() => {
    const validateAction = async () => {
      if (!oobCode || !mode) {
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
          setError('Invalid action mode. Please check your email for the correct link.');
        }
      } catch (error: unknown) {
        console.error('Action validation error:', error);
        
        const firebaseError = error as { code?: string };
        switch (firebaseError.code) {
          case 'auth/invalid-action-code':
            setError('This action link has expired or is invalid. Please request a new one.');
            break;
          case 'auth/expired-action-code':
            setError('This action link has expired. Please request a new one.');
            break;
          case 'auth/user-disabled':
            setError('This account has been disabled. Please contact support.');
            break;
          default:
            setError('Invalid action link. Please check your email for the correct link.');
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateAction();
  }, [oobCode, mode]);

  const handlePasswordReset = async (password: string, confirmPassword: string) => {
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
      console.error('Password reset error:', error);
      
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
          setError('Failed to reset password. Please try again.');
      }
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
