'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStatus } from '@nhost/nextjs';
import { resolveAuthError } from '@/lib/resolveAuthError';
import {
  clearOAuthCallbackUrl,
  getOAuthCallbackUrl,
  setOAuthErrorPresentation,
  stripOAuthParamsFromUrl,
} from '@/lib/oauthCallback';

const OAUTH_SESSION_TIMEOUT_MS = 15_000;

/**
 * Handles Nhost Google OAuth return: ?error= failures and ?refreshToken= success.
 */
export default function OAuthCallbackHandler() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const handledRef = useRef(false);
  const errorHandledRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    // ── Rule 5a: Handle OAuth errors FIRST ──────────────────────────────────
    const errorCode = params.get('error');
    if (errorCode && !errorHandledRef.current) {
      errorHandledRef.current = true;
      setIsSigningIn(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      stripOAuthParamsFromUrl();

      const presentation = resolveAuthError({
        code: errorCode,
        description: params.get('errorDescription'),
      });
      setOAuthErrorPresentation(presentation);
      clearOAuthCallbackUrl();

      router.replace('/auth/signin?oauth_error=1');
      return;
    }

    // ── Rule 5b: Handle success ─────────────────────────────────────────────
    if (!params.has('refreshToken')) {
      setIsSigningIn(false);
      return;
    }

    setIsSigningIn(true);

    if (handledRef.current) return;

    // Timeout if session never hydrates (cookies blocked, SDK failure, etc.)
    if (!timeoutRef.current && !errorHandledRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (handledRef.current || errorHandledRef.current) return;
        errorHandledRef.current = true;
        setIsSigningIn(false);

        stripOAuthParamsFromUrl();
        const presentation = resolveAuthError({ code: 'oauth-session-timeout' });
        setOAuthErrorPresentation(presentation);
        clearOAuthCallbackUrl();
        router.replace('/auth/signin?oauth_error=1');
      }, OAUTH_SESSION_TIMEOUT_MS);
    }

    if (isLoading) return;

    if (isAuthenticated) {
      handledRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsSigningIn(false);
      stripOAuthParamsFromUrl();
      const destination = getOAuthCallbackUrl();
      clearOAuthCallbackUrl();
      router.replace(destination);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAuthenticated, isLoading, router]);

  if (!isSigningIn) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Signing in"
    >
      <div className="text-center px-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-gray-700 text-sm font-medium">Signing you in&hellip;</p>
      </div>
    </div>
  );
}
