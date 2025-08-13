import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

// Type definitions for GraphQL responses
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
  // Counter offer fields
  current_rent_price?: number;
  current_rent_price_currency?: string;
  current_num_leasing_months?: number;
  current_payment_frequency?: string;
  current_move_in_date?: string;
  // Negotiation fields
  negotiation_round?: number;
  last_action_by?: 'initiator' | 'recipient';
  last_action_type?: string;
  last_action_at?: string;
}

interface GraphQLUser {
  uuid: string;
  display_name: string;
  email: string;
  phone_number: string;
  photo_url: string;
}

interface GraphQLProperty {
  title: string;
  location: string;
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

const GET_OFFERS_BY_RECIPIENT_QUERY = `
  query GetOffersByRecipient($recipientFirebaseUid: String!, $propertyUuid: String) {
    real_estate_offer(
      where: {
        recipient_firebase_uid: {_eq: $recipientFirebaseUid}
        property_uuid: {_eq: $propertyUuid}
      }, 
      order_by: {created_at: desc}
    ) {
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
      # Counter offer fields
      current_rent_price
      current_rent_price_currency
      current_num_leasing_months
      current_payment_frequency
      current_move_in_date
      # Negotiation fields
      negotiation_round
      last_action_by
      last_action_type
      last_action_at
    }
  }
`;

const GET_OFFERS_BY_RECIPIENT_WITHOUT_PROPERTY_FILTER_QUERY = `
  query GetOffersByRecipient($recipientFirebaseUid: String!) {
    real_estate_offer(
      where: {
        recipient_firebase_uid: {_eq: $recipientFirebaseUid}
      }, 
      order_by: {created_at: desc}
    ) {
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
      # Counter offer fields
      current_rent_price
      current_rent_price_currency
      current_num_leasing_months
      current_payment_frequency
      current_move_in_date
      # Negotiation fields
      negotiation_round
      last_action_by
      last_action_type
      last_action_at
    }
  }
`;

const GET_USER_BY_FIREBASE_UID_QUERY = `
  query GetUserByFirebaseUid($firebaseUid: String!) {
    real_estate_user(where: { firebase_uid: { _eq: $firebaseUid } }, limit: 1) {
      uuid
      display_name
      email
      phone_number
      photo_url
    }
  }
`;

const GET_PROPERTY_BY_UUID_QUERY = `
  query GetPropertyByUuid($propertyUuid: String!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $propertyUuid } }, limit: 1) {
      title
      location
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

    // Choose the appropriate query based on whether propertyUuid is provided
    const query = propertyUuid ? GET_OFFERS_BY_RECIPIENT_QUERY : GET_OFFERS_BY_RECIPIENT_WITHOUT_PROPERTY_FILTER_QUERY;
    
    // First, fetch the offers
    const offersData = await executeQuery(query, variables) as GraphQLOffersResponse;

    console.log('Get Offers API: Offers response:', offersData);

    // Check if offers data exists and has the expected structure
    if (!offersData || !offersData.real_estate_offer) {
      console.error('Invalid offers data structure received:', offersData);
      return NextResponse.json(
        { error: 'Invalid offers data structure received from GraphQL' },
        { status: 500 }
      );
    }

    // Collect unique user IDs and property UUIDs to fetch additional data
    const uniqueUserIds = [...new Set(offersData.real_estate_offer.map(offer => offer.initiator_firebase_uid))];
    const uniquePropertyUuids = [...new Set(offersData.real_estate_offer.map(offer => offer.property_uuid))];

    console.log('Get Offers API: Unique user IDs:', uniqueUserIds);
    console.log('Get Offers API: Unique property UUIDs:', uniquePropertyUuids);

    // Fetch user details for all unique initiators
    const userDetails: Record<string, GraphQLUser> = {};
    for (const userId of uniqueUserIds) {
      try {
        const userData = await executeQuery(GET_USER_BY_FIREBASE_UID_QUERY, { firebaseUid: userId }) as GraphQLUserResponse;
        if (userData?.real_estate_user) { // Changed from real_estate_user_by_pk to real_estate_user
          userDetails[userId] = userData.real_estate_user[0]; // Access the first user if multiple exist
        }
      } catch (error) {
        console.warn(`Failed to fetch user details for ${userId}:`, error);
      }
    }

    // Fetch property details for all unique properties
    const propertyDetails: Record<string, GraphQLProperty> = {};
    for (const propUuid of uniquePropertyUuids) {
      try {
        console.log('Fetching property details for UUID:', propUuid);
        const propertyData = await executeQuery(GET_PROPERTY_BY_UUID_QUERY, { propertyUuid: propUuid }) as GraphQLPropertyResponse;
        console.log('Property data received:', propertyData);
        
        if (propertyData?.real_estate_property_listing && propertyData.real_estate_property_listing.length > 0) {
          propertyDetails[propUuid] = propertyData.real_estate_property_listing[0]; // Access the first property if multiple exist
          console.log('Property details stored for UUID:', propUuid);
        } else {
          console.warn('No property data found for UUID:', propUuid);
        }
      } catch (error) {
        console.error(`Failed to fetch property details for ${propUuid}:`, error);
      }
    }

    console.log('Get Offers API: User details fetched:', Object.keys(userDetails).length);
    console.log('Get Offers API: Property details fetched:', Object.keys(propertyDetails).length);

    // Transform the data to match frontend expectations
    const transformedOffers = offersData.real_estate_offer.map((offer: GraphQLOffer) => {
      const initiator = userDetails[offer.initiator_firebase_uid];
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
        // Include initiator (tenant) details
        initiator: initiator ? {
          uuid: initiator.uuid,
          displayName: initiator.display_name,
          email: initiator.email,
          phoneNumber: initiator.phone_number,
          photoUrl: initiator.photo_url,
        } : null,
        // Include property details
        property: property ? {
          title: property.title,
          location: property.location,
          rentalPrice: property.rental_price,
          rentalPriceCurrency: property.rental_price_currency,
          propertyType: property.property_type,
          bedrooms: property.num_bedroom,
          bathrooms: property.num_bathroom,
          imageUrl: property.display_image,
        } : null,
      };
    });

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
