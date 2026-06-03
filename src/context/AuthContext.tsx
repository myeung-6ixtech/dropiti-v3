"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuthenticationStatus, useUserData } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { nhost } from "@/lib/nhost";
import { nhostAuthService } from "@/services/auth/nhostAuthService";
import { AUTH_ERRORS } from "@/types/error-messages";
import { getCallbackUrlFromSearch } from "@/lib/oauthCallback";
import { resolveAuthError } from "@/lib/resolveAuthError";
import type { AuthErrorPresentation } from "@/types/auth-errors";
import {
  buildProfileInputFromNhostUser,
  ensureUserProfile,
  mapDbUserToAuthUser,
} from "@/lib/ensureUserProfile";
import { clearSessionCookie, syncSessionCookie } from "@/lib/sync-session-cookie";
import { useClientMounted } from "@/hooks/useClientMounted";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mounted = useClientMounted();
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
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      try {
        await syncSessionCookie();

        const ensureResult = await ensureUserProfile(buildProfileInputFromNhostUser(nhostUser));

        if (ensureResult.ok) {
          setUser(mapDbUserToAuthUser(ensureResult.data, nhostUser));
          setAuthWarning(null);
        } else {
          console.warn('AuthContext: ensureUserProfile failed', ensureResult.error);
          setAuthWarning(PROFILE_SETUP_WARNING);
          setUser({
            id: nhostUser.id,
            email: nhostUser.email || '',
            name: nhostUser.displayName || 'User',
            avatar: nhostUser.avatarUrl || undefined,
            onboarding_complete: false,
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
          onboarding_complete: false,
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

      await syncSessionCookie();

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
      await clearSessionCookie();
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
      {mounted && authWarning && (
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
