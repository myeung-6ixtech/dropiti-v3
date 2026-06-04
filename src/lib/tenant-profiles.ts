import { tenantsAPI, usersAPI } from '@/lib/api-client';
import type { TenantProfileData } from '@/types/tenant';

/** Stable React key for tenant marketplace cards (prefer `tenant_uuid`). */
export function getTenantProfileKey(
  profile: TenantProfileData & {
    id?: string | number;
    user_id?: string;
    tenant_uuid?: string;
  },
  index?: number,
): string {
  const uuid = profile.tenant_uuid?.trim();
  if (uuid) return uuid;
  const userId = profile.user_id?.trim();
  if (userId) return userId;
  if (profile.id !== undefined && profile.id !== null && profile.id !== '') {
    return String(profile.id);
  }
  return `tenant-profile-${index ?? 0}`;
}

/** Embedded user from Hasura `user` (auth.users) or legacy `real_estate_user` enrichment. */
export type TenantProfileEmbeddedUser = {
  id?: string;
  email?: string;
  avatarUrl?: string | null;
  uuid?: string;
  nhost_user_id?: string;
  display_name?: string;
  name?: string;
  photo_url?: string;
  avatar?: string;
  rating?: number;
  review_count?: number;
};

/** Normalized display fields for preview / marketplace cards. */
export type TenantProfileDisplayUser = {
  displayName?: string;
  name?: string;
  avatar?: string;
  email?: string;
  nhost_user_id?: string;
};

export type TenantProfileRow = TenantProfileData & {
  id?: string | number;
  tenant_uuid?: string;
  user_id?: string;
  privacy_settings?: Record<string, boolean>;
  user?: TenantProfileEmbeddedUser | null;
  real_estate_user?: Record<string, unknown> | null;
};

function readStringField(row: Record<string, unknown>, snake: string, camel: string): string | undefined {
  const value = row[snake] ?? row[camel];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isRealEstateUserRecord(row: Record<string, unknown>): boolean {
  if ('tenant_listing_title' in row || 'tenant_uuid' in row) return false;
  const hasIdentity =
    readStringField(row, 'display_name', 'displayName') ||
    readStringField(row, 'photo_url', 'photoUrl');
  const hasUserKey = Boolean(row.nhost_user_id ?? row.uuid);
  return Boolean(hasIdentity && hasUserKey);
}

function readRealEstateUserFields(
  reUser: Record<string, unknown> | null,
): Pick<
  TenantProfileEmbeddedUser,
  'display_name' | 'photo_url' | 'avatar' | 'email' | 'rating' | 'review_count'
> {
  if (!reUser) return {};
  const display_name =
    readStringField(reUser, 'display_name', 'displayName') ||
    (typeof reUser.name === 'string' && reUser.name.trim() ? reUser.name.trim() : undefined);
  const photo_url =
    readStringField(reUser, 'photo_url', 'photoUrl') ||
    (typeof reUser.avatar === 'string' && reUser.avatar.trim() ? reUser.avatar.trim() : undefined);
  return {
    display_name,
    photo_url,
    avatar: photo_url,
    email: typeof reUser.email === 'string' ? reUser.email : undefined,
    rating: typeof reUser.rating === 'number' ? reUser.rating : undefined,
    review_count:
      typeof reUser.review_count === 'number' ? reUser.review_count : undefined,
  };
}

/** Map API `user` (merged auth + real_estate_user from Nhost) to embedded card shape. */
export function normalizeTenantProfileUser(
  raw: unknown,
  userId?: string,
  realEstateUser?: unknown,
): TenantProfileEmbeddedUser | null {
  let auth = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
  let re =
    realEstateUser && typeof realEstateUser === 'object'
      ? (realEstateUser as Record<string, unknown>)
      : null;

  // `getUserByNhostUserId` returns a full `real_estate.user` row as the payload.
  if (!re && auth && isRealEstateUserRecord(auth)) {
    re = auth;
    auth = null;
  }

  if (!auth && !re) return null;

  const nhostId =
    String(re?.nhost_user_id ?? auth?.nhost_user_id ?? auth?.id ?? userId ?? '').trim() ||
    undefined;
  const fromRe = readRealEstateUserFields(re);
  const authAvatar =
    (auth?.avatarUrl as string | null) ??
    readStringField(auth ?? {}, 'photo_url', 'photoUrl') ??
    undefined;
  const photo_url = fromRe.photo_url || authAvatar;
  const display_name =
    fromRe.display_name ||
    readStringField(auth ?? {}, 'display_name', 'displayName') ||
    (typeof auth?.name === 'string' && auth.name.trim() ? auth.name.trim() : undefined);

  return {
    id: nhostId,
    nhost_user_id: nhostId,
    uuid: (re?.uuid as string) ?? undefined,
    email: fromRe.email ?? (auth?.email as string | undefined),
    avatarUrl: photo_url ?? authAvatar ?? null,
    display_name,
    name: display_name,
    photo_url,
    avatar: photo_url,
    rating: fromRe.rating,
    review_count: fromRe.review_count,
  };
}

/** True when `real_estate.user` display name is already present (Gravatar alone is not enough). */
export function tenantEmbeddedUserHasProfileFields(
  user: TenantProfileEmbeddedUser | null | undefined,
): boolean {
  return Boolean(user?.display_name?.trim());
}

/**
 * Load `display_name` / `photo_url` from `real_estate.user` when the tenant API
 * only returned auth.users (or an incomplete merge).
 */
export async function ensureRealEstateEmbeddedUser(
  nhostUserId: string | undefined,
  embedded: TenantProfileEmbeddedUser | null | undefined,
): Promise<TenantProfileEmbeddedUser | null> {
  if (!nhostUserId) return embedded ?? null;
  if (tenantEmbeddedUserHasProfileFields(embedded)) return embedded ?? null;

  try {
    const res = await usersAPI.getUserByNhostUserId(nhostUserId);
    if (res.success && res.data) {
      return normalizeTenantProfileUser(res.data, nhostUserId) ?? embedded ?? null;
    }
  } catch (error) {
    console.error('[tenant-profiles] ensureRealEstateEmbeddedUser failed', error);
  }
  return embedded ?? null;
}

/** Resolve avatar + display name for UI; optional auth session fallback on dashboard. */
export function resolveTenantProfileDisplayUser(
  embedded: TenantProfileEmbeddedUser | null | undefined,
  fallback?: {
    displayName?: string;
    name?: string;
    avatar?: string;
    photoUrl?: string;
    email?: string;
    id?: string;
  },
): TenantProfileDisplayUser {
  const displayName =
    embedded?.display_name?.trim() ||
    fallback?.displayName?.trim() ||
    fallback?.name?.trim() ||
    embedded?.email?.split('@')[0];
  const avatar =
    embedded?.photo_url?.trim() ||
    embedded?.avatar?.trim() ||
    (typeof embedded?.avatarUrl === 'string' ? embedded.avatarUrl.trim() : undefined) ||
    fallback?.avatar?.trim() ||
    fallback?.photoUrl?.trim();
  return {
    displayName,
    name: displayName,
    avatar: avatar ?? undefined,
    email: embedded?.email || fallback?.email,
    nhost_user_id: embedded?.nhost_user_id || embedded?.id || fallback?.id,
  };
}

/** Map API row → wizard / preview state. */
export function mapTenantProfileRow(row: TenantProfileRow): TenantProfileData {
  return {
    tenant_uuid: row.tenant_uuid,
    user_id: row.user_id,
    tenant_listing_title: row.tenant_listing_title,
    tenant_listing_description: row.tenant_listing_description,
    photo_url: row.photo_url,
    budget_min: row.budget_min,
    budget_max: row.budget_max,
    budget_currency: row.budget_currency,
    payment_preferences: row.payment_preferences || [],
    deposit_capability: row.deposit_capability,
    preferred_property_types: row.preferred_property_types || [],
    rental_space_preference: row.rental_space_preference,
    furnishing_preference: row.furnishing_preference,
    pets_allowed: row.pets_allowed,
    preferred_locations: row.preferred_locations || [],
    transportation_proximity: row.transportation_proximity || [],
    neighborhood_preferences: row.neighborhood_preferences || [],
    location_flexibility: row.location_flexibility,
    preferred_move_in_date: row.preferred_move_in_date,
    preferred_lease_duration: row.preferred_lease_duration,
    notice_period: row.notice_period,
    urgency_level: row.urgency_level,
    work_location: row.work_location,
    lifestyle_preferences: row.lifestyle_preferences || [],
    special_requirements: row.special_requirements || [],
    contact_preferences: row.contact_preferences || [],
    best_contact_times: row.best_contact_times || [],
    response_time_expectation: row.response_time_expectation,
    tenant_privacy_settings: row.privacy_settings || row.tenant_privacy_settings || {},
    tenant_listing_status: row.tenant_listing_status,
  };
}

export function parseTenantProfileResponse(body: unknown): {
  success: boolean;
  data?: TenantProfileRow | null;
  error?: string;
  notFound?: boolean;
} {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (record.success === true) {
      return { success: true, data: (record.data as TenantProfileRow) ?? null };
    }
    if (record.ok === true) {
      return { success: true, data: (record.data as TenantProfileRow) ?? null };
    }
    if (record.success === false || record.ok === false) {
      return { success: false, error: String(record.error ?? 'Request failed') };
    }
  }
  return { success: false, error: 'Invalid response' };
}

async function loadTenantProfileResponse(
  loader: () => Promise<unknown>,
): Promise<{
  success: boolean;
  data?: TenantProfileData | null;
  user?: TenantProfileEmbeddedUser | null;
  error?: string;
  notFound?: boolean;
}> {
  try {
    const raw = await loader();
    const parsed = parseTenantProfileResponse(raw);
    if (!parsed.success) {
      return parsed;
    }
    if (!parsed.data) {
      return { success: true, data: null, user: null, notFound: true };
    }
    const userId = parsed.data.user_id;
    let user = normalizeTenantProfileUser(
      parsed.data.user,
      userId,
      parsed.data.real_estate_user,
    );
    user = await ensureRealEstateEmbeddedUser(userId, user);
    return {
      success: true,
      data: mapTenantProfileRow(parsed.data),
      user,
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
      if (axiosError.response?.status === 404) {
        return { success: true, data: null, notFound: true };
      }
      return {
        success: false,
        error: axiosError.response?.data?.error ?? 'Failed to load tenant profile',
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load tenant profile',
    };
  }
}

/**
 * Logged-in user's tenant profile — BFF → Nhost `GET /v1/client/tenants/profile` (Bearer, no query).
 * Matches api-doc-v2 dashboard flow.
 */
export function fetchMyTenantProfile(_nhostUserId: string): Promise<{
  success: boolean;
  data?: TenantProfileData | null;
  user?: TenantProfileEmbeddedUser | null;
  error?: string;
  notFound?: boolean;
}> {
  return loadTenantProfileResponse(() => tenantsAPI.getMyTenantProfile());
}

/** Fetch tenant profile by `nhost_user_id` — public active or owner with JWT. */
export function fetchTenantProfileByNhostUserId(nhostUserId: string): Promise<{
  success: boolean;
  data?: TenantProfileData | null;
  user?: TenantProfileEmbeddedUser | null;
  error?: string;
  notFound?: boolean;
}> {
  return loadTenantProfileResponse(() => tenantsAPI.getTenantProfile(nhostUserId));
}

export type TenantMarketplaceParams = {
  limit?: number;
  offset?: number;
  budget_min?: string;
  budget_max?: string;
  location?: string;
  move_in_date?: string;
  property_type?: string;
  status?: string;
};

/** Fetch marketplace listings (BFF → `client/tenants`). */
export async function fetchTenantMarketplace(params: TenantMarketplaceParams = {}): Promise<{
  success: boolean;
  profiles: TenantProfileRow[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  error?: string;
}> {
  try {
    const raw = await tenantsAPI.getTenantProfiles(params);
    if (raw && typeof raw === 'object' && raw.success === true) {
      const data = raw.data;
      const rawProfiles = Array.isArray(data)
        ? (data as TenantProfileRow[])
        : data &&
            typeof data === 'object' &&
            'items' in data &&
            Array.isArray((data as { items: unknown }).items)
          ? ((data as { items: TenantProfileRow[] }).items)
          : [];
      const profiles = await Promise.all(
        rawProfiles.map(async (row) => {
          let user =
            normalizeTenantProfileUser(row.user, row.user_id, row.real_estate_user) ??
            row.user ??
            null;
          user = await ensureRealEstateEmbeddedUser(row.user_id, user);
          return { ...row, user };
        }),
      );
      return {
        success: true,
        profiles,
        pagination: raw.pagination as {
          total: number;
          limit: number;
          offset: number;
          hasMore: boolean;
        },
      };
    }
    return {
      success: false,
      profiles: [],
      error: (raw as { error?: string })?.error ?? 'Failed to load tenant profiles',
    };
  } catch (error) {
    return {
      success: false,
      profiles: [],
      error: error instanceof Error ? error.message : 'Failed to load tenant profiles',
    };
  }
}
