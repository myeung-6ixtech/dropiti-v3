import { nhost } from '@/lib/nhost';
import { executeMutation, executeQuery } from '@/app/api/graphql/serverClient';
import { DEFAULT_AVATAR_URL } from '@/constants/images';

// ---------------------------------------------------------------------------
// GraphQL — user profile management
// ---------------------------------------------------------------------------

const GET_USER_BY_NHOST_ID = `
  query GetUserByNhostId($nhost_user_id: uuid!) {
    real_estate_user(where: { nhost_user_id: { _eq: $nhost_user_id } }, limit: 1) {
      uuid
      nhost_user_id
      display_name
      email
      photo_url
      auth_provider
      onboarding_complete
    }
  }
`;

const CREATE_USER_MUTATION = `
  mutation CreateUser($user: real_estate_user_insert_input!) {
    insert_real_estate_user_one(object: $user) {
      uuid
      nhost_user_id
      display_name
      email
      auth_provider
      photo_url
    }
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NhostUserProfile {
  uuid: string;
  nhost_user_id: string;
  display_name: string;
  email: string;
  photo_url?: string;
  auth_provider: string;
  onboarding_complete?: boolean;
}

export type GetProfileResult =
  | { status: 'ok'; profile: NhostUserProfile }
  | { status: 'not_found' }
  | { status: 'error'; error: string };

export interface CreateProfileData {
  nhost_user_id: string;
  display_name: string;
  email: string;
  photo_url?: string;
  auth_provider?: string;
}

// ---------------------------------------------------------------------------
// Service class
// ---------------------------------------------------------------------------

class NhostAuthService {
  // -------------------------------------------------------------------------
  // Email sign-up: creates Nhost auth user then DB profile row
  // -------------------------------------------------------------------------
  async registerWithEmail(
    email: string,
    password: string,
    displayName: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { session, error } = await nhost.auth.signUp({
      email,
      password,
      options: { displayName },
    });

    if (error || !session) {
      return { success: false, error: error?.message || 'Sign-up failed' };
    }

    await this.ensureUserProfile({
      nhost_user_id: session.user.id,
      display_name: displayName,
      email,
      photo_url: DEFAULT_AVATAR_URL,
      auth_provider: 'email',
    });

    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Email sign-in
  // -------------------------------------------------------------------------
  async signInWithEmail(
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { session, error } = await nhost.auth.signIn({ email, password });

    if (error || !session) {
      return {
        success: false,
        error: 'Invalid username or password. Please try again.',
      };
    }

    // Safety net: create profile if it doesn't exist yet
    await this.ensureUserProfile({
      nhost_user_id: session.user.id,
      display_name: session.user.displayName || email.split('@')[0],
      email,
      photo_url: session.user.avatarUrl || DEFAULT_AVATAR_URL,
      auth_provider: 'email',
    });

    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Google OAuth (redirect-based)
  // -------------------------------------------------------------------------
  signInWithGoogle(callbackUrl?: string): void {
    if (typeof window === 'undefined') return;
    const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
    const region = process.env.NEXT_PUBLIC_NHOST_REGION;
    sessionStorage.setItem('oauth_callback_url', callbackUrl || '/dashboard');
    const redirectTo = window.location.origin;
    const url =
      `https://${subdomain}.auth.${region}.nhost.run/v1/signin/provider/google` +
      `?redirectTo=${encodeURIComponent(redirectTo)}` +
      `&options[authorizationParams][prompt]=select_account`;
    window.location.assign(url);
  }

  // -------------------------------------------------------------------------
  // Sign out
  // -------------------------------------------------------------------------
  async signOut(): Promise<void> {
    await nhost.auth.signOut().catch(() => {
      // Errors swallowed — callers always proceed with local cleanup
    });
  }

  // -------------------------------------------------------------------------
  // Password reset
  // -------------------------------------------------------------------------
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await nhost.auth.resetPassword({ email });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Resend verification email
  // -------------------------------------------------------------------------
  async resendVerificationEmail(
    email: string,
    redirectTo?: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await nhost.auth.sendVerificationEmail({
      email,
      ...(redirectTo && { options: { redirectTo } }),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Profile helpers (server-side only — use executeQuery/executeMutation)
  // -------------------------------------------------------------------------

  async getUserProfile(nhostUserId: string): Promise<GetProfileResult> {
    try {
      const data = (await executeQuery(GET_USER_BY_NHOST_ID, {
        nhost_user_id: nhostUserId,
      })) as { real_estate_user?: NhostUserProfile[] };

      if (!data?.real_estate_user?.length) return { status: 'not_found' };
      return { status: 'ok', profile: data.real_estate_user[0] };
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  async createUserProfile(userData: CreateProfileData): Promise<NhostUserProfile | null> {
    try {
      const data = (await executeMutation(CREATE_USER_MUTATION, {
        user: {
          nhost_user_id: userData.nhost_user_id,
          display_name: userData.display_name,
          email: userData.email,
          photo_url: userData.photo_url || DEFAULT_AVATAR_URL,
          auth_provider: userData.auth_provider || 'email',
        },
      })) as { insert_real_estate_user_one?: NhostUserProfile };

      return data?.insert_real_estate_user_one ?? null;
    } catch (err) {
      console.error('createUserProfile error:', err);
      return null;
    }
  }

  // -------------------------------------------------------------------------
  // Ensures a profile row exists — create it if not
  // -------------------------------------------------------------------------
  private async ensureUserProfile(data: CreateProfileData): Promise<void> {
    const result = await this.getUserProfile(data.nhost_user_id);
    if (result.status === 'not_found') {
      await this.createUserProfile(data);
    }
  }
}

export const nhostAuthService = new NhostAuthService();
