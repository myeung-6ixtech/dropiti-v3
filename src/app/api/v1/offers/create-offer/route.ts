import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const CREATE_OFFER_MUTATION = `
  mutation CreateOffer($offer: offers_insert_input!) {
    insert_offers_one(object: $offer) {
      id
      amount
      message
      status
      createdAt
      property {
        id
        title
        location
        price
      }
      user {
        id
        name
        email
      }
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const offerData = await request.json();

    // Validate required fields
    const requiredFields = ['propertyId', 'userId', 'amount', 'message'];
    for (const field of requiredFields) {
      if (!offerData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate amount is positive
    if (parseFloat(offerData.amount) <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Prepare the offer object for Hasura
    const offer = {
      propertyId: offerData.propertyId,
      userId: offerData.userId,
      amount: parseFloat(offerData.amount),
      message: offerData.message,
      status: 'pending', // Default status
    };

    const data = await executeMutation(CREATE_OFFER_MUTATION, { offer });

    return NextResponse.json({
      success: true,
      data: data.insert_offers_one,
      message: 'Offer created successfully',
    });
  } catch (error) {
    console.error('Create offer error:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
