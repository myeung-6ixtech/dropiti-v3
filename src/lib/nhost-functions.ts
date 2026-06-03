/**
 * Nhost Functions client helpers.
 * Browser code uses the same-origin BFF because `nhost_access_token` is httpOnly.
 */

export type FunctionsOk<T> = {
  ok: true;
  data: T;
};

export type FunctionsFail = {
  ok: false;
  error: string;
  details?: unknown;
};

export type FunctionsEnvelope<T> = FunctionsOk<T> | FunctionsFail;

export function useNhostFunctions(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FUNCTIONS_URL?.trim());
}

export const FUNCTIONS_BFF_PREFIX = "/api/v1/bff/functions";

/** GET routes that allow anonymous access (Nhost `optionalAuth`). */
export const PUBLIC_CLIENT_BFF_GET_PATHS = new Set([
  "client/transfer-ownership/validate",
  "client/properties/get-listings",
  "client/properties/get-property",
  "client/properties/get-property-by-uuid",
  "client/reviews/get-reviews-by-property",
  "client/reviews/get-reviews-by-user",
  "client/users/get-user-by-id",
  "client/tenants",
  "client/tenants/profile",
]);

export function isPublicClientBffRoute(method: string, subPath: string): boolean {
  return method === "GET" && PUBLIC_CLIENT_BFF_GET_PATHS.has(subPath);
}

export function functionsBffUrl(clientPath: string, search?: URLSearchParams): string {
  const path = clientPath.replace(/^\//, "");
  const qs = search?.toString();
  return `${FUNCTIONS_BFF_PREFIX}/${path}${qs ? `?${qs}` : ""}`;
}

/** Map `{ ok, data }` to legacy `{ success, data }` for gradual migration. */
export function parseFunctionsEnvelope<T>(body: unknown): {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
} {
  if (body && typeof body === "object" && "ok" in body) {
    const env = body as FunctionsEnvelope<T>;
    if (env.ok) {
      return { success: true, data: env.data };
    }
    return { success: false, error: env.error, details: env.details };
  }
  const legacy = body as { success?: boolean; data?: T; error?: string };
  return {
    success: legacy.success ?? false,
    data: legacy.data,
    error: legacy.error,
  };
}

/** Resolve API path: legacy Next route or BFF → Nhost Functions. */
export function resolveApiPath(
  legacyPath: string,
  functionsPath: string
): string {
  if (!useNhostFunctions()) {
    return legacyPath;
  }
  return functionsBffUrl(functionsPath);
}
