import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

// Type definitions for GraphQL response
interface GraphQLOffer {
  id: string;
  offer_key: string;
  property_uuid: string;
  initiator_firebase_uid: string;
  recipient_firebase_uid: string;
  proposing_rent_price: number;
  proposing_rent_price_currency: string;
  num_leasing_months: number;
  payment_frequency: string;
  move_in_date: string;
  offer_status: string;
  is_active: boolean;
  created_at: string;
}

interface GraphQLResponse {
  real_estate_offer: GraphQLOffer[];
}

const GET_OFFERS_BY_RECIPIENT_QUERY = `
  query GetOffersByRecipient($recipientFirebaseUid: String!) {
    real_estate_offer(where: {recipient_firebase_uid: {_eq: $recipientFirebaseUid}}, order_by: {created_at: desc}) {
      id
      offer_key
      property_uuid
      initiator_firebase_uid
      recipient_firebase_uid
      proposing_rent_price
      proposing_rent_price_currency
      num_leasing_months
      payment_frequency
      move_in_date
      offer_status
      is_active
      created_at
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientFirebaseUid = searchParams.get('recipientFirebaseUid');
    const propertyUuid = searchParams.get('propertyUuid'); // Optional: filter by specific property

    if (!recipientFirebaseUid) {
      return NextResponse.json(
        { error: 'recipientFirebaseUid is required' },
        { status: 400 }
      );
    }

    console.log('Get Offers API: Fetching offers for recipient:', recipientFirebaseUid);
    console.log('Get Offers API: Property UUID filter:', propertyUuid);

    // Build the query variables
    const variables: { recipientFirebaseUid: string; propertyUuid?: string } = {
      recipientFirebaseUid
    };

    // If propertyUuid is provided, add it to the query
    if (propertyUuid) {
      variables.propertyUuid = propertyUuid;
    }

    const data = await executeQuery(GET_OFFERS_BY_RECIPIENT_QUERY, variables) as GraphQLResponse;

    console.log('Get Offers API: GraphQL response:', data);

    // Check if data exists and has the expected structure
    if (!data || !data.real_estate_offer) {
      console.error('Invalid data structure received:', data);
      return NextResponse.json(
        { error: 'Invalid data structure received from GraphQL' },
        { status: 500 }
      );
    }

    // Transform the data to match frontend expectations
    const transformedOffers = data.real_estate_offer.map((offer: GraphQLOffer) => ({
      id: offer.id,
      offerKey: offer.offer_key,
      propertyUuid: offer.property_uuid,
      initiatorFirebaseUid: offer.initiator_firebase_uid,
      recipientFirebaseUid: offer.recipient_firebase_uid,
      proposingRentPrice: offer.proposing_rent_price,
      proposingRentPriceCurrency: offer.proposing_rent_price_currency,
      numLeasingMonths: offer.num_leasing_months,
      paymentFrequency: offer.payment_frequency,
      moveInDate: offer.move_in_date,
      offerStatus: offer.offer_status,
      isActive: offer.is_active,
      createdAt: offer.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedOffers,
      total: transformedOffers.length,
      message: 'Offers fetched successfully',
    });
  } catch (error) {
    console.error('Get Offers API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}
