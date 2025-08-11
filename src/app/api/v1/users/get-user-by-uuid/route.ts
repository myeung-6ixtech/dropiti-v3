import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_USER_BY_UUID_QUERY = `
  query GetUserByUuid($uuid: uuid!) {
    real_estate_user(where: { uuid: { _eq: $uuid } }, limit: 1) {
      uuid
      firebase_uid
      display_name
      email
      photo_url
      auth_provider
      user_since
      phone_number
      first_name
      last_name
      location
      about
      education
      occupation
      marital_status
      languages
      response_time
      verified
      rating
      review_count
      response_rate
      avg_response_time
      total_properties
      total_guests
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
    const userUuid = searchParams.get('uuid');

    console.log('Get User by UUID API: Received request with uuid:', userUuid);

    if (!userUuid) {
      console.log('Get User by UUID API: Missing uuid parameter');
      return NextResponse.json(
        { error: 'UUID parameter is required' },
        { status: 400 }
      );
    }

    // Get user by UUID
    console.log('Get User by UUID API: Executing GraphQL query for uuid:', userUuid);
    const userData = await executeQuery(GET_USER_BY_UUID_QUERY, { uuid: userUuid });

    console.log('Get User by UUID API: Raw GraphQL response:', userData);

    // Type assertion for the response data
    const typedUserData = userData as {
      real_estate_user?: Array<{
        uuid: string;
        firebase_uid: string;
        display_name: string;
        email: string;
        photo_url?: string;
        auth_provider: string;
        user_since: string;
        phone_number?: string;
        first_name?: string;
        last_name?: string;
        location?: string;
        about?: string;
        education?: string;
        occupation?: string;
        marital_status?: string;
        languages?: string[];
        response_time?: string;
        verified: boolean;
        rating: number;
        review_count: number;
        response_rate: number;
        avg_response_time?: string;
        total_properties: number;
        total_guests: number;
        preferences: Record<string, unknown>;
        notification_settings: Record<string, unknown>;
        privacy_settings: Record<string, unknown>;
        created_at: string;
        updated_at: string;
      }>;
    };

    if (!typedUserData.real_estate_user || typedUserData.real_estate_user.length === 0) {
      console.log('Get User by UUID API: No user found for UUID:', userUuid);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = typedUserData.real_estate_user[0];
    console.log('Get User by UUID API: Found user:', user.display_name);

    // Return the user data
    return NextResponse.json({
      success: true,
      data: user,
      message: 'User retrieved successfully',
    });
  } catch (error) {
    console.error('Get User by UUID API: Error:', error);
    console.error('Get User by UUID API: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to retrieve user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
