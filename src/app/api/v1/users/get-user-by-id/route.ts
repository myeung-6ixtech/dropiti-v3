import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_USER_BY_FIREBASE_UID_QUERY = `
  query GetUserByFirebaseUid($firebase_uid: String!) {
    user(where: { firebase_uid: { _eq: $firebase_uid } }, limit: 1) {
      id
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

const GET_USER_BY_ID_QUERY = `
  query GetUserById($id: uuid!) {
    users_by_pk(id: $id) {
      id
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
    const firebaseUid = searchParams.get('firebase_uid');
    const userId = searchParams.get('id');

    if (!firebaseUid && !userId) {
      return NextResponse.json(
        { error: 'Either firebase_uid or id parameter is required' },
        { status: 400 }
      );
    }

    let data;

    if (firebaseUid) {
      // Get user by Firebase UID
      data = await executeQuery(GET_USER_BY_FIREBASE_UID_QUERY, { firebase_uid: firebaseUid });
    } else {
      // Get user by ID
      data = await executeQuery(GET_USER_BY_ID_QUERY, { id: userId });
    }

    // Type assertion for the response data
    const typedData = data as {
      user?: Array<{
        id: string;
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
      users_by_pk?: {
        id: string;
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
      };
    };

    // Handle response based on query type
    let user;
    if (firebaseUid) {
      if (!typedData.user || typedData.user.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      user = typedData.user[0];
    } else {
      if (!typedData.users_by_pk) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      user = typedData.users_by_pk;
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User retrieved successfully',
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user' },
      { status: 500 }
    );
  }
}
