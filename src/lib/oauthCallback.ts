/**
 * Shared helpers for Google OAuth callback handling (client-side only).
 */

import type { AuthErrorPresentation } from '@/types/auth-errors';

export const OAUTH_CALLBACK_URL_KEY = 'oauth_callback_url';
export const OAUTH_ERROR_KEY = 'oauth_error';
export const OAUTH_ERROR_CODE_KEY = 'oauth_error_code';
export const OAUTH_ERROR_PRESENTATION_KEY = 'oauth_error_presentation';

const DEFAULT_POST_AUTH_PATH = '/dashboard';

/**
 * Returns true if the URL still has OAuth callback query params
 * (success or failure) that must be processed before other gates run.
 */
export function hasOAuthCallbackParams(search?: string): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(search ?? window.location.search);
  return params.has('refreshToken') || params.has('error');
}

/**
 * Accept only same-origin relative paths to prevent open redirects.
 */
export function sanitizeCallbackPath(path: string | null | undefined): string {
  if (!path || typeof path !== 'string') return DEFAULT_POST_AUTH_PATH;
  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_POST_AUTH_PATH;
  }
  if (trimmed.includes('://')) return DEFAULT_POST_AUTH_PATH;
  return trimmed;
}

/** Read callbackUrl from the current page query string. */
export function getCallbackUrlFromSearch(search?: string): string {
  if (typeof window === 'undefined') return DEFAULT_POST_AUTH_PATH;
  const params = new URLSearchParams(search ?? window.location.search);
  return sanitizeCallbackPath(params.get('callbackUrl'));
}

export function setOAuthCallbackUrl(path: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(OAUTH_CALLBACK_URL_KEY, sanitizeCallbackPath(path));
}

export function getOAuthCallbackUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_POST_AUTH_PATH;
  return sanitizeCallbackPath(sessionStorage.getItem(OAUTH_CALLBACK_URL_KEY));
}

export function clearOAuthCallbackUrl(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(OAUTH_CALLBACK_URL_KEY);
}

/** Store structured auth error for sign-in / sign-up pages. */
export function setOAuthErrorPresentation(presentation: AuthErrorPresentation): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(OAUTH_ERROR_KEY, presentation.message);
  sessionStorage.setItem(OAUTH_ERROR_CODE_KEY, presentation.code);
  sessionStorage.setItem(OAUTH_ERROR_PRESENTATION_KEY, JSON.stringify(presentation));
}

/** @deprecated Prefer setOAuthErrorPresentation */
export function setOAuthError(message: string, code?: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(OAUTH_ERROR_KEY, message);
  if (code) {
    sessionStorage.setItem(OAUTH_ERROR_CODE_KEY, code);
  } else {
    sessionStorage.removeItem(OAUTH_ERROR_CODE_KEY);
  }
  sessionStorage.removeItem(OAUTH_ERROR_PRESENTATION_KEY);
}

export function consumeOAuthErrorPresentation(): AuthErrorPresentation | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(OAUTH_ERROR_PRESENTATION_KEY);
  const message = sessionStorage.getItem(OAUTH_ERROR_KEY);
  const code = sessionStorage.getItem(OAUTH_ERROR_CODE_KEY);

  sessionStorage.removeItem(OAUTH_ERROR_PRESENTATION_KEY);
  sessionStorage.removeItem(OAUTH_ERROR_KEY);
  sessionStorage.removeItem(OAUTH_ERROR_CODE_KEY);

  if (raw) {
    try {
      return JSON.parse(raw) as AuthErrorPresentation;
    } catch {
      // fall through to legacy keys
    }
  }

  if (!message) return null;

  return {
    code: code ?? 'unknown',
    title: 'Sign-in failed',
    message,
    actions: [],
  };
}

/** @deprecated Use consumeOAuthErrorPresentation */
export function consumeOAuthError(): { message: string; code: string | null } | null {
  const presentation = consumeOAuthErrorPresentation();
  if (!presentation) return null;
  return { message: presentation.message, code: presentation.code };
}

/** Parse ?error= from URL as backup when sessionStorage was cleared. */
export function getOAuthErrorFromUrl(search?: string): { code: string; description: string | null } | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(search ?? window.location.search);
  const code = params.get('error');
  if (!code) return null;
  return { code, description: params.get('errorDescription') };
}

/** Strip OAuth query params from the current URL without navigation. */
export function stripOAuthParamsFromUrl(): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, '', window.location.pathname);
}
