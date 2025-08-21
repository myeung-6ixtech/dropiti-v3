import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_REVIEW_OPPORTUNITIES_QUERY = `
  query GetReviewOpportunities($userId: String!, $minEnd: timestamp!) {
    real_estate_offer(
      where: {
        _and: [
          {
            _or: [
              { initiator_firebase_uid: { _eq: $userId } },
              { recipient_firebase_uid: { _eq: $userId } }
            ]
          },
          { offer_status: { _eq: "accepted" } },
          { review_window_end: { _gte: $minEnd } }
        ]
      }
      order_by: { created_at: desc }
    ) {
      id
      offer_key
      offer_uuid
      property_uuid
      initiator_firebase_uid
      recipient_firebase_uid
      created_at
      review_window_start
      review_window_end
      initiator_review_status
      recipient_review_status
    }
  }
`;

const GET_PROPERTY_BY_UUID_QUERY = `
  query GetPropertyByUuid($propertyUuid: String!) {
    real_estate_property_listing(where: { uuid: { _eq: $propertyUuid } }) {
      title
      address
    }
  }
`;

const GET_USER_BY_FIREBASE_UID_QUERY = `
  query GetUserByFirebaseUid($firebaseUid: String!) {
    real_estate_user(where: { firebase_uid: { _eq: $firebaseUid } }) {
      display_name
      photo_url
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    console.log('Get Review Opportunities API: Fetching for user:', userId);

    // Compute minimum allowed review_window_end: now - 5 days
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    const minEndIso = new Date(Date.now() - fiveDaysMs).toISOString();

    const result = await executeQuery(GET_REVIEW_OPPORTUNITIES_QUERY, { userId, minEnd: minEndIso }) as {
      real_estate_offer: Array<{
        id: string;
        offer_key: string;
        offer_uuid: string;
        property_uuid: string;
        initiator_firebase_uid: string;
        recipient_firebase_uid: string;
        created_at: string;
        review_window_start: string;
        review_window_end: string;
        initiator_review_status: string;
        recipient_review_status: string;
      }>;
    };

    if (!result.real_estate_offer) {
      return NextResponse.json({
        success: true,
        data: { opportunities: [] },
        message: 'No review opportunities found'
      });
    }

    // Transform the data to match our frontend interface
    // First, collect unique property UUIDs and user IDs to batch fetch
    const uniquePropertyUuids = [...new Set(result.real_estate_offer.map(offer => offer.property_uuid))];
    const uniqueUserIds = [...new Set([
      ...result.real_estate_offer.map(offer => offer.initiator_firebase_uid),
      ...result.real_estate_offer.map(offer => offer.recipient_firebase_uid)
    ])];

    // Batch fetch property details
    const propertyDetails: Record<string, { title: string; address: Record<string, unknown> }> = {};
    for (const propUuid of uniquePropertyUuids) {
      try {
        const propertyResponse = await executeQuery(GET_PROPERTY_BY_UUID_QUERY, { propertyUuid: propUuid }) as {
          real_estate_property_listing: Array<{
            title: string;
            address: Record<string, unknown>;
          }>;
        };
        if (propertyResponse?.real_estate_property_listing?.[0]) {
          propertyDetails[propUuid] = propertyResponse.real_estate_property_listing[0];
        }
      } catch (error) {
        console.error(`Error fetching property details for ${propUuid}:`, error);
      }
    }

    // Batch fetch user details
    const userDetails: Record<string, { display_name: string; photo_url: string }> = {};
    for (const userId of uniqueUserIds) {
      try {
        const userResponse = await executeQuery(GET_USER_BY_FIREBASE_UID_QUERY, { firebaseUid: userId }) as {
          real_estate_user: Array<{
            display_name: string;
            photo_url: string;
          }>;
        };
        if (userResponse?.real_estate_user?.[0]) {
          userDetails[userId] = userResponse.real_estate_user[0];
        }
      } catch (error) {
        console.error(`Error fetching user details for ${userId}:`, error);
      }
    }

    // Now transform the offers using the cached data
    const opportunities = result.real_estate_offer.map(offer => {
      const isInitiator = offer.initiator_firebase_uid === userId;
      const property = propertyDetails[offer.property_uuid];
      const initiator = userDetails[offer.initiator_firebase_uid];
      const recipient = userDetails[offer.recipient_firebase_uid];

      // Determine the other party (the one the current user needs to review)
      const otherParty = isInitiator ? recipient : initiator;
      
      // Add debugging for review window dates
      console.log('Get Review Opportunities API: Offer review window data:', {
        offerId: offer.id,
        reviewWindowStart: offer.review_window_start,
        reviewWindowEnd: offer.review_window_end,
        reviewWindowStartDate: offer.review_window_start ? new Date(offer.review_window_start).toDateString() : 'N/A',
        reviewWindowEndDate: offer.review_window_end ? new Date(offer.review_window_end).toDateString() : 'N/A',
        daysFromStart: offer.review_window_start ? Math.round((new Date().getTime() - new Date(offer.review_window_start).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A',
        daysUntilEnd: offer.review_window_end ? Math.round((new Date(offer.review_window_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
      });
      
      const statusForUser = isInitiator ? offer.initiator_review_status : offer.recipient_review_status;

      return {
        id: offer.id,
        offerId: offer.id,
        offerUuid: offer.offer_uuid,
        propertyUuid: offer.property_uuid,
        propertyTitle: property?.title || 'Property',
        otherPartyName: otherParty?.display_name || 'Unknown User',
        otherPartyId: isInitiator ? offer.recipient_firebase_uid : offer.initiator_firebase_uid,
        reviewType: isInitiator ? 'tenant_to_landlord' : 'landlord_to_tenant',
        reviewWindowEnd: offer.review_window_end, // Use the actual review window end date
        status: statusForUser || 'pending'
      };
    });

    console.log(`Get Review Opportunities API: Found ${opportunities.length} opportunities`);

    return NextResponse.json({
      success: true,
      data: { opportunities },
      message: 'Review opportunities fetched successfully'
    });

  } catch (error) {
    console.error('Get Review Opportunities API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review opportunities' },
      { status: 500 }
    );
  }
}
