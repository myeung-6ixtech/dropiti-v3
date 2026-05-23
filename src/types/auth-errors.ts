/**
 * Structured auth errors for user-facing UI (sign-in, OAuth callback, etc.)
 */

export type AuthErrorAction =
  | { type: 'link'; label: string; href: string }
  | { type: 'retry_google' }
  | { type: 'contact_support'; email?: string };

export interface AuthErrorPresentation {
  code: string;
  title: string;
  message: string;
  actions: AuthErrorAction[];
}

export interface ResolveAuthErrorInput {
  /** Nhost hasura-auth error code (e.g. unverified-user) */
  code?: string | null;
  /** Optional errorDescription from OAuth redirect — logged only, not shown raw */
  description?: string | null;
  /** Nhost SDK message field */
  message?: string | null;
}
