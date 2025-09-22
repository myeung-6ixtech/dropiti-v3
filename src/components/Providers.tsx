'use client';

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { LanguageProvider } from "@/context/LanguageContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
