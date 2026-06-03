// Server-side GraphQL client for API routes

/**
 * Cache tags used throughout the app.
 * Tag a fetch with one of these and call revalidateTag() from
 * /api/revalidate to bust that slice of the cache on demand.
 */
export const CACHE_TAGS = {
  properties: 'properties',
} as const;

export const executeGraphQLRequest = async <T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  endpoint?: string,
  options?: {
    /** Cache tags for on-demand revalidation via /api/revalidate */
    tags?: string[];
    /** Time-based revalidation in seconds (default 60) */
    revalidate?: number;
  }
): Promise<T> => {
  try {
    // Use provided endpoint or fallback to environment variable
    const hasuraEndpoint = endpoint || process.env.HASURA_ENDPOINT;
    const hasuraAdminSecret = process.env.HASURA_ADMIN_SECRET;

    if (!hasuraEndpoint) {
      throw new Error('Hasura endpoint not configured');
    }

    const response = await fetch(hasuraEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': hasuraAdminSecret || '',
      },
      body: JSON.stringify({ query, variables }),
      next: {
        revalidate: options?.revalidate ?? 60,
        tags: options?.tags,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `GraphQL request failed: ${response.status}`);
    }

               const result = await response.json();
           
           // Check for GraphQL errors
           if (result.errors && result.errors.length > 0) {
             console.error('GraphQL errors:', result.errors);
             throw new Error(result.errors[0].message || 'GraphQL request failed');
           }
           
           return result.data;
  } catch (error) {
    console.error('Server GraphQL request error:', error);
    throw error;
  }
};

// Helper function to execute queries (no caching — safe for user-specific data)
export const executeQuery = async <T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> => {
  try {
    return await executeGraphQLRequest<T>(query, variables, undefined, { revalidate: 0 });
  } catch (error) {
    console.error('Server GraphQL query error:', error);
    throw error;
  }
};

/**
 * Execute a read-only query with time-based + tag-based caching.
 * Use this for public data (listings, properties) that the admin can
 * invalidate on-demand by calling POST /api/revalidate.
 */
export const executeQueryCached = async <T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  tags?: string[],
  revalidate = 60
): Promise<T> => {
  try {
    return await executeGraphQLRequest<T>(query, variables, undefined, { tags, revalidate });
  } catch (error) {
    console.error('Server GraphQL cached query error:', error);
    throw error;
  }
};

// Helper function to execute mutations (always bypasses cache)
export const executeMutation = async <T = unknown>(mutation: string, variables?: Record<string, unknown>): Promise<T> => {
  try {
    return await executeGraphQLRequest<T>(mutation, variables, undefined, { revalidate: 0 });
  } catch (error) {
    console.error('Server GraphQL mutation error:', error);
    throw error;
  }
};
