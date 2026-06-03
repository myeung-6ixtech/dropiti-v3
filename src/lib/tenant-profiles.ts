import { tenantsAPI } from '@/lib/api-client';
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

export type TenantProfileRow = TenantProfileData & {
  id?: string | number;
  tenant_uuid?: string;
  user_id?: string;
  privacy_settings?: Record<string, boolean>;
  user?: {
    uuid?: string;
    nhost_user_id?: string;
    display_name?: string;
    name?: string;
    photo_url?: string;
    avatar?: string;
    email?: string;
    rating?: number;
    review_count?: number;
  } | null;
};

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

/** Fetch tenant profile by Nhost user id (BFF → `client/tenants/profile`). */
export async function fetchTenantProfileByNhostUserId(nhostUserId: string): Promise<{
  success: boolean;
  data?: TenantProfileData | null;
  error?: string;
  notFound?: boolean;
}> {
  try {
    const raw = await tenantsAPI.getTenantProfile(nhostUserId);
    const parsed = parseTenantProfileResponse(raw);
    if (!parsed.success) {
      return parsed;
    }
    if (!parsed.data) {
      return { success: true, data: null, notFound: true };
    }
    return { success: true, data: mapTenantProfileRow(parsed.data) };
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
      const profiles = Array.isArray(data)
        ? (data as TenantProfileRow[])
        : data &&
            typeof data === 'object' &&
            'items' in data &&
            Array.isArray((data as { items: unknown }).items)
          ? ((data as { items: TenantProfileRow[] }).items)
          : [];
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
