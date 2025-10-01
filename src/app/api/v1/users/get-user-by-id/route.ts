import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_USER_BY_FIREBASE_UID_QUERY = `
  query GetUserByFirebaseUid($firebase_uid: String!) {
    real_estate_user(where: { firebase_uid: { _eq: $firebase_uid } }, limit: 1) {
      uuid
      firebase_uid
      display_name
      email
      photo_url
      auth_provider
      phone_number
      location
      about
      education
      occupation
      marital_status
      languages
      verified
      rating
      review_count
      response_rate
      preferences
      notification_settings
      privacy_settings
      created_at
      updated_at
    }
  }
`;

// Test query to check available tables
const TEST_QUERY = `
  query TestQuery {
    __schema {
      types {
        name
        kind
      }
    }
  }
`;

const GET_USER_BY_ID_QUERY = `
  query GetUserById($id: String!) {
    real_estate_user(where: { firebase_uid: { _eq: $id } }, limit: 1) {
      uuid
      firebase_uid
      display_name
      email
      photo_url
      auth_provider
      phone_number
      location
      about
      education
      occupation
      marital_status
      languages
      verified
      rating
      review_count
      response_rate
      preferences
      notification_settings
      privacy_settings
      created_at
      updated_at
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebase_uid');
    const userId = searchParams.get('id');

    console.log('API Route: Received request with params:', { firebaseUid, userId });

    if (!firebaseUid && !userId) {
      console.log('API Route: Missing required parameters');
      return NextResponse.json(
        { error: 'Either firebase_uid or id parameter is required' },
        { status: 400 }
      );
    }

    let data;

    if (firebaseUid) {
      // Get user by Firebase UID
      console.log('API Route: Executing GraphQL query for Firebase UID:', firebaseUid);
      
      // First, let's test the schema to see what's available
      try {
        console.log('API Route: Testing GraphQL schema...');
        const schemaTest = await executeQuery(TEST_QUERY, {});
        console.log('API Route: Schema test result:', schemaTest);
      } catch (schemaError) {
        console.error('API Route: Schema test failed:', schemaError);
      }
      
      try {
        data = await executeQuery(GET_USER_BY_FIREBASE_UID_QUERY, { firebase_uid: firebaseUid });
        console.log('API Route: GraphQL query result (user table):', data);
      } catch (graphqlError) {
        console.error('API Route: GraphQL query failed (user table):', graphqlError);
        throw graphqlError;
      }
    } else {
      // Get user by ID
      console.log('API Route: Executing GraphQL query for user ID:', userId);
      try {
        data = await executeQuery(GET_USER_BY_ID_QUERY, { id: userId });
        console.log('API Route: GraphQL query result:', data);
      } catch (graphqlError) {
        console.error('API Route: GraphQL query failed:', graphqlError);
        throw graphqlError;
      }
    }

    // Type assertion for the response data
    const typedData = data as {
      real_estate_user?: Array<{
        uuid: string;
        firebase_uid: string;
        display_name: string;
        email: string;
        photo_url?: string;
        auth_provider: string;
        phone_number?: string;
        location?: string;
        about?: string;
        education?: string;
        occupation?: string;
        marital_status?: string;
        languages?: string[];
        verified: boolean;
        rating: number;
        review_count: number;
        response_rate: number;
        preferences: Record<string, unknown>;
        notification_settings: Record<string, unknown>;
        privacy_settings: Record<string, unknown>;
        created_at: string;
        updated_at: string;
      }>;
    };

    console.log('API Route: Typed data structure:', typedData);

    // Handle response based on query type
    let user;
    if (firebaseUid) {
      if (!typedData.real_estate_user || typedData.real_estate_user.length === 0) {
        console.log('API Route: No user found for Firebase UID:', firebaseUid);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      user = typedData.real_estate_user[0];
      console.log('API Route: Found user by Firebase UID:', user.firebase_uid);
    } else {
      if (!typedData.real_estate_user || typedData.real_estate_user.length === 0) {
        console.log('API Route: No user found for ID:', userId);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      user = typedData.real_estate_user[0];
      console.log('API Route: Found user by ID:', user.firebase_uid);
    }

    console.log('API Route: Returning user data successfully');
    return NextResponse.json({
      success: true,
      data: user,
      message: 'User retrieved successfully',
    });
  } catch (error) {
    console.error('API Route: Get user error:', error);
    console.error('API Route: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to retrieve user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
