"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuthenticationStatus, useUserData } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { usersAPI } from "@/lib/api-client";
import { nhost } from "@/lib/nhost";
import { nhostAuthService } from "@/services/auth/nhostAuthService";
import { AUTH_ERRORS } from "@/types/error-messages";
import { getCallbackUrlFromSearch } from "@/lib/oauthCallback";
import { resolveAuthError } from "@/lib/resolveAuthError";
import type { AuthErrorPresentation } from "@/types/auth-errors";

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
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{
    success: boolean;
    error?: string;
    errorCode?: string;
    presentation?: AuthErrorPresentation;
  }>;
  loginWithGoogle: () => void;
  logout: () => void;
  isRememberMeEnabled: boolean;
  authWarning: string | null;
  clearAuthWarning: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const PROFILE_SETUP_WARNING =
  "Your account is signed in but we couldn't finish setting up your profile. Refresh the page or contact support if this continues.";

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
  const [authWarning, setAuthWarning] = useState<string | null>(null);
  const router = useRouter();

  const clearAuthWarning = useCallback(() => setAuthWarning(null), []);

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
        setAuthWarning(null);
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
          let profileCreated = false;
          try {
            const createResponse = await usersAPI.createUser({
              nhost_user_id: nhostUser.id,
              display_name: nhostUser.displayName || nhostUser.email?.split('@')[0] || 'User',
              email: nhostUser.email || '',
              photo_url: nhostUser.avatarUrl || undefined,
              auth_provider: detectedProvider,
            });
            profileCreated = createResponse.success;
          } catch (createErr) {
            console.warn('AuthContext: could not auto-create profile row', createErr);
          }
          if (!profileCreated) {
            setAuthWarning(PROFILE_SETUP_WARNING);
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
        setAuthWarning(PROFILE_SETUP_WARNING);
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
  ) => {
    try {
      const { session, error } = await nhost.auth.signIn({ email, password });

      if (error || !session) {
        const presentation = resolveAuthError({
          code: (error as { error?: string })?.error,
          message: (error as { message?: string })?.message,
        });
        return {
          success: false,
          error: presentation.message,
          errorCode: presentation.code,
          presentation,
        };
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

  const loginWithGoogle = (): void => {
    const callbackUrl =
      typeof window !== 'undefined' ? getCallbackUrlFromSearch() : '/dashboard';
    nhostAuthService.signInWithGoogle(callbackUrl);
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
        authWarning,
        clearAuthWarning,
      }}
    >
      {authWarning && (
        <div
          className="fixed top-0 left-0 right-0 z-[9998] bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
            <p>{authWarning}</p>
            <button
              type="button"
              onClick={clearAuthWarning}
              className="shrink-0 text-amber-700 hover:text-amber-900 font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};
