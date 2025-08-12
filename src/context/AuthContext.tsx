"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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

  // Fetch user profile data from database when session changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === 'loading') return;
      
      if (session?.user?.id) {
        try {
          console.log('AuthContext: Fetching user profile for:', session.user.id);
          
          // Fetch user data from our database using the Firebase UID
          const response = await usersAPI.getUserByFirebaseUid(session.user.id);
          
          if (response.success && response.data) {
            const userData = response.data;
            console.log('AuthContext: User profile fetched:', userData);
            
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: userData.display_name || session.user.name || 'User',
              avatar: userData.photo_url || session.user.image || undefined,
              // Additional user profile fields
              uuid: userData.uuid,
              displayName: userData.display_name,
              photoUrl: userData.photo_url,
              location: userData.location,
              about: userData.about,
              education: userData.education,
              occupation: userData.occupation,
              maritalStatus: userData.marital_status,
              languages: userData.languages,
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
              avatar: session.user.image || undefined,
              // Additional user profile fields with defaults
              uuid: undefined,
              displayName: session.user.name || 'User',
              photoUrl: session.user.image,
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
            avatar: session.user.image || undefined,
            // Additional user profile fields with defaults
            uuid: undefined,
            displayName: session.user.name || 'User',
            photoUrl: session.user.image,
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
      }
    };

    fetchUserProfile();
  }, [session, status]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const logout = async () => {
    try {
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};