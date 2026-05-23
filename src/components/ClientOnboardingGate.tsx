'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { hasOAuthCallbackParams } from '@/lib/oauthCallback';

const EXCLUDED_PATHS = [
  '/onboarding',
  '/auth/signin',
  '/auth/signup',
  '/auth/user-verification',
  '/transfer-ownership',
];

export default function ClientOnboardingGate({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const bypassOnboarding = process.env.NEXT_PUBLIC_BYPASS_ONBOARDING === 'true';

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    // Rule 9: Do not redirect while OAuth callback is still in the URL
    if (hasOAuthCallbackParams()) return;

    const isExcluded = EXCLUDED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (bypassOnboarding) return;

    if (!user.onboarding_complete && !isExcluded) {
      router.replace('/onboarding');
    }
  }, [isLoading, isAuthenticated, user, pathname, router, bypassOnboarding]);

  return <>{children}</>;
}
