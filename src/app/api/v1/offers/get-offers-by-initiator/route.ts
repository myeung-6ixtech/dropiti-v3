import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

// GraphQL response types
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
  updated_at: string;
}

interface GraphQLUser {
  uuid: string;
  firebase_uid: string;
  display_name: string;
  email: string;
  phone_number: string;
  photo_url: string;
}

interface GraphQLProperty {
  id: string;
  property_uuid: string;
  title: string;
  address: string;
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
  query GetOffersByInitiator($initiatorFirebaseUid: String!) {
    real_estate_offer(where: { initiator_firebase_uid: { _eq: $initiatorFirebaseUid } }, order_by: { created_at: desc }) {
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
      updated_at
    }
  }
`;

// GraphQL query to get user details by Firebase UID
const GET_USER_BY_FIREBASE_UID_QUERY = `
  query GetUserByFirebaseUid($firebaseUid: String!) {
    real_estate_user(where: { firebase_uid: { _eq: $firebaseUid } }, limit: 1) {
      uuid
      firebase_uid
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
    const initiatorFirebaseUid = searchParams.get('initiatorFirebaseUid');

    if (!initiatorFirebaseUid) {
      return NextResponse.json(
        { success: false, error: 'initiatorFirebaseUid is required' },
        { status: 400 }
      );
    }

    console.log('Fetching offers for initiator:', initiatorFirebaseUid);

    // First, fetch the offers
    const query = GET_OFFERS_BY_INITIATOR_QUERY;
    const variables = { initiatorFirebaseUid };

    const offersData = await executeQuery(query, variables) as GraphQLOffersResponse;
    
    if (!offersData?.real_estate_offer) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch offers' },
        { status: 500 }
      );
    }

    console.log('Offers fetched:', offersData.real_estate_offer.length);

    // Collect unique user IDs and property UUIDs to fetch additional data
    const uniqueUserIds = [...new Set(offersData.real_estate_offer.map((offer: GraphQLOffer) => offer.recipient_firebase_uid))];
    const uniquePropertyUuids = [...new Set(offersData.real_estate_offer.map((offer: GraphQLOffer) => offer.property_uuid))];

    // Fetch user details for all unique recipients (landlords)
    const userDetails: Record<string, GraphQLUser> = {};
    for (const userId of uniqueUserIds) {
      try {
        const userResponse = await executeQuery(GET_USER_BY_FIREBASE_UID_QUERY, { firebaseUid: userId }) as GraphQLUserResponse;
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
      const recipient = userDetails[offer.recipient_firebase_uid];
      const property = propertyDetails[offer.property_uuid];

      return {
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
        updatedAt: offer.updated_at,
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
          location: property.address,
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
