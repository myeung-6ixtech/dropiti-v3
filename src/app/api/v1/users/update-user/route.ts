import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($nhost_user_id: uuid!, $updates: real_estate_user_set_input!) {
    update_real_estate_user(
      where: { nhost_user_id: { _eq: $nhost_user_id } }
      _set: $updates
    ) {
      affected_rows
      returning {
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
  }
`;

export async function PUT(request: NextRequest) {
  try {
    const { id, updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'User ID (nhost_user_id) is required' },
        { status: 400 },
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Update data is required' }, { status: 400 });
    }

    const allowedFields = [
      'display_name', 'first_name', 'last_name', 'photo_url', 'phone_number',
      'location', 'about', 'education', 'occupation', 'marital_status', 'languages',
      'verified', 'rating', 'review_count', 'response_rate', 'onboarding_complete',
      'preferences', 'notification_settings', 'privacy_settings',
    ];

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if ((key === 'languages') && Array.isArray(value)) {
          filteredUpdates[key] = JSON.stringify(value);
        } else if (['preferences', 'notification_settings', 'privacy_settings'].includes(key) && typeof value === 'object') {
          filteredUpdates[key] = JSON.stringify(value);
        } else {
          filteredUpdates[key] = value;
        }
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    filteredUpdates.updated_at = new Date().toISOString();

    const data = await executeMutation(UPDATE_USER_MUTATION, {
      nhost_user_id: id,
      updates: filteredUpdates,
    });

    const typedData = data as {
      update_real_estate_user: {
        affected_rows: number;
        returning: Array<Record<string, unknown>>;
      };
    };

    if (!typedData.update_real_estate_user || typedData.update_real_estate_user.affected_rows === 0) {
      return NextResponse.json({ error: 'User not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: typedData.update_real_estate_user.returning[0],
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
