import { usersAPI } from '@/lib/api-client';
import { syncSessionCookie } from '@/lib/sync-session-cookie';
import type { CreateUserInput } from '@/types';

/** DB row shape returned by get-user-by-id / create-user */
export interface RealEstateUserRow {
  uuid: string;
  nhost_user_id: string;
  display_name: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  photo_url?: string;
  auth_provider?: string;
  phone_number?: string;
  whatsapp_number?: string;
  location?: string;
  about?: string;
  education?: string;
  occupation?: string;
  marital_status?: string;
  languages?: string[] | string;
  verified?: boolean;
  rating?: number;
  review_count?: number;
  response_rate?: number;
  response_time?: string;
  avg_response_time?: string;
  total_properties?: number;
  total_guests?: number;
  onboarding_complete?: boolean;
  preferences?: Record<string, unknown>;
  notification_settings?: Record<string, unknown>;
  privacy_settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export type EnsureUserProfileResult =
  | { ok: true; data: RealEstateUserRow; effectiveNhostUserId: string }
  | { ok: false; error: string };

/**
 * Ensures a real_estate_user row exists for the Nhost user.
 * Creates the row if missing; re-fetches after create.
 */
export async function ensureUserProfile(
  input: CreateUserInput,
): Promise<EnsureUserProfileResult> {
  let getResult = await usersAPI.getUserByNhostUserId(input.nhost_user_id);

  // Cookie may lag behind Nhost SDK session on first paint after login
  if (
    !getResult.success &&
    'unauthorized' in getResult &&
    getResult.unauthorized
  ) {
    await syncSessionCookie();
    getResult = await usersAPI.getUserByNhostUserId(input.nhost_user_id);
  }

  if (getResult.success && getResult.data) {
    const row = getResult.data as RealEstateUserRow;
    return {
      ok: true,
      data: row,
      effectiveNhostUserId: row.nhost_user_id || input.nhost_user_id,
    };
  }

  if (!getResult.success && 'notFound' in getResult && getResult.notFound) {
    try {
      const createResult = await usersAPI.createUser(input);

      // Row was created concurrently (409) — refetch by nhost_user_id
      if (
        !createResult.success &&
        'conflict' in createResult &&
        createResult.conflict
      ) {
        const refetch = await usersAPI.getUserByNhostUserId(input.nhost_user_id);
        if (refetch.success && refetch.data) {
          return {
            ok: true,
            data: refetch.data as RealEstateUserRow,
            effectiveNhostUserId: refetch.data.nhost_user_id || input.nhost_user_id,
          };
        }
      }

      if (!createResult.success || !createResult.data) {
        const message =
          (createResult as { error?: string }).error || 'Could not create your profile.';
        return { ok: false, error: message };
      }

      const created = createResult.data as RealEstateUserRow;
      const effectiveNhostUserId = created.nhost_user_id || input.nhost_user_id;

      const refetch = await usersAPI.getUserByNhostUserId(effectiveNhostUserId);
      if (refetch.success && refetch.data) {
        return {
          ok: true,
          data: refetch.data as RealEstateUserRow,
          effectiveNhostUserId,
        };
      }

      return { ok: true, data: created, effectiveNhostUserId };
    } catch (err) {
      console.error('ensureUserProfile: create failed', err);
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Could not create your profile.',
      };
    }
  }

  const errorMessage =
    !getResult.success && 'error' in getResult
      ? getResult.error
      : 'Could not load your profile.';
  return { ok: false, error: errorMessage };
}

/** Build CreateUserInput from Nhost session user fields */
function parseLanguages(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseJSON<T>(value: unknown, fallback: T): T {
  if (value && typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' ? (parsed as T) : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/** Map a DB profile row to AuthContext user shape */
export function mapDbUserToAuthUser(
  d: RealEstateUserRow,
  nhostUser: {
    id: string;
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  },
) {
  return {
    id: d.nhost_user_id || nhostUser.id,
    email: d.email || nhostUser.email || '',
    name: d.display_name || nhostUser.displayName || 'User',
    avatar: d.photo_url || nhostUser.avatarUrl || undefined,
    uuid: d.uuid,
    displayName: d.display_name,
    photoUrl: d.photo_url,
    location: d.location,
    about: d.about,
    education: d.education,
    occupation: d.occupation,
    maritalStatus: d.marital_status,
    languages: parseLanguages(d.languages),
    responseTime: d.response_time,
    verified: d.verified || false,
    rating: d.rating || 0,
    reviewCount: d.review_count || 0,
    responseRate: d.response_rate || 0,
    avgResponseTime: d.avg_response_time || 'Not specified',
    totalProperties: d.total_properties || 0,
    totalGuests: d.total_guests || 0,
    userSince: d.created_at,
    phoneNumber: d.phone_number,
    onboarding_complete: d.onboarding_complete ?? false,
    preferences: parseJSON(d.preferences, {}),
    notificationSettings: parseJSON(d.notification_settings, {}),
    privacySettings: parseJSON(d.privacy_settings, {}),
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export function buildProfileInputFromNhostUser(nhostUser: {
  id: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}): CreateUserInput {
  const detectedProvider = nhostUser.avatarUrl?.includes('googleusercontent')
    ? 'google'
    : 'email';

  return {
    nhost_user_id: nhostUser.id,
    display_name: nhostUser.displayName || nhostUser.email?.split('@')[0] || 'User',
    email: nhostUser.email || '',
    photo_url: nhostUser.avatarUrl || undefined,
    auth_provider: detectedProvider,
  };
}
