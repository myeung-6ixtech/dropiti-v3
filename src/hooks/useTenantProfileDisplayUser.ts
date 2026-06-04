'use client';

import { useEffect, useState } from 'react';
import {
  ensureRealEstateEmbeddedUser,
  normalizeTenantProfileUser,
  resolveTenantProfileDisplayUser,
  type TenantProfileDisplayUser,
  type TenantProfileEmbeddedUser,
} from '@/lib/tenant-profiles';

type AuthFallback = {
  displayName?: string;
  name?: string;
  avatar?: string;
  photoUrl?: string;
  email?: string;
  id?: string;
};

/**
 * Resolves display name + avatar from `real_estate.user`, with optional session fallback.
 */
export function useTenantProfileDisplayUser(
  nhostUserId: string | undefined,
  embeddedUser: TenantProfileEmbeddedUser | null | undefined,
  authFallback?: AuthFallback,
): { displayUser: TenantProfileDisplayUser; loading: boolean } {
  const [resolvedUser, setResolvedUser] = useState<TenantProfileEmbeddedUser | null>(null);
  const [loading, setLoading] = useState(Boolean(nhostUserId));

  useEffect(() => {
    if (!nhostUserId) {
      setResolvedUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      const base =
        normalizeTenantProfileUser(embeddedUser, nhostUserId) ?? embeddedUser ?? null;
      const user = await ensureRealEstateEmbeddedUser(nhostUserId, base);
      if (!cancelled) {
        setResolvedUser(user);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nhostUserId, embeddedUser]);

  const displayUser = resolveTenantProfileDisplayUser(resolvedUser, authFallback);
  return { displayUser, loading };
}
