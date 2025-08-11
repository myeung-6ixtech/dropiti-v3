import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: uuid!, $updates: user_set_input!) {
    update_user_by_pk(
      pk_columns: { id: $id }
      _set: $updates
    ) {
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

export async function PUT(request: NextRequest) {
  try {
    const { id, updates } = await request.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Update data is required' },
        { status: 400 }
      );
    }

    // Validate update fields
    const allowedFields = [
      'display_name',
      'photo_url',
      'phone_number',
      'first_name',
      'last_name',
      'location',
      'about',
      'education',
      'occupation',
      'marital_status',
      'languages',
      'response_time',
      'verified',
      'rating',
      'review_count',
      'response_rate',
      'avg_response_time',
      'total_properties',
      'total_guests',
      'preferences',
      'notification_settings',
      'privacy_settings'
    ];

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    filteredUpdates.updated_at = new Date().toISOString();

    const data = await executeMutation(UPDATE_USER_MUTATION, { 
      id, 
      updates: filteredUpdates 
    });

    // Type assertion for the response data
    const typedData = data as {
      update_user_by_pk: {
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

    if (!typedData.update_user_by_pk) {
      throw new Error('Failed to update user');
    }

    return NextResponse.json({
      success: true,
      data: typedData.update_user_by_pk,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
