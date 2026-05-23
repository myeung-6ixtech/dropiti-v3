# google_auth.md (v1) — Nhost Google OAuth: Correct Implementation & Error Handling

> **Format:** AI rule guide. Every section is written as an enforceable rule with rationale, implementation, and the specific error it prevents. Apply this guide to both `dropiti-v3` and `tastyplates-v2` — they share identical architecture.
>
> **Grounded in:** The actual error log from `dropiti.com` on 2026-05-23, the complete source of both repositories, and the Nhost `hasura-auth` error code registry.

---

## Prologue — Read the error log first

The error that triggered this document:

```json
{
  "level": "ERROR",
  "msg": "error getting user by email",
  "error": "API error: unverified-user",
  "request": {
    "url": "/v1/signin/provider/google/callback?state=...",
    "method": "GET"
  }
}
```

**What this tells you, precisely:**

- The request URL is `/v1/signin/provider/google/callback` — this is Nhost's server receiving Google's code after consent
- The error fires **server-side inside `hasura-auth`**, not in your Next.js code
- `"error getting user by email"` means Nhost looked up the Google email in `auth.users`, found a row, and then hit `unverified-user` — meaning the row exists but `email_verified = false`
- **Root cause:** A user previously registered via email/password, never verified their email, and is now trying to sign in via Google with the same email address. Nhost finds the unverified account and blocks the OAuth sign-in

This is different from a brand new user. A brand new Google user (no prior account) succeeds because Google OAuth marks the email as verified by definition. The failure is specifically when there is a **pre-existing unverified email/password account** with that email.

---

## Rule 1 — Configure `AUTH_EMAIL_SIGNIN_EMAIL_VERIFIED_REQUIRED`

### The rule

> **Set `AUTH_EMAIL_SIGNIN_EMAIL_VERIFIED_REQUIRED=false` in Nhost environment variables during development and for Google OAuth users. In production, handle the unverified state gracefully in code rather than blocking at the auth layer.**

### Why

By default, `hasura-auth` requires email verification before any sign-in. When a user previously signed up with email/password and never clicked the verification link, their account exists with `email_verified = false`. When they then try Google OAuth with that same email, Nhost finds the unverified account and returns `unverified-user` on the OAuth callback — before your frontend ever sees a `?refreshToken=`.

The `AUTH_EMAIL_SIGNIN_EMAIL_VERIFIED_REQUIRED` environment variable controls this behaviour. Setting it to `false` allows sign-in regardless of email verification status, letting you handle the gate in application code instead.

### Where to set it

**Nhost Dashboard** → your project → **Settings** → **Environment variables** → Add:

```
AUTH_EMAIL_SIGNIN_EMAIL_VERIFIED_REQUIRED = false
```

Or in `nhost.toml` if you have a connected repo:

```toml
[auth.email]
emailVerificationRequired = false
```

> **Important:** Setting this to `false` does not disable email verification entirely — it only removes the hard block at sign-in. You still send and enforce verification through your application logic (see Rule 5).

### Errors this prevents

- `unverified-user` on `/v1/signin/provider/google/callback` for users with pre-existing unverified accounts

---

## Rule 2 — The Google provider URL must use exactly `window.location.origin`

### The rule

> **Always build `redirectTo` as `window.location.origin` — no path, no trailing slash, no extra segments. Never accept `redirectTo` as a parameter from the caller.**

### Why

Nhost performs an **exact string match** of `redirectTo` against the Allowed Redirect URLs configured in the dashboard. Any deviation — including a trailing slash — causes `redirectTo-not-allowed` and the OAuth flow never starts.

`window.location.origin` always returns the correct value for the current environment:
- `http://localhost:3000` in development
- `https://dropiti.com` in production
- `https://dropiti-xyz.vercel.app` on preview deploys

Callers must never pass a path to this function because they will introduce mismatches.

### Implementation — `nhostAuthService.ts` (both projects)

```ts
// ✅ CORRECT
signInWithGoogle(callbackUrl: string = '/dashboard'): void {
  if (typeof window === 'undefined') return;

  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
  const region    = process.env.NEXT_PUBLIC_NHOST_REGION;

  if (!subdomain || !region) {
    console.error('[Auth] Missing NHOST env vars');
    return;
  }

  // Store the intended destination for OAuthCallbackHandler
  sessionStorage.setItem('oauth_callback_url', callbackUrl);

  // RULE: bare origin only — no path, no trailing slash
  const redirectTo = window.location.origin;

  const url =
    `https://${subdomain}.auth.${region}.nhost.run/v1/signin/provider/google` +
    `?redirectTo=${encodeURIComponent(redirectTo)}` +
    `&options[authorizationParams][prompt]=select_account`;

  window.location.assign(url);
}

// ❌ WRONG — never do these:
// const redirectTo = window.location.origin + '/';           // trailing slash
// const redirectTo = window.location.origin + callbackUrl;  // path appended
// const redirectTo = redirectTo || window.location.origin;  // accepting external value
```

### Errors this prevents

- `redirectTo-not-allowed` (status 400)
- Silent OAuth failure when dashboard has `https://dropiti.com` but code sends `https://dropiti.com/`

---

## Rule 3 — The Nhost Dashboard must have every origin in Allowed Redirect URLs

### The rule

> **Add every URL that `window.location.origin` can ever return to the Nhost Dashboard Allowed Redirect URLs. This must be done before testing any environment.**

### Required entries — Dropiti

```
# Client URL (single field — no trailing slash)
https://dropiti.com

# Allowed Redirect URLs (one per line)
http://localhost:3000
http://localhost:3001
https://dropiti.com
https://www.dropiti.com
https://*.vercel.app
```

### Required entries — Tastyplates

```
# Client URL
https://tastyplates.co

# Allowed Redirect URLs
http://localhost:3000
http://localhost:3001
https://tastyplates.co
https://www.tastyplates.co
https://*.vercel.app
```

**Also add for password reset and email verification flows:**

```
http://localhost:3000/auth/user-verification
https://dropiti.com/auth/user-verification
https://dropiti.com/reset-password
http://localhost:3000/reset-password
```

### Errors this prevents

- `redirectTo-not-allowed` on any environment not in the list
- `redirectTo-not-allowed` on Vercel preview deployments (covered by wildcard)

---

## Rule 4 — The Google Cloud Console must have the Nhost callback URI

### The rule

> **The Authorized Redirect URI in Google Cloud Console must be the Nhost server callback URL — not your frontend URL.**

### The two URIs to configure

Google Cloud Console → Credentials → your OAuth Client ID:

**Authorized JavaScript origins** (your frontend — allows the consent screen to reference your domain):
```
http://localhost:3000
https://dropiti.com
https://www.dropiti.com
```

**Authorized redirect URIs** (where Google sends the auth code — this is Nhost, not your frontend):
```
https://<subdomain>.auth.<region>.nhost.run/v1/signin/provider/google/callback
```

> The callback URI is shown verbatim inside the Nhost Dashboard when you open the Google provider settings. Copy it from there exactly.

### Errors this prevents

- `Error 400: redirect_uri_mismatch` from Google
- `oauth-token-exchange-failed` in Nhost logs

---

## Rule 5 — `OAuthCallbackHandler` must handle the `?error=` query parameter

### The rule

> **`OAuthCallbackHandler` must check for `?error=` before checking for `?refreshToken=`. If an error is present, clean the URL and show a user-facing message. Never silently ignore error params.**

### Why

When Nhost encounters `unverified-user`, `disabled-user`, `oauth-provider-error`, or any other server-side failure during the OAuth callback, it redirects back to your `redirectTo` URL with `?error=<code>&errorDescription=<message>`. If `OAuthCallbackHandler` only watches for `?refreshToken=`, these failures become invisible — the user lands on your homepage with no feedback.

### Implementation — `OAuthCallbackHandler.tsx` (both projects)

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStatus } from '@nhost/nextjs';

// Maps Nhost hasura-auth error codes to user-facing messages
const NHOST_OAUTH_ERRORS: Record<string, string> = {
  'unverified-user':
    'This email address has not been verified. Please check your inbox and verify your email before signing in with Google.',
  'disabled-user':
    'Your account has been disabled. Please contact support.',
  'disabled-endpoint':
    'Google sign-in is not available right now. Please sign in with email and password.',
  'redirectTo-not-allowed':
    'Configuration error. Please contact support. (redirectTo-not-allowed)',
  'signup-disabled':
    'New account registration is currently disabled.',
  'user-already-exists':
    'An account with this email already exists. Please sign in with email and password.',
  'oauth-token-exchange-failed':
    'Google sign-in failed during authentication. Please try again.',
  'oauth-profile-fetch-failed':
    'Could not retrieve your Google profile. Please try again.',
  'oauth-provider-error':
    'Google returned an error. Please try again or use email sign-in.',
  'provider-account-already-linked':
    'This Google account is already linked to another Dropiti account.',
  'internal-server-error':
    'An unexpected error occurred. Please try again in a moment.',
};

const DEFAULT_OAUTH_ERROR =
  'Google sign-in failed. Please try again or sign in with email and password.';

export default function OAuthCallbackHandler() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const handledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    // ── Rule 5a: Handle error params FIRST ──────────────────────────────────
    const errorCode = params.get('error');
    if (errorCode) {
      // Clean the URL immediately
      window.history.replaceState({}, '', window.location.pathname);

      const userMessage =
        NHOST_OAUTH_ERRORS[errorCode] ??
        `${DEFAULT_OAUTH_ERROR} (${errorCode})`;

      // Persist the error so the sign-in page can display it after navigation
      sessionStorage.setItem('oauth_error', userMessage);
      sessionStorage.removeItem('oauth_callback_url');

      // Navigate to sign-in page — it will read and display the error
      router.replace('/auth/signin?oauth_error=1');
      return;
    }

    // ── Rule 5b: Handle success ──────────────────────────────────────────────
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
```

### Errors this handles

| `?error=` code | Cause | User message |
|----------------|-------|-------------|
| `unverified-user` | Pre-existing unverified account with same email | Verify email first |
| `disabled-user` | Account suspended in Nhost | Contact support |
| `disabled-endpoint` | Google provider not enabled in dashboard | Use email sign-in |
| `redirectTo-not-allowed` | Dashboard misconfiguration | Contact support |
| `signup-disabled` | New signups turned off | Registration disabled |
| `user-already-exists` | Email exists via different provider | Use email sign-in |
| `oauth-token-exchange-failed` | Google code expired or tampered | Try again |
| `oauth-profile-fetch-failed` | Google API unavailable | Try again |
| `oauth-provider-error` | Google-side error | Try again |
| `internal-server-error` | Nhost server fault | Try again later |

---

## Rule 6 — The sign-in page must display OAuth errors stored in sessionStorage

### The rule

> **The sign-in page must read `sessionStorage.getItem('oauth_error')` on mount and display it as an error message. It must clear the value immediately after reading it.**

### Implementation — `SignInPage` component (both projects)

```tsx
// In the sign-in page component, add this effect:
useEffect(() => {
  const oauthError = sessionStorage.getItem('oauth_error');
  if (oauthError) {
    sessionStorage.removeItem('oauth_error');
    setErrorMessage(oauthError);
  }
}, []);
```

This gives the user actionable feedback after every OAuth failure instead of landing silently on the sign-in page with no context.

---

## Rule 7 — `AuthContext` must auto-create the DB profile row for new Google users

### The rule

> **When `isAuthenticated` is true and the Nhost user exists, but no DB profile row is found, create the profile row automatically. Never require a separate sign-up step for Google OAuth users.**

### Why

A user who signs in via Google for the first time is authenticated in Nhost (`auth.users` row exists, JWT issued) but has no row in your application's user table (`real_estate_user` in Dropiti, `user_profiles` in Tastyplates). If `AuthContext` only reads the profile and returns `null` on not-found, the entire application breaks for new Google users.

### Implementation — `AuthContext.tsx` (Dropiti — already partially correct)

Dropiti's `AuthContext` already has the auto-create logic. Verify this block is present and complete:

```ts
// In the loadProfile useEffect, after the getUserByNhostUserId call:
if (response.success && response.data) {
  // Profile exists — map it to AuthUser
  setUser({ ... });
} else {
  // ── RULE 7: Auto-create the profile for new Google OAuth users ──
  const isGoogleUser = nhostUser.avatarUrl?.includes('googleusercontent');
  try {
    await usersAPI.createUser({
      nhost_user_id: nhostUser.id,
      display_name:  nhostUser.displayName || nhostUser.email?.split('@')[0] || 'User',
      email:         nhostUser.email || '',
      photo_url:     nhostUser.avatarUrl || undefined,
      auth_provider: isGoogleUser ? 'google' : 'email',
    });
  } catch (createErr) {
    // Log but do not throw — set a minimal user so the app doesn't break
    console.warn('[AuthContext] auto-create profile failed:', createErr);
  }
  // Set minimal user from Nhost data while profile is being created
  setUser({
    id:    nhostUser.id,
    email: nhostUser.email || '',
    name:  nhostUser.displayName || 'User',
    avatar: nhostUser.avatarUrl || undefined,
  });
}
```

### Errors this prevents

- New Google users seeing blank screens or "profile not found" errors
- Redirects to onboarding that loop because `onboarding_complete` is never set (no profile row exists)

---

## Rule 8 — `VerificationRedirect` must not block Google OAuth users

### The rule

> **`VerificationRedirect` must check that `emailVerified` is specifically `false` — not just falsy. Google OAuth users always have `emailVerified = true`. Never redirect a Google user to the verification page.**

### Why

Google verifies the email address as part of the OAuth consent. Nhost sets `email_verified = true` in `auth.users` for all Google OAuth sign-ins. `VerificationRedirect` should never fire for these users.

### Current Dropiti implementation — already correct

```tsx
// src/components/auth/VerificationRedirect.tsx — current code is correct:
if (nhostUser.emailVerified) return;  // Google users pass here — no redirect
router.replace(USER_VERIFICATION_PATH);
```

This is correct as written. The concern is if `emailVerified` is ever `undefined` or `null` rather than a strict `false`. Add an explicit check:

```tsx
// Defensive: only redirect if explicitly false, not if undefined/null
if (nhostUser.emailVerified !== false) return;
router.replace(USER_VERIFICATION_PATH);
```

---

## Rule 9 — `ClientOnboardingGate` must exclude the auth callback path

### The rule

> **`ClientOnboardingGate` must not redirect to `/onboarding` while the OAuth callback is being processed. Add `/auth/user-verification` and the root path `/` (where `?refreshToken=` lands) to the excluded paths.**

### Why

When Google redirects back to `https://dropiti.com?refreshToken=<token>`, the browser lands on `/`. `ClientOnboardingGate` runs immediately. If the Nhost SDK hasn't hydrated the session yet, `isAuthenticated` may briefly be `false`, causing no action. But if `isAuthenticated` becomes `true` (session hydrated) before `onboarding_complete` is confirmed (the DB profile hasn't loaded yet), the gate may redirect to `/onboarding` while `OAuthCallbackHandler` is still processing.

### Implementation — `ClientOnboardingGate.tsx` (Dropiti — update)

```tsx
// BEFORE
const EXCLUDED_PATHS = ['/onboarding', '/auth/signin', '/auth/register'];

// AFTER — add user-verification and account for loading state
const EXCLUDED_PATHS = [
  '/onboarding',
  '/auth/signin',
  '/auth/register',
  '/auth/user-verification',  // Add: verification page itself
];

useEffect(() => {
  if (isLoading || !isAuthenticated || !user) return;

  // ── RULE 9: Don't redirect while OAuth token is being processed ──
  // If ?refreshToken= is in the URL, OAuthCallbackHandler is still working.
  // Wait for it to clean the URL before evaluating onboarding state.
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.has('refreshToken') || params.has('error')) return;
  }

  const isExcluded = EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (bypassOnboarding) return;
  if (!user.onboarding_complete && !isExcluded) {
    router.replace('/onboarding');
  }
}, [isLoading, isAuthenticated, user, pathname, router, bypassOnboarding]);
```

---

## Rule 10 — Use `nhost.toml` to pin the Google provider configuration (if repo-connected)

### The rule

> **If your Nhost project has a connected GitHub repository, the Dashboard UI may be locked. Use `nhost.toml` at the project root to configure the Google provider.**

### `nhost.toml` (add or update)

```toml
[auth]
  [auth.email]
    emailVerificationRequired = false    # Rule 1 — allows sign-in before verification

  [[auth.providers]]
    name = "google"
    enabled = true
    clientId = "{{ secrets.GOOGLE_CLIENT_ID }}"
    clientSecret = "{{ secrets.GOOGLE_CLIENT_SECRET }}"

  [auth.redirections]
    clientUrl = "https://dropiti.com"
    allowedUrls = [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://dropiti.com",
      "https://www.dropiti.com",
      "https://*.vercel.app",
    ]
```

Secrets `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in the Nhost Dashboard under **Settings → Secrets**.

---

## Complete error code reference

Every `hasura-auth` error code that can appear in a `?error=` redirect or server log, and what each means:

| Code | Where it fires | Root cause | Fix |
|------|---------------|-----------|-----|
| `unverified-user` | OAuth callback server log | Pre-existing email/password account with `email_verified=false` | Set `AUTH_EMAIL_SIGNIN_EMAIL_VERIFIED_REQUIRED=false` (Rule 1) |
| `disabled-endpoint` | OAuth initiation (before Google) | Google provider not enabled in dashboard | Enable Google in Nhost Dashboard settings |
| `redirectTo-not-allowed` | OAuth initiation (before Google) | `redirectTo` URL not in allowlist | Add URL to Allowed Redirect URLs (Rule 3) |
| `disabled-user` | OAuth callback | Account banned in Nhost admin | Review account in Nhost Dashboard → Auth → Users |
| `signup-disabled` | OAuth callback for new user | `AUTH_DISABLE_NEW_USERS=true` or signup toggled off | Enable signups in Nhost Dashboard |
| `user-already-exists` | OAuth callback | Same email registered via different provider with conflict rules | Handle in code — show "use email sign-in" message |
| `oauth-token-exchange-failed` | OAuth callback server log | Google auth code expired (>10min) or tampered state | Retry — codes expire quickly |
| `oauth-profile-fetch-failed` | OAuth callback server log | Google userinfo API unavailable | Retry — transient Google outage |
| `oauth-provider-error` | OAuth callback server log | Misconfigured Client ID/Secret or wrong callback URI | Verify Google Cloud Console credentials |
| `provider-account-already-linked` | OAuth callback | Google account linked to a different Nhost user | User needs to sign in to the account it's linked to |
| `internal-server-error` | OAuth callback | Hasura-auth service fault | Check Nhost status page; retry |
| `invalid-state` | OAuth callback | CSRF state mismatch — URL tampered or expired | Retry — state param expired |
| `oauth-profile-fetch-failed` | OAuth callback | Cannot fetch Google profile after token exchange | Check Google API quota; retry |
| `forbidden-anonymous` | Any auth endpoint | Anonymous user trying to perform restricted action | Sign in as a real user |
| `role-not-allowed` | Any auth endpoint | Requested role not in user's allowed roles | Check Hasura permissions |

---

## Implementation checklist

Apply every item before marking Google OAuth as production-ready.

### Nhost Dashboard
- [ ] Google provider enabled with valid Client ID and Client Secret
- [ ] `AUTH_EMAIL_SIGNIN_EMAIL_VERIFIED_REQUIRED` set to `false`
- [ ] Client URL set to production origin (no trailing slash)
- [ ] `http://localhost:3000` in Allowed Redirect URLs
- [ ] Production origin in Allowed Redirect URLs (no trailing slash)
- [ ] `www.` variant in Allowed Redirect URLs
- [ ] `https://*.vercel.app` in Allowed Redirect URLs (if using Vercel)
- [ ] `/auth/user-verification` and `/reset-password` full URLs in Allowed Redirect URLs

### Google Cloud Console
- [ ] OAuth consent screen configured (User Type: External, scopes: email + profile)
- [ ] Authorized JavaScript origin: `https://<subdomain>.auth.<region>.nhost.run`
- [ ] Authorized redirect URI: `https://<subdomain>.auth.<region>.nhost.run/v1/signin/provider/google/callback`
- [ ] Authorized JavaScript origin includes frontend domains for localhost and production
- [ ] OAuth consent screen not in "Testing" mode for production (publish it)

### Code — both projects
- [ ] `signInWithGoogle()` uses `window.location.origin` with no path
- [ ] `signInWithGoogle()` accepts no `redirectTo` parameter from callers
- [ ] `OAuthCallbackHandler` handles `?error=` before `?refreshToken=`
- [ ] `OAuthCallbackHandler` stores OAuth errors in `sessionStorage.oauth_error`
- [ ] Sign-in page reads and displays `sessionStorage.oauth_error` on mount
- [ ] `AuthContext` auto-creates DB profile row when new Google user signs in
- [ ] `VerificationRedirect` uses `!== false` check (not just falsy) for `emailVerified`
- [ ] `ClientOnboardingGate` excludes `/` and checks for `?refreshToken=` in URL
- [ ] `ClientOnboardingGate` excluded paths include `/auth/user-verification`

---

## The corrected full Google OAuth flow (post-fix)

```
User clicks "Continue with Google"
  │
  ▼
signInWithGoogle('/dashboard')
  sessionStorage.set('oauth_callback_url', '/dashboard')
  redirectTo = window.location.origin  ← bare, no path
  → navigates to:
    https://<sub>.auth.<region>.nhost.run/v1/signin/provider/google
    ?redirectTo=https://dropiti.com
    &options[authorizationParams][prompt]=select_account
  │
  ▼
Nhost validates:
  ✓ Google provider is enabled
  ✓ redirectTo is in Allowed Redirect URLs
  → redirects user to Google consent screen
  │
  ▼
User grants consent on Google
  │
  ▼
Google redirects to Nhost callback:
  https://<sub>.auth.<region>.nhost.run/v1/signin/provider/google/callback?code=...&state=...
  │
  ▼
Nhost processes the OAuth code:
  ✓ AUTH_EMAIL_SIGNIN_EMAIL_VERIFIED_REQUIRED=false
    → pre-existing unverified accounts are allowed through
  ✓ New user: Nhost creates auth.users row, email_verified=true (Google always verifies)
  ✓ Existing user (same email, any provider): Nhost signs them in
  │
  ├─ SUCCESS → redirects to: https://dropiti.com?refreshToken=<token>&type=signinProvider
  │
  └─ FAILURE → redirects to: https://dropiti.com?error=<code>&errorDescription=<message>
  │
  ▼
OAuthCallbackHandler (mounted in every page):
  │
  ├─ Detects ?error= (+ optional errorDescription) → resolveAuthError() → setOAuthErrorPresentation() → router.replace('/auth/signin?oauth_error=1')
  │
  └─ Detects ?refreshToken= → show "Signing you in…" overlay
       ├─ isAuthenticated within ~15s → clean URL → router.replace(destination)
       └─ timeout (cookies blocked / SDK stuck) → oauth-session-timeout presentation → sign-in
  │
  ▼
AuthContext runs on every page:
  Nhost user exists (authenticated)
  → calls usersAPI.getUserByNhostUserId(nhostUser.id)
    ├─ Profile row exists → map to AuthUser, set state
    └─ Profile row NOT found (new Google user) → auto-create row → set minimal AuthUser
  │
  ▼
ClientOnboardingGate:
  ✓ Skips evaluation while ?refreshToken= still in URL
  user.onboarding_complete = false → router.replace('/onboarding')
  user.onboarding_complete = true  → render children

  ▼ (if sign-in page has oauth_error=1 in URL)
Sign-in / sign-up page:
  consumeOAuthErrorPresentation() → AuthErrorAlert (title, message, action buttons)
  fallback: read ?error= from URL if sessionStorage was cleared
  │
  ▼ (if authenticated but profile API fails)
AuthContext:
  authWarning banner — user is signed in but profile setup failed
```

---

## Client-friendly auth error UX (dropiti-v3)

Users should never see raw Nhost codes (e.g. `internal-server-error`) or silent failures on the homepage.

### Central resolver

| File | Role |
|------|------|
| `src/types/auth-errors.ts` | `AuthErrorPresentation`, `AuthErrorAction` types |
| `src/lib/resolveAuthError.ts` | `resolveAuthError()` — maps codes to title, message, and actions |
| `src/lib/oauthCallback.ts` | `setOAuthErrorPresentation()` / `consumeOAuthErrorPresentation()` — structured JSON in sessionStorage |

### UI components

| File | Role |
|------|------|
| `src/components/auth/AuthErrorAlert.tsx` | Titled alert with action links (verify email, retry Google, contact support) |
| `src/components/auth/OAuthCallbackHandler.tsx` | Parses `errorDescription` (logged in dev only); 15s timeout on stuck `?refreshToken=` |
| `src/components/auth/SignInForm.tsx` / `SignUpForm.tsx` | `AuthErrorAlert` + URL `?error=` backup |

### Email sign-in and profile warnings

| File | Role |
|------|------|
| `src/context/AuthContext.tsx` | `login()` uses `resolveAuthError()` and returns `errorCode` + `presentation`; exposes `authWarning` when profile auto-create fails after OAuth |

### Developer diagnostics

- In **development**, `AuthErrorAlert` shows a small `Error code: …` line under the message.
- In **production**, codes are logged with `console.warn('[Auth]', …)` only — not shown to users.

### Manual test cases

1. `/?error=unverified-user` → sign-in shows verification CTA (not generic internal error).
2. `/?error=internal-server-error` → friendly copy + retry / email / support actions.
3. `/?error=unknown-code-xyz` → generic friendly message; code in console only.
4. `/?refreshToken=fake` with cookies blocked → after ~15s, redirect to sign-in with timeout message.
5. Wrong email/password → "Incorrect sign-in details" (not unexpected error).
6. Google success + profile API down → amber `authWarning` banner; user stays signed in.

---

## Dropiti v3 — implementation map (current codebase)

The following files implement the rules above in **dropiti-v3**. Use this section when verifying the doc against the repo.

| Rule | File(s) |
|------|---------|
| Auth error resolver | `src/lib/resolveAuthError.ts`, `src/types/auth-errors.ts` — re-exported from `error-messages.ts` |
| Callback URL helpers | `src/lib/oauthCallback.ts` — structured presentation storage, `getOAuthErrorFromUrl()` |
| Auth error UI | `src/components/auth/AuthErrorAlert.tsx` |
| Google sign-in entry | `src/services/auth/nhostAuthService.ts` — `signInWithGoogle()` |
| Google button UI | `src/components/auth/GoogleSignInButton.tsx` — delegates to `nhostAuthService` |
| OAuth return handler | `src/components/auth/OAuthCallbackHandler.tsx` — `?error=` first, then `?refreshToken=` |
| Display OAuth errors | `SignInForm.tsx`, `SignUpForm.tsx` — `AuthErrorAlert` + `consumeOAuthErrorPresentation()` |
| Profile auto-create + warnings | `src/context/AuthContext.tsx` — `authWarning` when profile setup fails |
| `callbackUrl` on email login | `src/components/auth/SignInForm.tsx` — `getCallbackUrlFromSearch()` after success |
| `loginWithGoogle` callback | `src/context/AuthContext.tsx` — reads `callbackUrl` from query |
| Onboarding gate | `src/components/ClientOnboardingGate.tsx` |
| Verification redirect | `src/components/auth/VerificationRedirect.tsx` |
| Global mount order | `src/components/Providers.tsx` — `OAuthCallbackHandler` inside `NhostProvider` |

### Code checklist (dropiti-v3)

- [x] `signInWithGoogle()` uses `window.location.origin` with no path
- [x] `OAuthCallbackHandler` handles `?error=` before `?refreshToken=`
- [x] OAuth errors stored as structured `AuthErrorPresentation` in sessionStorage
- [x] `OAuthCallbackHandler` timeout for stuck `?refreshToken=` (`oauth-session-timeout`)
- [x] Sign-in and sign-up use `AuthErrorAlert` with per-code actions (not raw codes in production)
- [x] Email login uses `resolveAuthError()`; `authWarning` when profile setup fails after OAuth
- [x] Email sign-in honors `callbackUrl` query param
- [x] `VerificationRedirect` uses `emailVerified !== false`
- [x] `ClientOnboardingGate` skips while `refreshToken` or `error` in URL
- [x] Excluded paths: `/auth/signup`, `/auth/user-verification`, `/transfer-ownership`

### Ops checklist (still required in Nhost / Google Cloud)

These cannot be fixed in application code alone:

- [ ] `AUTH_EMAIL_SIGNIN_EMAIL_VERIFIED_REQUIRED=false` in Nhost (Rule 1 — fixes server-side `unverified-user` on OAuth callback for legacy email accounts)
- [ ] Allowed Redirect URLs include every `window.location.origin` value (localhost, production, Vercel previews)
- [ ] Google Cloud authorized redirect URI matches Nhost callback URL exactly