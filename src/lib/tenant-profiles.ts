import { tenantsAPI } from '@/lib/api-client';
import { useNhostFunctions } from '@/lib/nhost-functions';
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
};

/** Map API `user` (auth.users or real_estate_user) to a single embedded shape. */
export function normalizeTenantProfileUser(
  raw: unknown,
  userId?: string,
): TenantProfileEmbeddedUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const u = raw as Record<string, unknown>;
  const nhostId =
    String(u.nhost_user_id ?? u.id ?? userId ?? '').trim() || undefined;

  if ('avatarUrl' in u || (u.id && !u.display_name && !u.photo_url)) {
    const avatarUrl = (u.avatarUrl as string | null) ?? undefined;
    const email = u.email as string | undefined;
    return {
      id: String(u.id ?? userId ?? ''),
      email,
      avatarUrl,
      nhost_user_id: nhostId,
      display_name: email?.split('@')[0],
      photo_url: avatarUrl,
      avatar: avatarUrl,
    };
  }

  return {
    uuid: u.uuid as string | undefined,
    nhost_user_id: nhostId,
    display_name: (u.display_name as string) || (u.name as string),
    name: u.name as string | undefined,
    photo_url: (u.photo_url as string) || (u.avatar as string),
    avatar: (u.avatar as string) || (u.photo_url as string),
    email: u.email as string | undefined,
    rating: u.rating as number | undefined,
    review_count: u.review_count as number | undefined,
    id: nhostId,
  };
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
    embedded?.email?.split('@')[0] ||
    fallback?.displayName ||
    fallback?.name;
  const avatar =
    embedded?.photo_url ||
    embedded?.avatar ||
    embedded?.avatarUrl ||
    fallback?.avatar ||
    fallback?.photoUrl;
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
    return {
      success: true,
      data: mapTenantProfileRow(parsed.data),
      user: normalizeTenantProfileUser(parsed.data.user, parsed.data.user_id),
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
export function fetchMyTenantProfile(nhostUserId: string): Promise<{
  success: boolean;
  data?: TenantProfileData | null;
  user?: TenantProfileEmbeddedUser | null;
  error?: string;
  notFound?: boolean;
}> {
  return loadTenantProfileResponse(() =>
    useNhostFunctions()
      ? tenantsAPI.getMyTenantProfile()
      : tenantsAPI.getTenantProfile(nhostUserId),
  );
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
      const profiles = rawProfiles.map((row) => ({
        ...row,
        user: normalizeTenantProfileUser(row.user, row.user_id) ?? row.user ?? null,
      }));
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
