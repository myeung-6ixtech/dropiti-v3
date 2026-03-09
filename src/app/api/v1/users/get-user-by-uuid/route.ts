import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_USER_BY_UUID_QUERY = `
  query GetUserByUuid($id: uuid!) {
    real_estate_user(
      where: { nhost_user_id: { _eq: $id } }
      limit: 1
    ) {
      uuid
      nhost_user_id
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
    const userUuid = searchParams.get('uuid') || searchParams.get('id');

    if (!userUuid) {
      return NextResponse.json(
        { error: 'UUID parameter is required' },
        { status: 400 }
      );
    }

    const userData = await executeQuery(GET_USER_BY_UUID_QUERY, { id: userUuid });

    // Type assertion for the response data
    const typedUserData = userData as {
      real_estate_user?: Array<{
        uuid: string;
        nhost_user_id: string;
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

    if (!typedUserData.real_estate_user?.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = typedUserData.real_estate_user[0];

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User retrieved successfully',
    });
  } catch (error) {
    console.error('Get user by UUID error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
