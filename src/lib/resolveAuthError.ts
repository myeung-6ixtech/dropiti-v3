import type { AuthErrorAction, AuthErrorPresentation, ResolveAuthErrorInput } from '@/types/auth-errors';

const SUPPORT_EMAIL = 'support@dropiti.com';

type ErrorDefinition = Omit<AuthErrorPresentation, 'code'>;

const AUTH_ERROR_CATALOG: Record<string, ErrorDefinition> = {
  'unverified-user': {
    title: 'Email not verified',
    message:
      'You previously created an account with this email but have not verified it yet. Check your inbox for the verification link, or sign in with email and password.',
    actions: [
      { type: 'link', label: 'Resend or complete verification', href: '/auth/user-verification' },
      { type: 'link', label: 'Sign in with email', href: '/auth/signin' },
    ],
  },
  'invalid-email-password': {
    title: 'Incorrect sign-in details',
    message: 'The email or password you entered is incorrect. Please check and try again.',
    actions: [
      { type: 'link', label: 'Forgot password?', href: '/auth/reset-password' },
      { type: 'retry_google' },
    ],
  },
  'user-not-found': {
    title: 'Incorrect sign-in details',
    message: 'The email or password you entered is incorrect. Please check and try again.',
    actions: [
      { type: 'link', label: 'Create an account', href: '/auth/signup' },
      { type: 'link', label: 'Forgot password?', href: '/auth/reset-password' },
    ],
  },
  'invalid-email': {
    title: 'Invalid email',
    message: 'Please enter a valid email address and try again.',
    actions: [{ type: 'link', label: 'Back to sign in', href: '/auth/signin' }],
  },
  'disabled-user': {
    title: 'Account disabled',
    message: 'Your account has been disabled. Please contact our support team for help.',
    actions: [{ type: 'contact_support', email: SUPPORT_EMAIL }],
  },
  'disabled-endpoint': {
    title: 'Google sign-in unavailable',
    message: 'Google sign-in is not available right now. Please sign in with your email and password.',
    actions: [{ type: 'link', label: 'Sign in with email', href: '/auth/signin' }],
  },
  'redirectTo-not-allowed': {
    title: 'Sign-in configuration issue',
    message:
      'We could not complete sign-in due to a configuration problem. Please try again later or contact support.',
    actions: [{ type: 'contact_support', email: SUPPORT_EMAIL }],
  },
  'signup-disabled': {
    title: 'Registration closed',
    message: 'New account registration is currently disabled. Please try again later.',
    actions: [{ type: 'link', label: 'Sign in', href: '/auth/signin' }],
  },
  'user-already-exists': {
    title: 'Account already exists',
    message: 'An account with this email already exists. Sign in with your email and password instead.',
    actions: [
      { type: 'link', label: 'Sign in', href: '/auth/signin' },
      { type: 'link', label: 'Forgot password?', href: '/auth/reset-password' },
    ],
  },
  'oauth-token-exchange-failed': {
    title: 'Google sign-in timed out',
    message: 'Your Google sign-in session expired or was interrupted. Please try again.',
    actions: [{ type: 'retry_google' }, { type: 'link', label: 'Sign in with email', href: '/auth/signin' }],
  },
  'oauth-profile-fetch-failed': {
    title: 'Could not load your Google profile',
    message: 'We could not retrieve your Google profile. Please try again in a moment.',
    actions: [{ type: 'retry_google' }, { type: 'link', label: 'Sign in with email', href: '/auth/signin' }],
  },
  'oauth-provider-error': {
    title: 'Google sign-in failed',
    message: 'Google could not complete sign-in. Please try again or use email sign-in.',
    actions: [{ type: 'retry_google' }, { type: 'link', label: 'Sign in with email', href: '/auth/signin' }],
  },
  'provider-account-already-linked': {
    title: 'Google account already linked',
    message: 'This Google account is already linked to another Dropiti account. Sign in to that account instead.',
    actions: [{ type: 'link', label: 'Sign in', href: '/auth/signin' }],
  },
  'internal-server-error': {
    title: "We couldn't finish signing you in",
    message:
      'Something went wrong on our side while connecting your account. Please try again in a minute. If it keeps happening, sign in with email or contact support.',
    actions: [
      { type: 'retry_google' },
      { type: 'link', label: 'Sign in with email', href: '/auth/signin' },
      { type: 'contact_support', email: SUPPORT_EMAIL },
    ],
  },
  'invalid-state': {
    title: 'Sign-in session expired',
    message: 'Your sign-in session expired for security reasons. Please try again.',
    actions: [{ type: 'retry_google' }, { type: 'link', label: 'Sign in with email', href: '/auth/signin' }],
  },
  'too-many-requests': {
    title: 'Too many attempts',
    message: 'Too many sign-in attempts. Please wait a few minutes and try again.',
    actions: [{ type: 'link', label: 'Back to sign in', href: '/auth/signin' }],
  },
  'oauth-session-timeout': {
    title: 'Sign-in took too long',
    message:
      'Sign-in did not complete in time. This can happen if cookies are blocked or a browser extension interferes. Try again, allow cookies for this site, or sign in with email.',
    actions: [
      { type: 'retry_google' },
      { type: 'link', label: 'Sign in with email', href: '/auth/signin' },
    ],
  },
  unknown: {
    title: 'Sign-in failed',
    message: 'We could not sign you in. Please try again or use email sign-in.',
    actions: [
      { type: 'retry_google' },
      { type: 'link', label: 'Sign in with email', href: '/auth/signin' },
      { type: 'contact_support', email: SUPPORT_EMAIL },
    ],
  },
};

/** Returns true if text looks like a technical/server message unsuitable for end users. */
function isTechnicalDescription(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('internal') ||
    lower.includes('graphql') ||
    lower.includes('hasura') ||
    lower.includes('stack') ||
    lower.includes('undefined') ||
    /^[a-z-]+:\s/.test(lower)
  );
}

function normalizeCode(input: ResolveAuthErrorInput): string {
  const raw = input.code?.trim();
  if (raw === 'email-not-verified') return 'unverified-user';
  if (raw) return raw;

  const msg = input.message?.trim().toLowerCase() ?? '';
  if (msg.includes('unverified') || msg.includes('not verified')) return 'unverified-user';
  if (msg.includes('invalid') && (msg.includes('password') || msg.includes('credential'))) {
    return 'invalid-email-password';
  }
  if (msg.includes('disabled')) return 'disabled-user';
  if (msg.includes('too many')) return 'too-many-requests';

  return 'unknown';
}

/**
 * Resolve any Nhost auth error into a user-facing presentation.
 * Never exposes raw error codes in the message (logged in dev only).
 */
export function resolveAuthError(input: ResolveAuthErrorInput): AuthErrorPresentation {
  const code = normalizeCode(input);

  if (input.description && isTechnicalDescription(input.description)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Auth] error description (not shown to user):', input.description);
    }
  }

  if (process.env.NODE_ENV === 'development' && code !== 'unknown') {
    console.warn('[Auth] resolved error code:', code, input.description ?? '');
  }

  const definition = AUTH_ERROR_CATALOG[code] ?? AUTH_ERROR_CATALOG.unknown;

  return {
    code,
    title: definition.title,
    message: definition.message,
    actions: definition.actions,
  };
}

/** @deprecated Use resolveAuthError — kept for backward compatibility */
export function mapNhostOAuthError(code: string): string {
  return resolveAuthError({ code }).message;
}
