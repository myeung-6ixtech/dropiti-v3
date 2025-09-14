import { User, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Send email verification to a user
 */
export const sendUserEmailVerification = async (user: User): Promise<{ success: boolean; error?: string }> => {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/`,
      handleCodeInApp: true,
    };
    
    await sendEmailVerification(user, actionCodeSettings);
    return { success: true };
  } catch (error) {
    console.error('Email verification error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send verification email' 
    };
  }
};

/**
 * Send password reset email to a user
 */
export const sendUserPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/`,
      handleCodeInApp: true,
    };
    
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send password reset email' 
    };
  }
};

/**
 * Check if user's email is verified
 */
export const isEmailVerified = (user: User | null): boolean => {
  return user?.emailVerified || false;
};
