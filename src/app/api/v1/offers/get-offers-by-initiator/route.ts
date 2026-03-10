import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

// GraphQL response types
interface GraphQLOffer {
  id: string;
  offer_key: string;
  property_uuid: string;
  initiator_user_id: string;
  recipient_user_id: string;
  proposing_rent_price?: number;
  proposing_rent_price_currency?: string;
  num_leasing_months?: number;
  payment_frequency?: string;
  move_in_date?: string;
  current_rent_price?: number;
  current_rent_price_currency?: string;
  current_num_leasing_months?: number;
  current_payment_frequency?: string;
  current_move_in_date?: string;
  negotiation_round?: number;
  last_action_by?: string;
  last_action_at?: string;
  last_action_type?: string;
  offer_status: string;
  created_at: string;
  updated_at?: string;
  // Final accepted terms fields
  final_rent_price?: number;
  final_rent_price_currency?: string;
  final_num_leasing_months?: number;
  final_payment_frequency?: string;
  final_move_in_date?: string;
  final_accepted_at?: string;
  final_accepted_by?: string;
}

interface GraphQLUser {
  uuid: string;
  nhost_user_id: string;
  display_name: string;
  email: string;
  phone_number: string;
  photo_url: string;
}

interface GraphQLProperty {
  id: string;
  property_uuid: string;
  title: string;
  address: {
    unit?: string;
    floor?: string;
    block?: string;
    buildingName?: string;
    addressLine1?: string;
    addressLine2?: string;
    district?: string;
    state?: string;
    country?: string;
    city?: string;
    street?: string;
    apartmentEstate?: string;
  } | string;
  rental_price: number;
  rental_price_currency: string;
  property_type: string;
  num_bedroom: number;
  num_bathroom: number;
  display_image: string;
  uploaded_images: string[];
}

interface GraphQLOffersResponse {
  real_estate_offer: GraphQLOffer[];
}

interface GraphQLUserResponse {
  real_estate_user: GraphQLUser[];
}

interface GraphQLPropertyResponse {
  real_estate_property_listing: GraphQLProperty[];
}

// GraphQL query to get offers by initiator (user who created the offers)
const GET_OFFERS_BY_INITIATOR_QUERY = `
  query GetOffersByInitiator($initiatorUserId: String!) {
    real_estate_offer(where: { initiator_user_id: { _eq: $initiatorUserId } }, order_by: { created_at: desc }) {
      id
      offer_key
      offer_uuid
      property_uuid
      initiator_user_id
      recipient_user_id
      proposing_rent_price
      proposing_rent_price_currency
      num_leasing_months
      payment_frequency
      move_in_date
      current_rent_price
      current_rent_price_currency
      current_num_leasing_months
      current_payment_frequency
      current_move_in_date
      negotiation_round
      last_action_by
      last_action_at
      last_action_type
      offer_status
      created_at
      updated_at
      # Final accepted terms fields
      final_rent_price
      final_rent_price_currency
      final_num_leasing_months
      final_payment_frequency
      final_move_in_date
      final_accepted_at
      final_accepted_by
    }
  }
`;

const GET_USER_BY_NHOST_ID_QUERY = `
  query GetUserByNhostUserId($nhostUserId: uuid!) {
    real_estate_user(where: { nhost_user_id: { _eq: $nhostUserId } }, limit: 1) {
      uuid
      nhost_user_id
      display_name
      email
      phone_number
      photo_url
    }
  }
`;

// GraphQL query to get property details by UUID
const GET_PROPERTY_BY_UUID_QUERY = `
  query GetPropertyByUuid($propertyUuid: uuid!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $propertyUuid } }) {
      id
      property_uuid
      title
      address
      rental_price
      rental_price_currency
      property_type
      num_bedroom
      num_bathroom
      display_image
      uploaded_images
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const initiatorUserId = searchParams.get('initiatorUserId');

    if (!initiatorUserId) {
      return NextResponse.json(
        { success: false, error: 'initiatorUserId is required' },
        { status: 400 }
      );
    }

    // First, fetch the offers
    const query = GET_OFFERS_BY_INITIATOR_QUERY;
    const variables = { initiatorUserId };

    const offersData = await executeQuery(query, variables) as GraphQLOffersResponse;
    
    if (!offersData?.real_estate_offer) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch offers' },
        { status: 500 }
      );
    }

    console.log('Offers fetched:', offersData.real_estate_offer.length);

    // Collect unique user IDs and property UUIDs to fetch additional data
    const uniqueUserIds = [...new Set(offersData.real_estate_offer.map((offer: GraphQLOffer) => offer.recipient_user_id))];
    const uniquePropertyUuids = [...new Set(offersData.real_estate_offer.map((offer: GraphQLOffer) => offer.property_uuid))];

    // Fetch user details for all unique recipients (landlords)
    const userDetails: Record<string, GraphQLUser> = {};
    for (const userId of uniqueUserIds) {
      try {
        const userResponse = await executeQuery(GET_USER_BY_NHOST_ID_QUERY, { nhostUserId: userId }) as GraphQLUserResponse;
        if (userResponse?.real_estate_user?.[0]) {
          userDetails[userId] = userResponse.real_estate_user[0];
        }
      } catch (error) {
        console.error(`Error fetching user details for ${userId}:`, error);
      }
    }

    // Fetch property details for all unique properties
    const propertyDetails: Record<string, GraphQLProperty> = {};
    for (const propUuid of uniquePropertyUuids) {
      try {
        const propertyResponse = await executeQuery(GET_PROPERTY_BY_UUID_QUERY, { propertyUuid: propUuid }) as GraphQLPropertyResponse;
        if (propertyResponse?.real_estate_property_listing?.[0]) {
          propertyDetails[propUuid] = propertyResponse.real_estate_property_listing[0];
        }
      } catch (error) {
        console.error(`Error fetching property details for ${propUuid}:`, error);
      }
    }

    // Transform and combine data
    const transformedOffers = offersData.real_estate_offer.map((offer: GraphQLOffer) => {
      const recipient = userDetails[offer.recipient_user_id];
      const property = propertyDetails[offer.property_uuid];

      return {
        id: offer.id,
        offerKey: offer.offer_key,
        propertyUuid: offer.property_uuid,
        initiatorUserId: offer.initiator_user_id,
        recipientUserId: offer.recipient_user_id,
        proposingRentPrice: offer.proposing_rent_price || 0,
        proposingRentPriceCurrency: offer.proposing_rent_price_currency || 'HKD',
        numLeasingMonths: offer.num_leasing_months || 12,
        paymentFrequency: offer.payment_frequency || 'monthly',
        moveInDate: offer.move_in_date || new Date().toISOString().split('T')[0],
        offerStatus: offer.offer_status,
        isActive: true,
        createdAt: offer.created_at,
        updatedAt: offer.updated_at || offer.created_at,
        // Counter offer fields
        currentRentPrice: offer.current_rent_price,
        currentRentPriceCurrency: offer.current_rent_price_currency,
        currentNumLeasingMonths: offer.current_num_leasing_months,
        currentPaymentFrequency: offer.current_payment_frequency,
        currentMoveInDate: offer.current_move_in_date,
        // Negotiation fields
        negotiationRound: offer.negotiation_round,
        lastActionBy: offer.last_action_by,
        lastActionType: offer.last_action_type,
        lastActionAt: offer.last_action_at,
        // Final accepted terms
        finalRentPrice: offer.final_rent_price,
        finalRentPriceCurrency: offer.final_rent_price_currency,
        finalNumLeasingMonths: offer.final_num_leasing_months,
        finalPaymentFrequency: offer.final_payment_frequency,
        finalMoveInDate: offer.final_move_in_date,
        finalAcceptedAt: offer.final_accepted_at,
        finalAcceptedBy: offer.final_accepted_by,
        // Recipient (landlord) details
        recipient: recipient ? {
          uuid: recipient.uuid,
          displayName: recipient.display_name,
          email: recipient.email,
          phoneNumber: recipient.phone_number,
          photoUrl: recipient.photo_url,
        } : null,
        // Property details
        property: property ? {
          title: property.title,
          location: typeof property.address === 'string' ? property.address : 
            (property.address && typeof property.address === 'object' ? 
              [
                property.address.buildingName,
                property.address.addressLine1,
                property.address.addressLine2,
                property.address.district,
                property.address.state,
                property.address.country
              ].filter(Boolean).join(', ') : 'Address not available'),
          rentalPrice: property.rental_price,
          rentalPriceCurrency: property.rental_price_currency,
          propertyType: property.property_type,
          bedrooms: property.num_bedroom,
          bathrooms: property.num_bathroom,
          imageUrl: property.display_image || null,
        } : null,
      };
    });

    console.log('Transformed offers:', transformedOffers.length);

    return NextResponse.json({
      success: true,
      data: transformedOffers,
      message: `Successfully fetched ${transformedOffers.length} offers`
    });

  } catch (error) {
    console.error('Error in get-offers-by-initiator:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
