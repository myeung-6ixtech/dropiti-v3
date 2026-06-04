import type { TenantProfileEmbeddedUser, TenantProfileRow } from '@/lib/tenant-profiles';
import { normalizeTenantProfileUser } from '@/lib/tenant-profiles';

/** Raw Hasura tenant profile row from Nhost `client/tenants`. */
export type RawTenantProfileRow = Record<string, unknown>;

export function isRawTenantProfileRow(value: unknown): value is RawTenantProfileRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    'tenant_listing_title' in row ||
    'tenant_uuid' in row ||
    'tenant_listing_status' in row
  );
}

export function isTenantProfileItemsPayload(items: unknown[]): boolean {
  return items.length > 0 && items.some(isRawTenantProfileRow);
}

/** Preserve tenant fields; normalize embedded `user` for cards and preview. */
export function normalizeTenantProfile(row: RawTenantProfileRow): TenantProfileRow {
  const userId = row.user_id != null ? String(row.user_id) : undefined;
  const reUser = row.real_estate_user;
  const user = normalizeTenantProfileUser(row.user, userId, reUser);

  return {
    ...(row as TenantProfileRow),
    user: user ?? null,
  };
}

export function normalizeTenantProfiles(items: unknown[]): TenantProfileRow[] {
  return items.map((item) => {
    if (isRawTenantProfileRow(item)) {
      return normalizeTenantProfile(item);
    }
    return item as TenantProfileRow;
  });
}
