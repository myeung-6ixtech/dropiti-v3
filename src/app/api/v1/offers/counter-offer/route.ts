import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';
import { 
  validateOfferAction,
  calculateNewOfferStatus,
  calculateNewNegotiationRound,
  calculateNewLastActionBy
} from '@/lib/offer-negotiation';

const COUNTER_OFFER_MUTATION = `
  mutation CounterOffer($offerId: Int!, $updates: real_estate_offer_set_input!) {
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

export async function POST(request: NextRequest) {
  try {
    const { offerId, currentUserId, counterData } = await request.json();
    console.log('Counter Offer API: Received request:', { offerId, currentUserId, counterData });

    if (!offerId || !currentUserId || !counterData) {
      console.log('Counter Offer API: Missing required fields:', { 
        hasOfferId: !!offerId, 
        hasCurrentUserId: !!currentUserId, 
        hasCounterData: !!counterData 
      });
      return NextResponse.json(
        { error: 'offerId, currentUserId, and counterData are required' },
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

    console.log('Counter Offer API: Transformed offer:', transformedOffer);
    console.log('Counter Offer API: Current user ID:', currentUserId);
    console.log('Counter Offer API: Offer initiator:', transformedOffer.initiatorFirebaseUid);
    console.log('Counter Offer API: Offer recipient:', transformedOffer.recipientFirebaseUid);

    // Validate counter offer data
    const validation = validateOfferAction(transformedOffer, 'INITIATOR_COUNTERED', currentUserId);
    console.log('Counter Offer API: Validation result:', validation);
    if (!validation.isValid) {
      console.log('Counter Offer API: Validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error || 'Invalid counter offer data' },
        { status: 400 }
      );
    }

    // Determine the action type based on who is countering
    const isInitiator = offer.initiator_firebase_uid === currentUserId;
    const actionType = isInitiator ? 'INITIATOR_COUNTERED' : 'RECIPIENT_COUNTERED';

    // For final counter offers, we need to update the current fields with the new counter offer data
    if (isInitiator && transformedOffer.negotiationRound >= 1) {
      // This is a final counter offer - update current fields with the new counter offer
      const updates = {
        current_rent_price: counterData.rentPrice,
        current_rent_price_currency: offer.proposing_rent_price_currency,
        current_num_leasing_months: counterData.numLeasingMonths,
        current_payment_frequency: counterData.paymentFrequency,
        current_move_in_date: counterData.moveInDate,
        offer_status: 'countered',
        negotiation_round: transformedOffer.negotiationRound + 1,
        last_action_by: 'initiator',
        last_action_at: new Date().toISOString(),
        last_action_type: 'INITIATOR_COUNTERED',
        updated_at: new Date().toISOString()
      };

      console.log('Counter Offer API: Final counter offer updates:', updates);

      // Update the offer
      const updateResult = await executeMutation(COUNTER_OFFER_MUTATION, { 
        offerId, 
        updates 
      }) as {
        update_real_estate_offer: {
          affected_rows: number;
          returning: Array<{
            id: string;
            offer_key: string;
            offer_status: string;
            negotiation_round: number;
            last_action_by: string;
            last_action_at: string;
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

      const updatedOffer = updateResult.update_real_estate_offer.returning[0];

      return NextResponse.json({
        success: true,
        data: {
          offerId: updatedOffer.id,
          offerKey: updatedOffer.offer_key,
          newStatus: updatedOffer.offer_status,
          negotiationRound: updatedOffer.negotiation_round,
          lastActionBy: updatedOffer.last_action_by,
          lastActionAt: updatedOffer.last_action_at,
          updatedAt: updatedOffer.updated_at,
          action: 'INITIATOR_COUNTERED',
          counterData: {
            rentPrice: counterData.rentPrice,
            numLeasingMonths: counterData.numLeasingMonths,
            paymentFrequency: counterData.paymentFrequency,
            moveInDate: counterData.moveInDate,
            message: counterData.message,
            reason: counterData.reason
          }
        },
        message: 'Final counter offer submitted successfully',
      });
    }

    // Validate the action for regular counter offers
    const actionValidation = validateOfferAction(transformedOffer, actionType, currentUserId);
    if (!actionValidation.isValid) {
      return NextResponse.json(
        { error: actionValidation.error || 'Invalid action' },
        { status: 400 }
      );
    }

    // Calculate new values for regular counter offers
    const newStatus = calculateNewOfferStatus(transformedOffer.offerStatus, actionType);
    const newNegotiationRound = calculateNewNegotiationRound(transformedOffer.negotiationRound, actionType);
    const newLastActionBy = calculateNewLastActionBy(actionType);

    // Prepare the updates for regular counter offers
    const updates = {
      current_rent_price: counterData.rentPrice,
      current_rent_price_currency: offer.current_rent_price_currency || offer.proposing_rent_price_currency,
      current_num_leasing_months: counterData.numLeasingMonths,
      current_payment_frequency: counterData.paymentFrequency,
      current_move_in_date: counterData.moveInDate,
      offer_status: newStatus,
      negotiation_round: newNegotiationRound,
      last_action_by: newLastActionBy,
      last_action_at: new Date().toISOString(),
      last_action_type: actionType,
      updated_at: new Date().toISOString()
    };

    console.log('Counter Offer API: Regular counter offer updates:', updates);

    // Update the offer
    const updateResult = await executeMutation(COUNTER_OFFER_MUTATION, { 
      offerId, 
      updates 
    }) as {
      update_real_estate_offer: {
        affected_rows: number;
        returning: Array<{
          id: string;
          offer_key: string;
          offer_status: string;
          negotiation_round: number;
          last_action_by: string;
          last_action_at: string;
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

    // Create the action record with detailed counter data
    // TODO: Uncomment when real_estate_offer_action table is created
    /*
    const actionData = createCounterActionData(transformedOffer, counterData);
    const offerAction = createOfferAction(transformedOffer, actionType, actionData);

    try {
      await executeMutation(CREATE_OFFER_ACTION_MUTATION, { action: offerAction });
      console.log('Counter Offer API: Action record created successfully');
    } catch (actionError) {
      console.warn('Counter Offer API: Failed to create action record:', actionError);
      // Don't fail the whole request if action record creation fails
    }
    */
    
    console.log('Counter Offer API: Skipping action record creation - table not yet implemented');

    const updatedOffer = updateResult.update_real_estate_offer.returning[0];

    return NextResponse.json({
      success: true,
      data: {
        offerId: updatedOffer.id,
        offerKey: updatedOffer.offer_key,
        newStatus: updatedOffer.offer_status,
        negotiationRound: updatedOffer.negotiation_round,
        lastActionBy: updatedOffer.last_action_by,
        lastActionAt: updatedOffer.last_action_at,
        updatedAt: updatedOffer.updated_at,
        action: actionType,
        counterData: {
          rentPrice: counterData.rentPrice,
          numLeasingMonths: counterData.numLeasingMonths,
          paymentFrequency: counterData.paymentFrequency,
          moveInDate: counterData.moveInDate,
          message: counterData.message,
          reason: counterData.reason
        }
      },
      message: 'Counter offer submitted successfully',
    });

  } catch (error) {
    console.error('Counter Offer API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit counter offer' },
      { status: 500 }
    );
  }
}
