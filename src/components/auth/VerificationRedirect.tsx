'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthenticationStatus, useUserData } from '@nhost/nextjs';
import { hasOAuthCallbackParams } from '@/lib/oauthCallback';

const USER_VERIFICATION_PATH = '/auth/user-verification';

const EXCLUDED_PATH_PREFIXES = [
  USER_VERIFICATION_PATH,
  '/transfer-ownership',
];

/**
 * Redirects authenticated users with unverified email to the user-verification page.
 * Google OAuth users have emailVerified=true — only redirect when explicitly false.
 */
export default function VerificationRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const nhostUser = useUserData();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !nhostUser) return;

    // Rule 8: Google users and unknown state must not be redirected
    if (nhostUser.emailVerified !== false) return;

    if (hasOAuthCallbackParams()) return;

    const isExcluded = EXCLUDED_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    if (isExcluded) return;

    if (pathname === USER_VERIFICATION_PATH) return;

    router.replace(USER_VERIFICATION_PATH);
  }, [isAuthenticated, isLoading, nhostUser, pathname, router]);

  return <>{children}</>;
}
