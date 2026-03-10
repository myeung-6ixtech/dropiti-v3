import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeMutation } from '@/app/api/graphql/serverClient';

// GraphQL
const GET_TENANT_PROFILE_BY_UID = `
  query GetTenantProfileByUid($nhost_user_id: uuid!) {
    real_estate_tenant_profile(where: { user_id: { _eq: $nhost_user_id } }, limit: 1) {
      id
      tenant_uuid
      user_id
      tenant_listing_title
      tenant_listing_description
      budget_min
      budget_max
      budget_currency
      payment_preferences
      deposit_capability
      preferred_property_types
      rental_space_preference
      furnishing_preference
      pets_allowed
      preferred_locations
      transportation_proximity
      neighborhood_preferences
      location_flexibility
      preferred_move_in_date
      preferred_lease_duration
      notice_period
      urgency_level
      work_location
      lifestyle_preferences
      special_requirements
      contact_preferences
      best_contact_times
      response_time_expectation
      privacy_settings
      tenant_listing_status
      created_at
      updated_at
    }
  }
`;

const INSERT_TENANT_PROFILE = `
  mutation InsertTenantProfile($object: real_estate_tenant_profile_insert_input!) {
    insert_real_estate_tenant_profile_one(object: $object) {
      id
      tenant_uuid
      user_id
      tenant_listing_status
      created_at
      updated_at
    }
  }
`;

const UPDATE_TENANT_PROFILE = `
  mutation UpdateTenantProfile($nhost_user_id: uuid!, $updates: real_estate_tenant_profile_set_input!) {
    update_real_estate_tenant_profile(
      where: { user_id: { _eq: $nhost_user_id } }
      _set: $updates
    ) {
      affected_rows
      returning {
        id
        tenant_uuid
        user_id
        tenant_listing_status
        updated_at
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nhostUserId = searchParams.get('nhost_user_id');

    if (!nhostUserId) {
      return NextResponse.json(
        { error: 'nhost_user_id parameter is required' },
        { status: 400 }
      );
    }

    const data = await executeQuery(GET_TENANT_PROFILE_BY_UID, { nhost_user_id: nhostUserId }) as {
      real_estate_tenant_profile?: Array<Record<string, unknown>>;
    };

    const profile = data?.real_estate_tenant_profile?.[0] || null;
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('GET tenant profile error:', error);
    return NextResponse.json({ error: 'Failed to get tenant profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_nhost_user_id, ...rest } = body || {};
    if (!user_nhost_user_id) {
      return NextResponse.json(
        { error: 'user_nhost_user_id is required' },
        { status: 400 }
      );
    }

    // Check existing
    const existing = await executeQuery(GET_TENANT_PROFILE_BY_UID, { nhost_user_id: user_nhost_user_id }) as {
      real_estate_tenant_profile?: Array<Record<string, unknown>>;
    };
    const hasProfile = (existing?.real_estate_tenant_profile?.length || 0) > 0;

    if (hasProfile) {
      // Update
      const updates = { ...rest, updated_at: new Date().toISOString() };
      const updateRes = await executeMutation(UPDATE_TENANT_PROFILE, {
        nhost_user_id: user_nhost_user_id,
        updates,
      }) as {
        update_real_estate_tenant_profile?: { affected_rows: number; returning: Array<Record<string, unknown>> };
      };
      const updated = updateRes?.update_real_estate_tenant_profile?.returning?.[0] || null;
      return NextResponse.json({ success: true, data: updated, message: 'Tenant profile updated' });
    }

    // Insert
    const object = {
      user_id: user_nhost_user_id,
      ...rest,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const insertRes = await executeMutation(INSERT_TENANT_PROFILE, { object }) as {
      insert_real_estate_tenant_profile_one?: Record<string, unknown>;
    };
    return NextResponse.json({ success: true, data: insertRes.insert_real_estate_tenant_profile_one, message: 'Tenant profile created' });
  } catch (error) {
    console.error('POST tenant profile error:', error);
    return NextResponse.json({ error: 'Failed to create/update tenant profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_nhost_user_id, updates } = body || {};
    if (!user_nhost_user_id || !updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'user_nhost_user_id and updates are required' },
        { status: 400 }
      );
    }

    const updateRes = await executeMutation(UPDATE_TENANT_PROFILE, {
      nhost_user_id: user_nhost_user_id,
      updates: { ...updates, updated_at: new Date().toISOString() },
    }) as {
      update_real_estate_tenant_profile?: { affected_rows: number; returning: Array<Record<string, unknown>> };
    };

    if (!updateRes?.update_real_estate_tenant_profile?.affected_rows) {
      return NextResponse.json({ error: 'Tenant profile not found' }, { status: 404 });
    }

    const updated = updateRes.update_real_estate_tenant_profile.returning[0];
    return NextResponse.json({ success: true, data: updated, message: 'Tenant profile updated' });
  } catch (error) {
    console.error('PUT tenant profile error:', error);
    return NextResponse.json({ error: 'Failed to update tenant profile' }, { status: 500 });
  }
}


