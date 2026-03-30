'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStatus } from '@nhost/nextjs';

/**
 * Headless component mounted globally. When Nhost redirects back from Google
 * OAuth it appends `?refreshToken=...` to the origin URL. This component:
 *  1. Detects that param.
 *  2. Waits for the SDK to hydrate the session (isAuthenticated).
 *  3. Strips the token from the URL (no browser-history entry).
 *  4. Routes to the post-auth destination stored in sessionStorage.
 */
export default function OAuthCallbackHandler() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const handledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (!params.has('refreshToken')) return;
    if (handledRef.current) return;
    if (isLoading) return;

    if (isAuthenticated) {
      handledRef.current = true;
      window.history.replaceState({}, '', window.location.pathname);
      const destination = sessionStorage.getItem('oauth_callback_url') || '/dashboard';
      sessionStorage.removeItem('oauth_callback_url');
      router.push(destination);
    }
  }, [isAuthenticated, isLoading, router]);

  return null;
}
