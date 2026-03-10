"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuthenticationStatus, useUserData } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { usersAPI } from "@/lib/api-client";
import { nhost } from "@/lib/nhost";
import { AUTH_ERRORS } from "@/types/error-messages";

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
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
  onboarding_complete?: boolean;
  preferences?: Record<string, unknown>;
  notificationSettings?: Record<string, unknown>;
  privacySettings?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ error?: string }>;
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

const mapAuthError = (error: string): string => {
  const errorMap: Record<string, string> = {
    'invalid-email-password': AUTH_ERRORS.INVALID_CREDENTIALS,
    'unverified-user': 'Please verify your email before signing in.',
    'user-not-found': AUTH_ERRORS.INVALID_CREDENTIALS,
    'invalid-email': AUTH_ERRORS.INVALID_CREDENTIALS,
    'disabled-user': AUTH_ERRORS.ACCOUNT_DISABLED,
    'too-many-requests': 'Too many login attempts. Please try again later.',
    'network-error': AUTH_ERRORS.UNEXPECTED_ERROR,
  };
  return errorMap[error] || AUTH_ERRORS.UNEXPECTED_ERROR;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const parseJSON = <T,>(value: unknown, fallback: T): T => {
  if (value && typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' ? (parsed as T) : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const nhostUser = useUserData();
  const [isRememberMeEnabled, setIsRememberMeEnabled] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();

  const checkRememberMe = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('dropiti_remember_me') === 'true';
  }, []);

  // Load DB profile whenever the Nhost user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated || !nhostUser?.id) {
        setUser(null);
        setIsRememberMeEnabled(false);
        return;
      }

      setProfileLoading(true);
      try {
        const response = await usersAPI.getUserByNhostUserId(nhostUser.id);

        if (response.success && response.data) {
          const d = response.data;
          setUser({
            id: d.nhost_user_id || nhostUser.id,
            email: d.email || nhostUser.email || '',
            name: d.display_name || nhostUser.displayName || 'User',
            avatar: d.photo_url || nhostUser.avatarUrl || undefined,
            uuid: d.uuid,
            displayName: d.display_name,
            photoUrl: d.photo_url,
            location: d.location,
            about: d.about,
            education: d.education,
            occupation: d.occupation,
            maritalStatus: d.marital_status,
            languages: Array.isArray(d.languages) ? d.languages : [],
            responseTime: d.response_time,
            verified: d.verified || false,
            rating: d.rating || 0,
            reviewCount: d.review_count || 0,
            responseRate: d.response_rate || 0,
            avgResponseTime: d.avg_response_time || 'Not specified',
            totalProperties: d.total_properties || 0,
            totalGuests: d.total_guests || 0,
            userSince: d.created_at,
            phoneNumber: d.phone_number,
            onboarding_complete: d.onboarding_complete || false,
            preferences: parseJSON(d.preferences, {}),
            notificationSettings: parseJSON(d.notification_settings, {}),
            privacySettings: parseJSON(d.privacy_settings, {}),
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          });
        } else {
          // No DB profile row found — auto-create one (covers Google OAuth sign-ups)
          const detectedProvider = nhostUser.avatarUrl?.includes('googleusercontent')
            ? 'google' as const
            : 'email' as const;
          try {
            await usersAPI.createUser({
              nhost_user_id: nhostUser.id,
              display_name: nhostUser.displayName || nhostUser.email?.split('@')[0] || 'User',
              email: nhostUser.email || '',
              photo_url: nhostUser.avatarUrl || undefined,
              auth_provider: detectedProvider,
            });
          } catch (createErr) {
            console.warn('AuthContext: could not auto-create profile row', createErr);
          }
          setUser({
            id: nhostUser.id,
            email: nhostUser.email || '',
            name: nhostUser.displayName || 'User',
            avatar: nhostUser.avatarUrl || undefined,
          });
        }

        const rememberMe = checkRememberMe();
        setIsRememberMeEnabled(rememberMe);
        if (rememberMe) {
          const expiry = Date.now() + 90 * 24 * 60 * 60 * 1000;
          localStorage.setItem('dropiti_session_expiry', expiry.toString());
        }
      } catch (err) {
        console.error('AuthContext: profile load error', err);
        setUser({
          id: nhostUser.id,
          email: nhostUser.email || '',
          name: nhostUser.displayName || 'User',
          avatar: nhostUser.avatarUrl || undefined,
        });
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, nhostUser, checkRememberMe]);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { session, error } = await nhost.auth.signIn({ email, password });

      if (error || !session) {
        const code = (error as { error?: string })?.error || '';
        return { success: false, error: mapAuthError(code) };
      }

      if (rememberMe) {
        localStorage.setItem('dropiti_remember_me', 'true');
      }

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: AUTH_ERRORS.UNEXPECTED_ERROR };
    }
  };

  const loginWithGoogle = async (): Promise<{ error?: string }> => {
    const { error } = await nhost.auth.signIn({ provider: 'google' });
    return { error: error?.message };
  };

  const logout = async () => {
    try {
      localStorage.removeItem('dropiti_remember_me');
      localStorage.removeItem('dropiti_session_expiry');
      setIsRememberMeEnabled(false);
      await nhost.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isLoading = authLoading || profileLoading;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        loginWithGoogle,
        logout,
        isRememberMeEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
