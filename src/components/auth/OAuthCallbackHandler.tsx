'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStatus } from '@nhost/nextjs';
import { mapNhostOAuthError } from '@/types/error-messages';
import {
  clearOAuthCallbackUrl,
  getOAuthCallbackUrl,
  setOAuthError,
  stripOAuthParamsFromUrl,
} from '@/lib/oauthCallback';

/**
 * Headless component mounted globally. When Nhost redirects back from Google
 * OAuth it appends either `?refreshToken=...` (success) or `?error=...`
 * (failure) to the origin URL. This component:
 *  1. Handles ?error= first (Rule 5) — stores message and routes to sign-in.
 *  2. On success, waits for session hydration, strips the URL, routes to
 *     the post-auth destination stored in sessionStorage.
 */
export default function OAuthCallbackHandler() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const handledRef = useRef(false);
  const errorHandledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    // ── Rule 5a: Handle OAuth errors FIRST ──────────────────────────────────
    const errorCode = params.get('error');
    if (errorCode && !errorHandledRef.current) {
      errorHandledRef.current = true;
      stripOAuthParamsFromUrl();

      const userMessage = mapNhostOAuthError(errorCode);
      setOAuthError(userMessage, errorCode);
      clearOAuthCallbackUrl();

      router.replace('/auth/signin?oauth_error=1');
      return;
    }

    // ── Rule 5b: Handle success ─────────────────────────────────────────────
    if (!params.has('refreshToken')) return;
    if (handledRef.current) return;
    if (isLoading) return;

    if (isAuthenticated) {
      handledRef.current = true;
      stripOAuthParamsFromUrl();
      const destination = getOAuthCallbackUrl();
      clearOAuthCallbackUrl();
      router.replace(destination);
    }
  }, [isAuthenticated, isLoading, router]);

  return null;
}
