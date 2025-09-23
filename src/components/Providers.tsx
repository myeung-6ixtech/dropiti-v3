'use client';

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { LanguageProvider } from "@/context/LanguageContext";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <AuthProvider>
          <ToastProvider>
            <LanguageProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </LanguageProvider>
          </ToastProvider>
        </AuthProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
