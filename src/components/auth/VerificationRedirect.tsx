'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthenticationStatus, useUserData } from '@nhost/nextjs';

const USER_VERIFICATION_PATH = '/auth/user-verification';

/**
 * Redirects authenticated users with unverified email to the user-verification page.
 * Renders children unchanged when no redirect is needed.
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
    // Already verified — no redirect
    if (nhostUser.emailVerified) return;
    // Already on the verification page — don't redirect
    if (pathname === USER_VERIFICATION_PATH) return;

    router.replace(USER_VERIFICATION_PATH);
  }, [isAuthenticated, isLoading, nhostUser, pathname, router]);

  return <>{children}</>;
}
