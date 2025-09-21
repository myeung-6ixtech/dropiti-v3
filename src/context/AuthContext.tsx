"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usersAPI } from "@/lib/api-client";
import { AUTH_ERRORS } from "@/types/error-messages";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    // Additional user profile fields
    uuid?: string;
    displayName?: string;
    photoUrl?: string;
    location?: string;
    about?: string;
    education?: string;
    occupation?: string;
    maritalStatus?: string;
    languages?: string[];
    responseTime?: string;
    verified?: boolean;
    rating?: number;
    reviewCount?: number;
    responseRate?: number;
    avgResponseTime?: string;
    totalProperties?: number;
    totalGuests?: number;
    userSince?: string;
    phoneNumber?: string;
    preferences?: Record<string, unknown>;
    notificationSettings?: Record<string, unknown>;
    privacySettings?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isRememberMeEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Error mapping function for NextAuth/Firebase errors
const mapAuthError = (error: string): string => {
  const errorMap: Record<string, string> = {
    // NextAuth generic errors
    'CredentialsSignin': AUTH_ERRORS.INVALID_CREDENTIALS,
    'Invalid credentials': AUTH_ERRORS.INVALID_CREDENTIALS,
    'User not found': AUTH_ERRORS.INVALID_CREDENTIALS,
    'Wrong password': AUTH_ERRORS.INVALID_CREDENTIALS,
    'Invalid email': AUTH_ERRORS.INVALID_CREDENTIALS,
    'User disabled': AUTH_ERRORS.ACCOUNT_DISABLED,
    'Too many requests': 'Too many login attempts. Please try again later.',
    'Network error': AUTH_ERRORS.UNEXPECTED_ERROR,
    
    // Firebase Auth error codes
    'Firebase: Error (auth/user-not-found)': AUTH_ERRORS.INVALID_CREDENTIALS,
    'Firebase: Error (auth/wrong-password)': AUTH_ERRORS.INVALID_CREDENTIALS,
    'Firebase: Error (auth/invalid-email)': AUTH_ERRORS.INVALID_CREDENTIALS,
    'Firebase: Error (auth/user-disabled)': AUTH_ERRORS.ACCOUNT_DISABLED,
    'Firebase: Error (auth/too-many-requests)': 'Too many login attempts. Please try again later.',
    'Firebase: Error (auth/network-request-failed)': AUTH_ERRORS.UNEXPECTED_ERROR,
    'Firebase: Error (auth/invalid-credential)': AUTH_ERRORS.INVALID_CREDENTIALS,
    'Firebase: Error (auth/operation-not-allowed)': 'This sign-in method is not enabled. Please contact support.',
    'Firebase: Error (auth/requires-recent-login)': 'This operation requires recent authentication. Please sign in again.',
    'Firebase: Error (auth/email-already-in-use)': AUTH_ERRORS.EMAIL_ALREADY_EXISTS,
    'Firebase: Error (auth/weak-password)': AUTH_ERRORS.PASSWORD_TOO_WEAK,
    'Firebase: Error (auth/invalid-verification-code)': 'Invalid verification code. Please try again.',
    'Firebase: Error (auth/invalid-verification-id)': 'Invalid verification ID. Please try again.',
    'Firebase: Error (auth/code-expired)': 'Verification code has expired. Please request a new one.',
    'Firebase: Error (auth/missing-verification-code)': 'Verification code is required.',
    'Firebase: Error (auth/missing-verification-id)': 'Verification ID is required.',
    'Firebase: Error (auth/quota-exceeded)': 'Too many requests. Please try again later.',
    'Firebase: Error (auth/captcha-check-failed)': 'Captcha verification failed. Please try again.',
    'Firebase: Error (auth/invalid-phone-number)': 'Invalid phone number format.',
    'Firebase: Error (auth/missing-phone-number)': 'Phone number is required.',
  };
  
  return errorMap[error] || AUTH_ERRORS.UNEXPECTED_ERROR;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRememberMeEnabled, setIsRememberMeEnabled] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    // Additional user profile fields
    uuid?: string;
    displayName?: string;
    photoUrl?: string;
    location?: string;
    about?: string;
    education?: string;
    occupation?: string;
    maritalStatus?: string;
    languages?: string[];
    responseTime?: string;
    verified?: boolean;
    rating?: number;
    reviewCount?: number;
    responseRate?: number;
    avgResponseTime?: string;
    totalProperties?: number;
    totalGuests?: number;
    userSince?: string;
    phoneNumber?: string;
    preferences?: Record<string, unknown>;
    notificationSettings?: Record<string, unknown>;
    privacySettings?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
  } | null>(null);
  const router = useRouter();

  // Helper function to safely parse languages field
  const parseLanguages = (languages: unknown): string[] => {
    if (Array.isArray(languages)) {
      return languages;
    }
    
    if (typeof languages === 'string') {
      try {
        const parsed = JSON.parse(languages);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    
    return [];
  };

  // Helper function to safely parse preferences
  const parsePreferences = (preferences: unknown): Record<string, unknown> => {
    if (preferences && typeof preferences === 'object') {
      return preferences as Record<string, unknown>;
    }
    
    if (typeof preferences === 'string') {
      try {
        const parsed = JSON.parse(preferences);
        return typeof parsed === 'object' ? parsed : {};
      } catch {
        return {};
      }
    }
    
    return {};
  };

  // Helper function to safely parse notification settings
  const parseNotificationSettings = (settings: unknown): Record<string, unknown> => {
    if (settings && typeof settings === 'object') {
      return settings as Record<string, unknown>;
    }
    
    if (typeof settings === 'string') {
      try {
        const parsed = JSON.parse(settings);
        return typeof parsed === 'object' ? parsed : {};
      } catch {
        return {};
      }
    }
    
    return {};
  };

  // Helper function to safely parse privacy settings
  const parsePrivacySettings = (settings: unknown): Record<string, unknown> => {
    if (settings && typeof settings === 'object') {
      return settings as Record<string, unknown>;
    }
    
    if (typeof settings === 'string') {
      try {
        const parsed = JSON.parse(settings);
        return typeof parsed === 'object' ? parsed : {};
      } catch {
        return {};
      }
    }
    
    return {};
  };

  // Check if remember me is enabled from localStorage
  const checkRememberMePreference = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedRememberMe = localStorage.getItem('dropiti_remember_me');
      return savedRememberMe === 'true';
    }
    return false;
  }, []);

  // Check session expiry for remember me functionality
  const checkSessionExpiry = useCallback(() => {
    if (typeof window !== 'undefined' && isRememberMeEnabled) {
      const sessionExpiry = localStorage.getItem('dropiti_session_expiry');
      if (sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry, 10);
        const currentTime = Date.now();
        
        if (currentTime > expiryTime) {
          console.log('Session expired, logging out');
          logout();
        }
      }
    }
  }, [isRememberMeEnabled]);

  // Set up session expiry check interval
  useEffect(() => {
    const interval = setInterval(checkSessionExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkSessionExpiry]);

  // Load user data when session changes
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user?.id) {
        try {
          console.log('Loading user data for ID:', session.user.id);
          
          // Try to get user data from API
          const response = await usersAPI.getUserByFirebaseUid(session.user.id);
          
          if (response.success && response.data) {
            const userData = response.data;
            console.log('User data loaded from API:', userData);
            
            setUser({
              id: userData.firebase_uid || session.user.id,
              email: userData.email || session.user.email || '',
              name: userData.display_name || userData.name || session.user.name || 'User',
              avatar: userData.photo_url || userData.avatar || session.user.image || undefined,
              uuid: userData.uuid,
              displayName: userData.display_name,
              photoUrl: userData.photo_url,
              location: userData.location,
              about: userData.about,
              education: userData.education,
              occupation: userData.occupation,
              maritalStatus: userData.marital_status,
              languages: parseLanguages(userData.languages),
              responseTime: userData.response_time,
              verified: userData.verified || false,
              rating: userData.rating || 0,
              reviewCount: userData.review_count || 0,
              responseRate: userData.response_rate || 0,
              avgResponseTime: userData.avg_response_time || 'Not specified',
              totalProperties: userData.total_properties || 0,
              totalGuests: userData.total_guests || 0,
              userSince: userData.created_at,
              phoneNumber: userData.phone_number,
              preferences: parsePreferences(userData.preferences),
              notificationSettings: parseNotificationSettings(userData.notification_settings),
              privacySettings: parsePrivacySettings(userData.privacy_settings),
              createdAt: userData.created_at,
              updatedAt: userData.updated_at,
            });
            
            setIsAuthenticated(true);
            
            // Set remember me preference
            const rememberMe = checkRememberMePreference();
            setIsRememberMeEnabled(rememberMe);
            
            // Set session expiry if remember me is enabled
            if (rememberMe) {
              const expiryTime = Date.now() + (90 * 24 * 60 * 60 * 1000); // 90 days
              localStorage.setItem('dropiti_session_expiry', expiryTime.toString());
            }
            
          } else {
            console.log('No user data found in API, using session data');
            // Fallback to session data if API call fails
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.name || 'User',
              avatar: session.user.image || undefined,
            });
            setIsAuthenticated(true);
            
            // Set remember me preference
            const rememberMe = checkRememberMePreference();
            setIsRememberMeEnabled(rememberMe);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback to session data on error
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.name || 'User',
            avatar: session.user.image || undefined,
          });
          setIsAuthenticated(true);
          
          // Set remember me preference
          const rememberMe = checkRememberMePreference();
          setIsRememberMeEnabled(rememberMe);
        }
      } else {
        console.log('No session, clearing user data');
        setUser(null);
        setIsAuthenticated(false);
        setIsRememberMeEnabled(false);
      }
    };

    loadUserData();
  }, [session, checkRememberMePreference]);

  // Check session expiry on mount and when remember me changes
  useEffect(() => {
    if (isAuthenticated && isRememberMeEnabled) {
      checkSessionExpiry();
    }
  }, [isAuthenticated, isRememberMeEnabled, checkSessionExpiry]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        rememberMe, // Pass remember me preference to NextAuth
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: mapAuthError(result.error) };
      }

      // If remember me is enabled, we'll handle the session duration in the NextAuth config
      // The actual session duration is controlled by the NextAuth session.maxAge setting
      console.log('Login successful, remember me:', rememberMe);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: AUTH_ERRORS.UNEXPECTED_ERROR };
    }
  };

  const logout = async () => {
    try {
      // Clear remember me preference on logout
      localStorage.removeItem('dropiti_remember_me');
      setIsRememberMeEnabled(false);
      
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: status === 'loading',
        user,
        login,
        logout,
        isRememberMeEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};