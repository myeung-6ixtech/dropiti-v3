import { nhost } from '@/lib/nhost';

/**
 * Mirror the Nhost browser session into httpOnly cookies so the BFF can
 * proxy authenticated requests to Functions (notifications, chat, etc.).
 */
export async function syncSessionCookie(): Promise<void> {
  const accessToken = nhost.auth.getAccessToken();
  if (!accessToken) return;

  const refreshToken = nhost.auth.getSession()?.refreshToken;
  const accessTokenExpiresIn = nhost.auth.getSession()?.accessTokenExpiresIn;

  await fetch('/api/v1/auth/session', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken,
      refreshToken: refreshToken ?? undefined,
      accessTokenExpiresIn: accessTokenExpiresIn ?? undefined,
    }),
  });
}

export async function clearSessionCookie(): Promise<void> {
  await fetch('/api/v1/auth/session', {
    method: 'DELETE',
    credentials: 'include',
  });
}
