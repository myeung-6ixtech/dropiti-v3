'use client';

import { NhostProvider } from "@nhost/nextjs";
import { nhost } from "@/lib/nhost";
import VerificationRedirect from "@/components/auth/VerificationRedirect";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { MobileChatProvider } from "@/context/MobileChatContext";
import { MobileNotificationsProvider } from "@/context/MobileNotificationsContext";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <NhostProvider nhost={nhost}>
        <VerificationRedirect>
        <AuthProvider>
          <ToastProvider>
            <LanguageProvider>
              <SidebarProvider>
                <MobileChatProvider>
                  <MobileNotificationsProvider>
                    {children}
                </MobileNotificationsProvider>
              </MobileChatProvider>
            </SidebarProvider>
          </LanguageProvider>
        </ToastProvider>
      </AuthProvider>
        </VerificationRedirect>
    </NhostProvider>
    </ErrorBoundary>
  );
}
