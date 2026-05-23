/**
 * Shared helpers for Google OAuth callback handling (client-side only).
 */

export const OAUTH_CALLBACK_URL_KEY = 'oauth_callback_url';
export const OAUTH_ERROR_KEY = 'oauth_error';
export const OAUTH_ERROR_CODE_KEY = 'oauth_error_code';

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

export function setOAuthError(message: string, code?: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(OAUTH_ERROR_KEY, message);
  if (code) {
    sessionStorage.setItem(OAUTH_ERROR_CODE_KEY, code);
  } else {
    sessionStorage.removeItem(OAUTH_ERROR_CODE_KEY);
  }
}

export function consumeOAuthError(): { message: string; code: string | null } | null {
  if (typeof window === 'undefined') return null;
  const message = sessionStorage.getItem(OAUTH_ERROR_KEY);
  if (!message) return null;
  const code = sessionStorage.getItem(OAUTH_ERROR_CODE_KEY);
  sessionStorage.removeItem(OAUTH_ERROR_KEY);
  sessionStorage.removeItem(OAUTH_ERROR_CODE_KEY);
  return { message, code };
}

/** Strip OAuth query params from the current URL without navigation. */
export function stripOAuthParamsFromUrl(): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, '', window.location.pathname);
}
