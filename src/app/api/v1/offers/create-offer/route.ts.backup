import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

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
    console.log('Create Offer API: Received offer data:', offerData);

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

    console.log('Create Offer API: Prepared offer object:', offer);

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
      
      console.log('Create Offer API: GraphQL response:', data);

      // Check if the mutation was successful
      if (!data || !data.insert_real_estate_offer_one) {
        throw new Error('GraphQL mutation failed - no data returned');
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
