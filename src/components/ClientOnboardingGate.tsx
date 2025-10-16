'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const EXCLUDED_PATHS = ['/onboarding', '/auth/signin', '/auth/register'];

export default function ClientOnboardingGate({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check if onboarding bypass is enabled (for development)
  const bypassOnboarding = process.env.NEXT_PUBLIC_BYPASS_ONBOARDING === 'true';

  useEffect(() => {
    // Don't redirect if still loading or not authenticated
    if (isLoading || !isAuthenticated || !user) return;

    // Check if current path is excluded from onboarding redirect
    const isExcluded = EXCLUDED_PATHS.some((path) => 
      pathname === path || pathname.startsWith(`${path}/`)
    );

    // Skip onboarding redirect if bypass is enabled
    if (bypassOnboarding) return;

    // Redirect to onboarding if user hasn't completed it and not on excluded path
    if (!user.onboarding_complete && !isExcluded) {
      router.replace('/onboarding');
    }
  }, [isLoading, isAuthenticated, user, pathname, router, bypassOnboarding]);

  return <>{children}</>;
}
