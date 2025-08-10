// Export the server-side client for API routes
export { 
    executeQuery,
    executeMutation,
    executeGraphQLRequest
  } from './serverClient';

// Export the client-side client for frontend components
export { 
    hasuraClient, 
    createUserClient, 
    hasuraEndpoint,
    executeQuery as executeClientQuery,
    executeMutation as executeClientMutation,
    executeSubscription 
  } from './client';
  
// Export types
export * from './types';

// Export services
export { PropertyService } from './services/propertyService';