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
      user_firebase_uid
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
  query GetTenantProfileWithUser($firebaseUid: String!) {
    real_estate_user(where: { firebase_uid: { _eq: $firebaseUid } }) {
      firebase_uid
      display_name
      name
      photo_url
      avatar
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
    console.log('[TenantMarketplace API] Fetching tenant profiles', { limit, offset, status });

    // For now, let's use a simple query without complex filtering
    // We can add filtering later once the basic functionality works
    const data = await executeQuery(GET_TENANT_PROFILES_QUERY, { 
      limit, 
      offset, 
      status 
    }) as {
      real_estate_tenant_profile?: Array<Record<string, unknown>>;
    };

    const profiles = data?.real_estate_tenant_profile || [];
    console.log('[TenantMarketplace API] Profiles fetched:', profiles.length);

    // Fetch user data for each profile
    const profilesWithUsers = await Promise.all(
      profiles.map(async (profile: Record<string, unknown>) => {
        try {
          // Log the uid we will lookup by
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const uidForLookup = (profile as any)?.user_firebase_uid;
          console.log('[TenantMarketplace API] Looking up user for profile', { uidForLookup });
          const userData = await executeQuery(GET_TENANT_PROFILE_WITH_USER_QUERY, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            firebaseUid: (profile as any)?.user_firebase_uid,
          }) as {
            real_estate_user?: Array<Record<string, unknown>>;
          };
          
          const user = userData?.real_estate_user?.[0];
          console.log('[TenantMarketplace API] User lookup result:', user ? { firebase_uid: (user as Record<string, unknown>)?.firebase_uid, name: (user as Record<string, unknown>)?.display_name || (user as Record<string, unknown>)?.name } : null);
          
          return {
            ...profile,
            user: user || null,
          };
        } catch (error) {
          console.error('Error fetching user data:', error);
          return {
            ...profile,
            user: null,
          };
        }
      })
    );

    // Preview first item to validate shape
    if (profilesWithUsers.length > 0) {
      const first = profilesWithUsers[0] as Record<string, unknown>;
      console.log('[TenantMarketplace API] First profile snapshot:', {
        tenant_uuid: first?.tenant_uuid,
        user_firebase_uid: first?.user_firebase_uid,
        user: (first?.user as Record<string, unknown>) ? {
          firebase_uid: (first?.user as Record<string, unknown>)?.firebase_uid,
          display_name: (first?.user as Record<string, unknown>)?.display_name,
          name: (first?.user as Record<string, unknown>)?.name,
          avatar: (first?.user as Record<string, unknown>)?.avatar,
          photo_url: (first?.user as Record<string, unknown>)?.photo_url,
        } : null,
      });
    }

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
    
    // If the table doesn't exist yet, return empty results instead of error
    if (error instanceof Error && error.message.includes('relation "real_estate.tenant_profile" does not exist')) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          limit,
          offset,
          total: 0,
        },
        message: 'Tenant profile table not yet created. Please run the database migration.',
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
