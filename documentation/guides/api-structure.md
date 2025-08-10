# Dropiti API Structure Guide

## Overview

This document outlines the API structure for the Dropiti platform, which follows Next.js 13+ App Router standards and integrates with Hasura GraphQL for data operations.

## Architecture

The API follows a layered architecture:

```
Frontend (React) → API Client → Next.js API Routes → GraphQL Client → Hasura
```

## Directory Structure

```
src/app/api/
├── auth/                    # NextAuth.js authentication routes
├── graphql/                 # GraphQL client and services
│   ├── client.ts           # GraphQL client configuration
│   ├── route.ts            # Main GraphQL endpoint
│   └── services/           # Service layer for GraphQL operations
│       └── propertyService.ts
├── v1/                     # Versioned API endpoints
│   ├── properties/         # Property-related endpoints
│   │   ├── get-listings/   # GET /api/v1/properties/get-listings
│   │   ├── get-property/   # GET /api/v1/properties/get-property
│   │   ├── create-property/ # POST /api/v1/properties/create-property
│   │   └── update-property/ # PUT /api/v1/properties/update-property
│   └── offers/             # Offer-related endpoints
│       ├── get-offers/     # GET /api/v1/offers/get-offers
│       └── create-offer/   # POST /api/v1/offers/create-offer
└── route.ts                # Base API route (placeholder)
```

## API Endpoints

### Properties

#### GET /api/v1/properties/get-listings
Retrieves a paginated list of properties with optional filtering.

**Query Parameters:**
- `limit` (optional): Number of properties per page (default: 10)
- `offset` (optional): Number of properties to skip (default: 0)
- `location` (optional): Filter by location (partial match)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `bedrooms` (optional): Minimum number of bedrooms
- `type` (optional): Property type filter

**Example:**
```typescript
import { propertiesAPI } from '@/lib/api-client';

const response = await propertiesAPI.getListings({
  limit: 20,
  offset: 0,
  location: 'Downtown',
  minPrice: 1000,
  maxPrice: 3000,
  bedrooms: 2
});
```

#### GET /api/v1/properties/get-property
Retrieves a single property by ID.

**Query Parameters:**
- `id`: Property UUID

**Example:**
```typescript
const property = await propertiesAPI.getProperty('property-uuid-here');
```

#### POST /api/v1/properties/create-property
Creates a new property listing.

**Request Body:**
```typescript
{
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  images?: string[];
  details?: {
    type: string;
    furnished: string;
    petsAllowed: boolean;
    parking: boolean;
  };
  rules?: string[];
  amenities?: string[];
  minimumLease?: number;
  availableDate?: string | null;
  ownerId: string;
}
```

**Example:**
```typescript
const newProperty = await propertiesAPI.createProperty({
  title: 'Modern Downtown Apartment',
  description: 'Beautiful 2-bedroom apartment...',
  location: 'Downtown',
  price: 2500,
  bedrooms: 2,
  bathrooms: 2,
  ownerId: 'user-uuid-here'
});
```

#### PUT /api/v1/properties/update-property
Updates an existing property listing.

**Request Body:**
```typescript
{
  id: string;
  updates: {
    title?: string;
    description?: string;
    location?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    images?: string[];
    details?: any;
    rules?: string[];
    amenities?: string[];
    minimumLease?: number;
    availableDate?: string | null;
  };
}
```

**Example:**
```typescript
const updatedProperty = await propertiesAPI.updateProperty('property-uuid', {
  price: 2600,
  description: 'Updated description...'
});
```

### Offers

#### GET /api/v1/offers/get-offers
Retrieves offers (incoming or outgoing) for a user.

**Query Parameters:**
- `userId`: User UUID
- `type`: Either 'incoming' or 'outgoing'
- `limit` (optional): Number of offers per page (default: 10)
- `offset` (optional): Number of offers to skip (default: 0)

**Example:**
```typescript
import { offersAPI } from '@/lib/api-client';

const incomingOffers = await offersAPI.getOffers({
  userId: 'user-uuid-here',
  type: 'incoming',
  limit: 20
});
```

#### POST /api/v1/offers/create-offer
Creates a new rental offer.

**Request Body:**
```typescript
{
  propertyId: string;
  userId: string;
  amount: number;
  message: string;
}
```

**Example:**
```typescript
const newOffer = await offersAPI.createOffer({
  propertyId: 'property-uuid-here',
  userId: 'user-uuid-here',
  amount: 2400,
  message: 'I would like to rent this property...'
});
```

## GraphQL Integration

### Main GraphQL Endpoint
All GraphQL requests are routed through `/api/graphql`, which forwards requests to Hasura.

**Environment Variables Required:**
```env
HASURA_ENDPOINT=https://your-hasura-instance.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret
```

### GraphQL Client
The client is configured in `src/app/api/graphql/client.ts` and provides:

- `executeQuery()`: For GraphQL queries
- `executeMutation()`: For GraphQL mutations
- `executeSubscription()`: For GraphQL subscriptions (if using WebSocket)

### Service Layer
Business logic is encapsulated in service classes:

```typescript
import { PropertyService } from '@/app/api/graphql/services/propertyService';

// Get properties with filters
const properties = await PropertyService.getProperties(20, 0, {
  location: 'Downtown',
  minPrice: 1000,
  maxPrice: 3000
});

// Create a new property
const newProperty = await PropertyService.createProperty(propertyData);
```

## Frontend Usage

### API Client
Use the pre-configured API client from `@/lib/api-client`:

```typescript
import { propertiesAPI, offersAPI } from '@/lib/api-client';

// Get properties
const { data, pagination } = await propertiesAPI.getListings({
  limit: 20,
  location: 'Downtown'
});

// Create an offer
const offer = await offersAPI.createOffer({
  propertyId: 'uuid',
  userId: 'uuid',
  amount: 2500,
  message: 'Interested in renting'
});
```

### Error Handling
The API client includes automatic error handling:

```typescript
try {
  const properties = await propertiesAPI.getListings();
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized access
  } else if (error.response?.status === 404) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

## Authentication & Authorization

### NextAuth.js Integration
The API integrates with NextAuth.js for authentication:

- Protected routes can check for valid sessions
- User context is available in API routes
- JWT tokens can be validated

### Hasura Permissions
Hasura handles row-level security and permissions:

- Users can only access their own data
- Property owners can only modify their properties
- Offers are restricted to relevant parties

## Best Practices

### 1. Input Validation
Always validate input data in API routes:

```typescript
// Validate required fields
const requiredFields = ['title', 'description', 'location'];
for (const field of requiredFields) {
  if (!propertyData[field]) {
    return NextResponse.json(
      { error: `${field} is required` },
      { status: 400 }
    );
  }
}
```

### 2. Error Handling
Provide meaningful error messages:

```typescript
try {
  // API logic
} catch (error) {
  console.error('API error:', error);
  return NextResponse.json(
    { error: 'Failed to process request' },
    { status: 500 }
  );
}
```

### 3. Type Safety
Use TypeScript interfaces for request/response types:

```typescript
interface CreatePropertyRequest {
  title: string;
  description: string;
  // ... other fields
}

export async function POST(request: NextRequest) {
  const propertyData: CreatePropertyRequest = await request.json();
  // ... rest of the logic
}
```

### 4. Pagination
Implement consistent pagination across endpoints:

```typescript
return NextResponse.json({
  success: true,
  data: results,
  pagination: {
    total: totalCount,
    limit,
    offset,
    hasMore: offset + limit < totalCount,
  },
});
```

## Future Enhancements

### Planned Endpoints
- `/api/v1/users/profile` - User profile management
- `/api/v1/search/properties` - Advanced property search
- `/api/v1/bookings` - Property booking system
- `/api/v1/reviews` - Property reviews and ratings

### GraphQL Features
- Real-time subscriptions for live updates
- Optimistic updates for better UX
- GraphQL fragments for reusable queries

### Performance Optimizations
- Response caching with Redis
- Database query optimization
- CDN integration for static assets

## Troubleshooting

### Common Issues

1. **GraphQL Connection Errors**
   - Check `HASURA_ENDPOINT` environment variable
   - Verify Hasura instance is running
   - Check network connectivity

2. **Authentication Errors**
   - Ensure NextAuth.js is properly configured
   - Check session validity
   - Verify JWT token format

3. **Type Errors**
   - Ensure TypeScript interfaces match Hasura schema
   - Check for missing or incorrect field types
   - Validate GraphQL query syntax

### Debug Mode
Enable debug logging in development:

```typescript
// In authOptions.ts
export const authOptions: NextAuthOptions = {
  debug: true,
  // ... other options
};
```

## Support

For API-related issues:
1. Check the browser console for error messages
2. Review server logs for detailed error information
3. Verify environment variables are set correctly
4. Test GraphQL queries directly in Hasura console

---

*This document is maintained by the Dropiti development team. Last updated: December 2024*
