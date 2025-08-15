import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_REVIEW_OPPORTUNITIES_QUERY = `
  query GetReviewOpportunities($userId: String!) {
    real_estate_offer(
      where: {
        _or: [
          { initiator_firebase_uid: { _eq: $userId } },
          { recipient_firebase_uid: { _eq: $userId } }
        ]
        offer_status: { _eq: "accepted" }
        review_window_end: { _gte: "now()" }
        _or: [
          { initiator_review_status: { _eq: "pending" } },
          { recipient_review_status: { _eq: "pending" } }
        ]
      }
      order_by: { review_window_end: asc }
    ) {
      id
      offer_key
      property_uuid
      initiator_firebase_uid
      recipient_firebase_uid
      review_window_start
      review_window_end
      initiator_review_status
      recipient_review_status
      property {
        title
        address
      }
      initiator {
        display_name
        photo_url
      }
      recipient {
        display_name
        photo_url
      }
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

    const result = await executeQuery(GET_REVIEW_OPPORTUNITIES_QUERY, { userId }) as {
      real_estate_offer: Array<{
        id: string;
        offer_key: string;
        property_uuid: string;
        initiator_firebase_uid: string;
        recipient_firebase_uid: string;
        review_window_start: string;
        review_window_end: string;
        initiator_review_status: string;
        recipient_review_status: string;
        property: {
          title: string;
          address: Record<string, unknown>;
        };
        initiator: {
          display_name: string;
          photo_url: string;
        };
        recipient: {
          display_name: string;
          photo_url: string;
        };
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
    const opportunities = result.real_estate_offer.map(offer => {
      const isInitiator = offer.initiator_firebase_uid === userId;
      const otherParty = isInitiator ? offer.recipient : offer.initiator;
      const reviewStatus = isInitiator ? offer.initiator_review_status : offer.recipient_review_status;
      
      return {
        id: offer.id,
        offerId: offer.id,
        offerUuid: offer.offer_key,
        propertyUuid: offer.property_uuid,
        propertyTitle: offer.property?.title || 'Property',
        otherPartyName: otherParty?.display_name || 'Unknown User',
        otherPartyId: isInitiator ? offer.recipient_firebase_uid : offer.initiator_firebase_uid,
        reviewType: isInitiator ? 'tenant_to_landlord' : 'landlord_to_tenant',
        reviewWindowEnd: offer.review_window_end,
        status: reviewStatus
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
