import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, variables } = await request.json();
    
    // Get Hasura endpoint from environment variables
    const hasuraEndpoint = process.env.HASURA_ENDPOINT;
    const hasuraAdminSecret = process.env.HASURA_ADMIN_SECRET;
    
    if (!hasuraEndpoint) {
      return NextResponse.json(
        { error: 'Hasura endpoint not configured' },
        { status: 500 }
      );
    }

    // Forward the GraphQL request to Hasura
    const response = await fetch(hasuraEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': hasuraAdminSecret || '',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    
    // Check for GraphQL errors in the response
    if (data.errors && data.errors.length > 0) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json(
        { error: data.errors[0].message || 'GraphQL request failed' },
        { status: 400 }
      );
    }
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'GraphQL request failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GraphQL API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
