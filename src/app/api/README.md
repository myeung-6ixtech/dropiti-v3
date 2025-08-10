# Dropiti API

This directory contains all API routes for the Dropiti platform, following Next.js 13+ App Router standards.

## Quick Start

1. **Environment Variables**: Set up your `.env.local` file:
   ```env
   HASURA_ENDPOINT=https://your-hasura-instance.hasura.app/v1/graphql
   HASURA_ADMIN_SECRET=your-admin-secret
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

2. **Test the API**: Visit `/api` to see available endpoints

3. **Use the API Client**: Import from `@/lib/api-client` in your components

## Structure Overview

- **`/api`** - Base API information
- **`/api/graphql`** - GraphQL endpoint and client
- **`/api/v1/*`** - Versioned REST endpoints
- **`/api/auth`** - NextAuth.js authentication

## Development

### Adding New Endpoints

1. Create a new directory under `v1/` for your resource
2. Add `route.ts` with HTTP methods (GET, POST, PUT, DELETE)
3. Use the GraphQL client for data operations
4. Add types to the service layer
5. Update the API client in `@/lib/api-client.ts`
6. Document in `documentation/guides/api-structure.md`

### Example Endpoint

```typescript
// src/app/api/v1/users/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Your logic here
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Testing

Test your endpoints using:

- **Browser**: Visit `/api/v1/properties/get-listings`
- **Postman/Insomnia**: Send requests to your endpoints
- **Frontend**: Use the API client in your React components

## Error Handling

All endpoints should:
- Return appropriate HTTP status codes
- Include meaningful error messages
- Log errors for debugging
- Handle edge cases gracefully

## Security

- Validate all input data
- Check user permissions where applicable
- Use environment variables for sensitive data
- Implement rate limiting for production

## Performance

- Use pagination for large datasets
- Implement caching where appropriate
- Optimize GraphQL queries
- Monitor response times

---

For detailed documentation, see `documentation/guides/api-structure.md`
