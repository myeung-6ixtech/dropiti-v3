import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE = 'nhost_access_token';
const REFRESH_TOKEN_COOKIE = 'nhost_refresh_token';

/** Persist Nhost JWT in httpOnly cookies for same-origin BFF → Functions proxy. */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      accessToken?: string;
      refreshToken?: string;
      accessTokenExpiresIn?: number;
    };

    let accessToken = body.accessToken?.trim();
    if (!accessToken) {
      const auth = request.headers.get('authorization');
      if (auth?.startsWith('Bearer ')) {
        accessToken = auth.slice(7).trim();
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'accessToken is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    const maxAge = body.accessTokenExpiresIn ?? 60 * 60 * 24 * 7;

    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    if (body.refreshToken?.trim()) {
      cookieStore.set(REFRESH_TOKEN_COOKIE, body.refreshToken.trim(), {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[auth/session] POST failed:', error);
    return NextResponse.json({ error: 'Failed to set session' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  return NextResponse.json({ success: true });
}
