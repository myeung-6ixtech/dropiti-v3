import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';
import { validateOfferAction, calculateNewOfferStatus, createOfferAction } from '@/lib/offer-negotiation';

const WITHDRAW_OFFER_MUTATION = `
  mutation WithdrawOffer($offerId: Int!, $updates: real_estate_offer_set_input!) {
    update_real_estate_offer(
      where: { id: { _eq: $offerId } }
      _set: $updates
    ) {
      affected_rows
      returning {
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
        current_rent_price
        current_rent_price_currency
        current_num_leasing_months
        current_payment_frequency
        current_move_in_date
        negotiation_round
        last_action_by
        last_action_at
        last_action_type
        created_at
        updated_at
      }
    }
  }
`;

const CREATE_OFFER_ACTION_MUTATION = `
  mutation CreateOfferAction($action: real_estate_offer_action_insert_input!) {
    insert_real_estate_offer_action_one(object: $action) {
      id
      action
      offer_id
      offer_key
      property_uuid
      created_at
      action_data
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const { offerId, currentUserId, reason } = await request.json();
    console.log('Withdraw Offer API: Received request:', { offerId, currentUserId, reason });

    if (!offerId || !currentUserId) {
      return NextResponse.json(
        { error: 'offerId and currentUserId are required' },
        { status: 400 }
      );
    }

    // First, fetch the current offer to validate the action
    const getOfferQuery = `
      query GetOffer($offerId: Int!) {
        real_estate_offer_by_pk(id: $offerId) {
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
          current_rent_price
          current_rent_price_currency
          current_num_leasing_months
          current_payment_frequency
          current_move_in_date
          negotiation_round
          last_action_by
          last_action_at
          last_action_type
          created_at
          updated_at
        }
      }
    `;

    const offerData = await executeMutation(getOfferQuery, { offerId }) as {
      real_estate_offer_by_pk: {
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
        current_rent_price?: number;
        current_rent_price_currency?: string;
        current_num_leasing_months?: number;
        current_payment_frequency?: string;
        current_move_in_date?: string;
        negotiation_round: number;
        last_action_by: string;
        last_action_at: string;
        last_action_type: string;
        created_at: string;
        updated_at: string;
      };
    };

    if (!offerData.real_estate_offer_by_pk) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    const offer = offerData.real_estate_offer_by_pk;

    // Transform the offer data to match our frontend interface
    const transformedOffer = {
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
      offerStatus: offer.offer_status as 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn' | 'expired' | 'completed',
      isActive: offer.is_active,
      currentRentPrice: offer.current_rent_price,
      currentRentPriceCurrency: offer.current_rent_price_currency,
      currentNumLeasingMonths: offer.current_num_leasing_months,
      currentPaymentFrequency: offer.current_payment_frequency,
      currentMoveInDate: offer.current_move_in_date,
      negotiationRound: offer.negotiation_round,
      lastActionBy: offer.last_action_by as 'initiator' | 'recipient',
      lastActionAt: offer.last_action_at,
      lastActionType: offer.last_action_type as 'INITIATOR_CREATED' | 'INITIATOR_EDITED' | 'INITIATOR_CANCELLED' | 'INITIATOR_ACCEPTED' | 'INITIATOR_COUNTERED' | 'INITIATOR_REJECTED' | 'RECIPIENT_CREATED' | 'RECIPIENT_EDITED' | 'RECIPIENT_CANCELLED' | 'RECIPIENT_ACCEPTED' | 'RECIPIENT_COUNTERED' | 'RECIPIENT_REJECTED',
      createdAt: offer.created_at,
      updatedAt: offer.updated_at
    };

    // Only initiator can withdraw
    const actionType = 'INITIATOR_CANCELLED';

    // Validate the action
    const validation = validateOfferAction(transformedOffer, actionType, currentUserId);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid action' },
        { status: 400 }
      );
    }

    // Calculate new offer status
    const newStatus = calculateNewOfferStatus(transformedOffer.offerStatus, actionType);

    // Prepare the updates
    const updates = {
      offer_status: newStatus,
      is_active: false, // Deactivate the offer since it's withdrawn
      updated_at: new Date().toISOString()
    };

    // Update the offer
    const updateResult = await executeMutation(WITHDRAW_OFFER_MUTATION, { 
      offerId, 
      updates 
    }) as {
      update_real_estate_offer: {
        affected_rows: number;
        returning: Array<{
          id: string;
          offer_key: string;
          offer_status: string;
          updated_at: string;
        }>;
      };
    };

    if (!updateResult.update_real_estate_offer || updateResult.update_real_estate_offer.affected_rows === 0) {
      return NextResponse.json(
        { error: 'Failed to update offer' },
        { status: 500 }
      );
    }

    // Create the action record
    const actionData = {
      message: 'Offer withdrawn by tenant',
      reason: reason || 'No reason provided',
      withdrawnAt: new Date().toISOString()
    };

    const offerAction = createOfferAction(transformedOffer, actionType, actionData);

    try {
      await executeMutation(CREATE_OFFER_ACTION_MUTATION, { action: offerAction });
      console.log('Withdraw Offer API: Action record created successfully');
    } catch (actionError) {
      console.warn('Withdraw Offer API: Failed to create action record:', actionError);
      // Don't fail the whole request if action record creation fails
    }

    const updatedOffer = updateResult.update_real_estate_offer.returning[0];

    return NextResponse.json({
      success: true,
      data: {
        offerId: updatedOffer.id,
        offerKey: updatedOffer.offer_key,
        newStatus: updatedOffer.offer_status,
        updatedAt: updatedOffer.updated_at,
        action: actionType,
        reason: reason || 'No reason provided'
      },
      message: 'Offer withdrawn successfully',
    });

  } catch (error) {
    console.error('Withdraw Offer API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw offer' },
      { status: 500 }
    );
  }
}
