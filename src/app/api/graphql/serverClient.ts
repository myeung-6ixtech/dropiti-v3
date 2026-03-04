// Server-side GraphQL client for API routes
export const executeGraphQLRequest = async <T = unknown>(
  query: string, 
  variables?: Record<string, unknown>,
  endpoint?: string
): Promise<T> => {
  try {
    // Use provided endpoint or fallback to environment variable
    const hasuraEndpoint = endpoint || process.env.HASURA_ENDPOINT || process.env.NEXT_PUBLIC_HASURA_GRAPHQL_API_URL;
    const hasuraAdminSecret = process.env.HASURA_ADMIN_SECRET || process.env.HASURA_GRAPHQL_ADMIN_SECRET;
    
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

// Helper function to execute queries
export const executeQuery = async <T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> => {
  try {
    return await executeGraphQLRequest<T>(query, variables);
  } catch (error) {
    console.error('Server GraphQL query error:', error);
    throw error;
  }
};

// Helper function to execute mutations
export const executeMutation = async <T = unknown>(mutation: string, variables?: Record<string, unknown>): Promise<T> => {
  try {
    return await executeGraphQLRequest<T>(mutation, variables);
  } catch (error) {
    console.error('Server GraphQL mutation error:', error);
    throw error;
  }
};
