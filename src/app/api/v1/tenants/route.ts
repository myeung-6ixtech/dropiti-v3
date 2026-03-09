import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_TENANT_PROFILES_QUERY = `
  query GetTenantProfiles($limit: Int, $offset: Int, $status: String) {
    real_estate_tenant_profile(
      where: { tenant_listing_status: { _eq: $status } }
      limit: $limit
      offset: $offset
      order_by: { created_at: desc }
    ) {
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

const GET_TENANT_PROFILE_WITH_USER_QUERY = `
  query GetTenantProfileWithUser($nhostUserId: uuid!) {
    real_estate_user(where: { nhost_user_id: { _eq: $nhostUserId } }) {
      uuid
      nhost_user_id
      display_name
      photo_url
      email
      rating
      review_count
    }
  }
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const status = searchParams.get('status') || 'active';

    const data = await executeQuery(GET_TENANT_PROFILES_QUERY, {
      limit,
      offset,
      status,
    }) as {
      real_estate_tenant_profile?: Array<Record<string, unknown>>;
    };

    const profiles = data?.real_estate_tenant_profile || [];

    // Fetch user data for each profile using user_id (Nhost auth UUID)
    const profilesWithUsers = await Promise.all(
      profiles.map(async (profile: Record<string, unknown>) => {
        try {
          const nhostUserId = profile?.user_id as string | undefined;
          if (!nhostUserId) {
            return { ...profile, user: null };
          }

          const userData = await executeQuery(GET_TENANT_PROFILE_WITH_USER_QUERY, {
            nhostUserId,
          }) as {
            real_estate_user?: Array<Record<string, unknown>>;
          };

          return {
            ...profile,
            user: userData?.real_estate_user?.[0] || null,
          };
        } catch (error) {
          console.error('Error fetching user data for tenant profile:', error);
          return { ...profile, user: null };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: profilesWithUsers,
      pagination: {
        limit,
        offset,
        total: profilesWithUsers.length,
      },
    });
  } catch (error) {
    console.error('Error fetching tenant profiles:', error);

    if (
      error instanceof Error &&
      error.message.includes('relation "real_estate.tenant_profile" does not exist')
    ) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { limit, offset, total: 0 },
        message: 'Tenant profile table not yet created. Please run the database migration.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
