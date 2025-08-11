"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
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
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user) {
      setIsAuthenticated(true);
      setUser(session.user);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
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
      router.push("/auth/signin");
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