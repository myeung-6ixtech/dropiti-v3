import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';
import type { CreateUserInput } from '@/types';

const CREATE_USER_MUTATION = `
  mutation CreateUser($user: users_insert_input!) {
    insert_users_one(object: $user) {
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

export async function POST(request: NextRequest) {
  try {
    const userData: CreateUserInput = await request.json();

    // Validate required fields
    const requiredFields = ['firebase_uid', 'display_name', 'email'] as const;
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const CHECK_USER_EXISTS = `
      query CheckUserExists($firebase_uid: String!) {
        users(where: { firebase_uid: { _eq: $firebase_uid } }, limit: 1) {
          id
        }
      }
    `;

    const existingUser = await executeMutation(CHECK_USER_EXISTS, { firebase_uid: userData.firebase_uid });
    
    // Type assertion for the response data
    const typedExistingUser = existingUser as {
      users?: Array<{ id: string }>;
    };
    
    if (typedExistingUser?.users && typedExistingUser.users.length > 0) {
      return NextResponse.json(
        { error: 'User already exists with this Firebase UID' },
        { status: 409 }
      );
    }

    // Prepare the user object for Hasura
    const user = {
      firebase_uid: userData.firebase_uid,
      display_name: userData.display_name,
      email: userData.email,
      photo_url: userData.photo_url || null,
      auth_provider: userData.auth_provider || 'firebase',
      user_since: new Date().toISOString(),
      phone_number: userData.phone_number || null,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      location: userData.location || null,
      about: userData.about || null,
      education: userData.education || null,
      occupation: userData.occupation || null,
      marital_status: userData.marital_status || null,
      languages: userData.languages || [],
      response_time: null, // Will be set when user starts responding
      verified: false, // Default to false
      rating: 0.0, // Default to 0
      review_count: 0, // Default to 0
      response_rate: 0.0, // Default to 0
      avg_response_time: null,
      total_properties: 0, // Default to 0
      total_guests: 0, // Default to 0
      preferences: userData.preferences || {},
      notification_settings: {
        email: true,
        push: true,
        sms: false,
        marketing_emails: false,
        property_updates: true,
        message_notifications: true,
        booking_notifications: true,
        review_notifications: true,
        ...userData.notification_settings
      },
      privacy_settings: {
        profileVisibility: 'public',
        showContactInfo: true,
        showEmail: true,
        showPhone: false,
        showLocation: true,
        allowMessages: true,
        allowReviews: true,
        ...userData.privacy_settings
      },
    };

    const data = await executeMutation(CREATE_USER_MUTATION, { user });

    // Type assertion for the response data
    const typedData = data as {
      insert_users_one: {
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

    if (!typedData.insert_users_one) {
      throw new Error('Failed to create user');
    }

    return NextResponse.json({
      success: true,
      data: typedData.insert_users_one,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
