import { NextRequest, NextResponse } from 'next/server';
import { executeMutation, executeQuery } from '@/app/api/graphql/serverClient';

const CHECK_EXISTING_OFFER_QUERY = `
  query CheckExistingOffer($propertyUuid: String!, $initiatorFirebaseUid: String!) {
    real_estate_offer(
      where: {
        property_uuid: { _eq: $propertyUuid }
        initiator_firebase_uid: { _eq: $initiatorFirebaseUid }
        offer_status: { _in: ["pending", "accepted"] }
        is_active: { _eq: true }
      }
      limit: 1
    ) {
      id
      offer_status
    }
  }
`;

const CREATE_OFFER_MUTATION = `
  mutation CreateOffer($offer: real_estate_offer_insert_input!) {
    insert_real_estate_offer_one(object: $offer) {
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

export async function POST(request: NextRequest) {
  try {
    const offerData = await request.json();

    // Validate required fields
    const requiredFields = [
      'propertyId', 
      'initiatorFirebaseUid', 
      'recipientFirebaseUid', 
      'proposingRentPrice', 
      'numLeasingMonths', 
      'paymentFrequency', 
      'moveInDate'
    ];
    
    for (const field of requiredFields) {
      if (!offerData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate rent price is positive
    if (parseFloat(offerData.proposingRentPrice) <= 0) {
      return NextResponse.json(
        { error: 'Rent price must be positive' },
        { status: 400 }
      );
    }

    // Validate lease duration is positive
    if (parseInt(offerData.numLeasingMonths) <= 0) {
      return NextResponse.json(
        { error: 'Lease duration must be positive' },
        { status: 400 }
      );
    }

    // Check for existing offers from the same user for this property
    console.log('Create Offer API: Checking for existing offers for property:', offerData.propertyId, 'user:', offerData.initiatorFirebaseUid);
    
    try {
      const existingOffersData = await executeQuery(CHECK_EXISTING_OFFER_QUERY, {
        propertyUuid: offerData.propertyId,
        initiatorFirebaseUid: offerData.initiatorFirebaseUid
      }) as {
        real_estate_offer: Array<{
          id: string;
          offer_status: string;
        }>;
      };

      console.log('Create Offer API: Existing offers query result:', existingOffersData);

      if (existingOffersData.real_estate_offer && existingOffersData.real_estate_offer.length > 0) {
        const existingOffer = existingOffersData.real_estate_offer[0];
        console.log('Create Offer API: Found existing offer:', existingOffer);
        return NextResponse.json(
          { 
            error: `You already have a ${existingOffer.offer_status} offer for this property. Only one active offer per property is allowed.`,
            existingOfferStatus: existingOffer.offer_status
          },
          { status: 409 } // Conflict status code
        );
      }
      
      console.log('Create Offer API: No existing offers found, proceeding with creation');
    } catch (checkError) {
      console.error('Create Offer API: Error checking existing offers:', checkError);
      // Continue with offer creation if check fails (don't block on check errors)
    }

    // Generate unique offer key
    const offerKey = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare the offer object for Hasura
    const offer = {
      offer_key: offerKey,
      property_uuid: offerData.propertyId,
      initiator_firebase_uid: offerData.initiatorFirebaseUid,
      recipient_firebase_uid: offerData.recipientFirebaseUid,
      proposing_rent_price: parseFloat(offerData.proposingRentPrice),
      proposing_rent_price_currency: offerData.currency || 'HKD',
      num_leasing_months: parseInt(offerData.numLeasingMonths),
      payment_frequency: offerData.paymentFrequency,
      move_in_date: offerData.moveInDate,
      offer_status: 'pending', // Default status
      is_active: true, // Default to active
      created_at: new Date().toISOString(), // Add current timestamp
    };


    try {
      const data = await executeMutation(CREATE_OFFER_MUTATION, { offer }) as {
        insert_real_estate_offer_one: {
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
        };
      };

      // Check if the mutation was successful
      if (!data || !data.insert_real_estate_offer_one) {
        throw new Error('GraphQL mutation failed - no data returned');
      }

      // Create notification for the recipient (landlord)
      try {
        const { NotificationService } = await import('@/lib/notification-service');
        
        // Get property details for notification
        const GET_PROPERTY_QUERY = `
          query GetProperty($property_uuid: uuid!) {
            real_estate_property_listing(where: { property_uuid: { _eq: $property_uuid } }) {
              title
              address
            }
          }
        `;
        
        const propertyData = await executeQuery(GET_PROPERTY_QUERY, { 
          property_uuid: offerData.propertyId 
        }) as { real_estate_property_listing: Array<{ title: string; address: string }> };
        
        // Get initiator details for notification
        const GET_USER_QUERY = `
          query GetUser($firebaseUid: String!) {
            real_estate_user(where: { firebase_uid: { _eq: $firebaseUid } }) {
              display_name
              name
            }
          }
        `;
        
        const initiatorData = await executeQuery(GET_USER_QUERY, { 
          firebaseUid: offerData.initiatorFirebaseUid 
        }) as { real_estate_user: Array<{ display_name?: string; name?: string }> };

        await NotificationService.createNotification({
          typeKey: 'offer_created',
          recipientFirebaseUid: offerData.recipientFirebaseUid,
          senderFirebaseUid: offerData.initiatorFirebaseUid,
          data: {
            offer_id: data.insert_real_estate_offer_one.id,
            property_title: propertyData.real_estate_property_listing[0]?.title || 'Property',
            property_id: offerData.propertyId,
            sender_name: initiatorData.real_estate_user[0]?.display_name || initiatorData.real_estate_user[0]?.name || 'User',
            rent_price: new Intl.NumberFormat('en-HK', {
              style: 'currency',
              currency: offerData.currency || 'HKD',
              minimumFractionDigits: 0
            }).format(parseFloat(offerData.proposingRentPrice)),
          },
          priority: 'high',
        });
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't fail the offer creation if notification fails
      }

      return NextResponse.json({
        success: true,
        data: data.insert_real_estate_offer_one,
        message: 'Offer created successfully',
      });
    } catch (graphqlError) {
      console.error('Create Offer API: GraphQL mutation error:', graphqlError);
      
      // Check if it's a validation error
      if (graphqlError instanceof Error && graphqlError.message.includes('null value')) {
        return NextResponse.json(
          { error: 'Invalid data provided - some required fields are missing or null' },
          { status: 400 }
        );
      }
      
      throw graphqlError; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error('Create Offer API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
