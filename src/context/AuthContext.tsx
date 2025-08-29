"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usersAPI } from "@/lib/api-client";

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
      } catch (error) {
        console.warn('Failed to parse languages JSON:', error);
        return [];
      }
    }
    
    return [];
  };

  // Utility function to check if session is about to expire
  const checkSessionExpiry = useCallback(() => {
    if (!isAuthenticated || !isRememberMeEnabled) return;
    
    // Check if session will expire in the next 24 hours
    // This is a simplified check - in a real app you might want to check the actual JWT expiration
    // const sessionWarningThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // For now, we'll just log this - you could integrate with a toast notification system
    console.log('Session expiry check - Remember me enabled:', isRememberMeEnabled);
  }, [isAuthenticated, isRememberMeEnabled]);

  // Fetch user profile data from database when session changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === 'loading') return;
      
      if (session?.user?.id) {
        try {
          console.log('AuthContext: Fetching user profile for:', session.user.id);
          
          // Check if remember me is enabled from localStorage
          const savedRememberMe = localStorage.getItem('dropiti_remember_me');
          setIsRememberMeEnabled(savedRememberMe === 'true');
          
          // Fetch user data from our database using the Firebase UID
          const response = await usersAPI.getUserByFirebaseUid(session.user.id);
          
          if (response.success && response.data) {
            const userData = response.data;
            console.log('AuthContext: User profile fetched:', userData);
            
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: userData.display_name || session.user.name || 'User',
              avatar: userData.photo_url || session.user.image || '/images/Portrait_Placeholder.png',
              // Additional user profile fields
              uuid: userData.uuid,
              displayName: userData.display_name,
              photoUrl: userData.photo_url || '/images/Portrait_Placeholder.png',
              location: userData.location,
              about: userData.about,
              education: userData.education,
              occupation: userData.occupation,
              maritalStatus: userData.marital_status,
              languages: parseLanguages(userData.languages),
              responseTime: userData.response_time,
              verified: userData.verified,
              rating: userData.rating,
              reviewCount: userData.review_count,
              responseRate: userData.response_rate,
              avgResponseTime: userData.avg_response_time,
              totalProperties: userData.total_properties,
              totalGuests: userData.total_guests,
              userSince: userData.user_since,
              phoneNumber: userData.phone_number,
              preferences: userData.preferences,
              notificationSettings: userData.notification_settings,
              privacySettings: userData.privacy_settings,
              createdAt: userData.created_at,
              updatedAt: userData.updated_at,
            });
            
            setIsAuthenticated(true);
          } else {
            console.warn('AuthContext: Failed to fetch user profile, using session data');
            // Fallback to session data if database fetch fails
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.name || 'User',
              avatar: session.user.image || '/images/Portrait_Placeholder.png',
              // Additional user profile fields with defaults
              uuid: undefined,
              displayName: session.user.name || 'User',
              photoUrl: session.user.image || '/images/Portrait_Placeholder.png',
              location: undefined,
              about: undefined,
              education: undefined,
              occupation: undefined,
              maritalStatus: undefined,
              languages: [],
              responseTime: undefined,
              verified: false,
              rating: 0,
              reviewCount: 0,
              responseRate: 0,
              avgResponseTime: undefined,
              totalProperties: 0,
              totalGuests: 0,
              userSince: undefined,
              phoneNumber: undefined,
              preferences: undefined,
              notificationSettings: undefined,
              privacySettings: undefined,
              createdAt: undefined,
              updatedAt: undefined,
            });
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('AuthContext: Error fetching user profile:', error);
          // Fallback to session data if there's an error
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.name || 'User',
            avatar: session.user.image || '/images/Portrait_Placeholder.png',
            // Additional user profile fields with defaults
            uuid: undefined,
            displayName: session.user.name || 'User',
            photoUrl: session.user.image || '/images/Portrait_Placeholder.png',
            location: undefined,
            about: undefined,
            education: undefined,
            occupation: undefined,
            maritalStatus: undefined,
            languages: [],
            responseTime: undefined,
            verified: false,
            rating: 0,
            reviewCount: 0,
            responseRate: 0,
            avgResponseTime: undefined,
            totalProperties: 0,
            totalGuests: 0,
            userSince: undefined,
            phoneNumber: undefined,
            preferences: undefined,
            notificationSettings: undefined,
            privacySettings: undefined,
            createdAt: undefined,
            updatedAt: undefined,
          });
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsRememberMeEnabled(false);
      }
    };

    fetchUserProfile();
  }, [session, status]);

  // Periodically check session expiry for remember me users
  useEffect(() => {
    if (!isAuthenticated || !isRememberMeEnabled) return;
    
    const interval = setInterval(() => {
      checkSessionExpiry();
    }, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(interval);
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
        return { success: false, error: result.error };
      }

      // If remember me is enabled, we'll handle the session duration in the NextAuth config
      // The actual session duration is controlled by the NextAuth session.maxAge setting
      console.log('Login successful, remember me:', rememberMe);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
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