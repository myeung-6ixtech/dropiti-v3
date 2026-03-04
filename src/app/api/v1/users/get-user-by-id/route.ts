import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_USER_BY_NHOST_ID = `
  query GetUserByNhostId($nhost_user_id: uuid!) {
    real_estate_user(where: { nhost_user_id: { _eq: $nhost_user_id } }, limit: 1) {
      uuid
      nhost_user_id
      display_name
      first_name
      last_name
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
      onboarding_complete
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
    const nhostUserId = searchParams.get('nhost_user_id') || searchParams.get('id');

    if (!nhostUserId) {
      return NextResponse.json(
        { error: 'nhost_user_id parameter is required' },
        { status: 400 },
      );
    }

    const data = await executeQuery(GET_USER_BY_NHOST_ID, { nhost_user_id: nhostUserId });

    const typedData = data as {
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
        onboarding_complete: boolean;
        preferences: Record<string, unknown>;
        notification_settings: Record<string, unknown>;
        privacy_settings: Record<string, unknown>;
        created_at: string;
        updated_at: string;
      }>;
    };

    if (!typedData.real_estate_user?.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: typedData.real_estate_user[0],
      message: 'User retrieved successfully',
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
