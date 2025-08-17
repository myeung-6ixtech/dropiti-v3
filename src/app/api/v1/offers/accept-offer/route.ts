import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';
import { validateOfferAction, calculateNewOfferStatus, createOfferAction } from '@/lib/offer-negotiation';
import { REVIEW_CONSTANTS } from '@/constants/review';

const ACCEPT_OFFER_MUTATION = `
  mutation AcceptOffer($offerId: Int!, $updates: real_estate_offer_set_input!) {
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
        final_rent_price
        final_rent_price_currency
        final_num_leasing_months
        final_payment_frequency
        final_move_in_date
        final_accepted_at
        final_accepted_by
        review_window_start
        review_window_end
        initiator_review_status
        recipient_review_status
        created_at
        updated_at
      }
    }
  }
`;

const REJECT_PENDING_OFFERS_MUTATION = `
  mutation RejectPendingOffers($propertyUuid: String!, $excludeOfferId: Int!) {
    update_real_estate_offer(
      where: { 
        property_uuid: { _eq: $propertyUuid }
        id: { _neq: $excludeOfferId }
        offer_status: { _eq: "pending" }
        is_active: { _eq: true }
      }
      _set: {
        offer_status: "rejected"
        is_active: false
        last_action_by: "system"
        last_action_at: "now()"
        last_action_type: "SYSTEM_REJECTED"
        updated_at: "now()"
      }
    ) {
      affected_rows
      returning {
        id
        offer_key
        property_uuid
        offer_status
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

const GET_PENDING_OFFERS_QUERY = `
  query GetPendingOffers($propertyUuid: String!, $excludeOfferId: Int!) {
    real_estate_offer(
      where: { 
        property_uuid: { _eq: $propertyUuid }
        id: { _neq: $excludeOfferId }
        offer_status: { _eq: "pending" }
        is_active: { _eq: true }
      }
    ) {
      id
      offer_key
      property_uuid
      initiator_firebase_uid
      recipient_firebase_uid
      offer_status
      created_at
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const { offerId, currentUserId } = await request.json();
    console.log('Accept Offer API: Received request:', { offerId, currentUserId });

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
          final_rent_price
          final_rent_price_currency
          final_num_leasing_months
          final_payment_frequency
          final_move_in_date
          final_accepted_at
          final_accepted_by
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

    // Determine the action type based on who is accepting
    const isInitiator = offer.initiator_firebase_uid === currentUserId;
    const actionType = isInitiator ? 'INITIATOR_ACCEPTED' : 'RECIPIENT_ACCEPTED';

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

    // Determine the final accepted terms
    // If there are counter offer terms, use those; otherwise use the original proposing terms
    const finalTerms = {
      finalRentPrice: transformedOffer.currentRentPrice || transformedOffer.proposingRentPrice,
      finalRentPriceCurrency: transformedOffer.currentRentPriceCurrency || transformedOffer.proposingRentPriceCurrency || 'HKD',
      finalNumLeasingMonths: transformedOffer.currentNumLeasingMonths || transformedOffer.numLeasingMonths,
      finalPaymentFrequency: transformedOffer.currentPaymentFrequency || transformedOffer.paymentFrequency,
      finalMoveInDate: transformedOffer.currentMoveInDate || transformedOffer.moveInDate,
      finalAcceptedAt: new Date().toISOString(),
      finalAcceptedBy: isInitiator ? 'initiator' : 'recipient'
    };

    // Calculate review window timestamps
    const reviewWindowStart = new Date();
    
    // Calculate review window end date (14 days from now)
    // Use a more explicit calculation to avoid any potential issues
    const reviewWindowEnd = new Date();
    reviewWindowEnd.setDate(reviewWindowEnd.getDate() + REVIEW_CONSTANTS.REVIEW_WINDOW_DAYS);
    
    // Add some debugging to verify the calculation
    console.log('Accept Offer API: Review window calculation:', {
      start: reviewWindowStart.toISOString(),
      end: reviewWindowEnd.toISOString(),
      daysToAdd: REVIEW_CONSTANTS.REVIEW_WINDOW_DAYS,
      startDate: reviewWindowStart.toDateString(),
      endDate: reviewWindowEnd.toDateString(),
      differenceInDays: Math.round((reviewWindowEnd.getTime() - reviewWindowStart.getTime()) / (1000 * 60 * 60 * 24))
    });

    // Prepare the updates
    const updates = {
      offer_status: newStatus,
      is_active: false, // Deactivate the offer since it's accepted
      last_action_by: isInitiator ? 'initiator' : 'recipient',
      last_action_at: new Date().toISOString(),
      last_action_type: actionType,
      updated_at: new Date().toISOString(),
      // Save the final accepted terms
      final_rent_price: finalTerms.finalRentPrice,
      final_rent_price_currency: finalTerms.finalRentPriceCurrency,
      final_num_leasing_months: finalTerms.finalNumLeasingMonths,
      final_payment_frequency: finalTerms.finalPaymentFrequency,
      final_move_in_date: finalTerms.finalMoveInDate,
      final_accepted_at: finalTerms.finalAcceptedAt,
      final_accepted_by: finalTerms.finalAcceptedBy,
      // Set review window timestamps and status
      review_window_start: reviewWindowStart.toISOString(),
      review_window_end: reviewWindowEnd.toISOString(),
      initiator_review_status: 'pending',
      recipient_review_status: 'pending'
    };

    // Update the offer
    const updateResult = await executeMutation(ACCEPT_OFFER_MUTATION, { 
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

    // Create the action record for the accepted offer
    const actionData = {
      message: `Offer accepted by ${isInitiator ? 'tenant' : 'landlord'}`,
      acceptedAt: new Date().toISOString()
    };

    const offerAction = createOfferAction(transformedOffer, actionType, actionData);

    try {
      await executeMutation(CREATE_OFFER_ACTION_MUTATION, { action: offerAction });
      console.log('Accept Offer API: Action record created successfully');
    } catch (actionError) {
      console.warn('Accept Offer API: Failed to create action record:', actionError);
      // Don't fail the whole request if action record creation fails
    }

    // Step 2: Reject all other pending offers for the same property
    let rejectedOffersCount = 0;
    let rejectedOffers: Array<{ id: string; offerKey: string }> = [];

    try {
      // First, get all pending offers for the same property
      const pendingOffersData = await executeMutation(GET_PENDING_OFFERS_QUERY, {
        propertyUuid: offer.property_uuid,
        excludeOfferId: offerId
      }) as {
        real_estate_offer: Array<{
          id: string;
          offer_key: string;
          property_uuid: string;
          initiator_firebase_uid: string;
          recipient_firebase_uid: string;
          offer_status: string;
          created_at: string;
        }>;
      };

      if (pendingOffersData.real_estate_offer && pendingOffersData.real_estate_offer.length > 0) {
        // Reject all pending offers
        const rejectResult = await executeMutation(REJECT_PENDING_OFFERS_MUTATION, {
          propertyUuid: offer.property_uuid,
          excludeOfferId: offerId
        }) as {
          update_real_estate_offer: {
            affected_rows: number;
            returning: Array<{
              id: string;
              offer_key: string;
              property_uuid: string;
              offer_status: string;
              updated_at: string;
            }>;
          };
        };

        if (rejectResult.update_real_estate_offer) {
          rejectedOffersCount = rejectResult.update_real_estate_offer.affected_rows;
          rejectedOffers = rejectResult.update_real_estate_offer.returning.map(offer => ({
            id: offer.id,
            offerKey: offer.offer_key
          }));

          console.log(`Accept Offer API: Rejected ${rejectedOffersCount} pending offers`);

          // Create action records for all rejected offers
          for (const rejectedOffer of rejectedOffers) {
            const rejectedOfferAction = {
              action: 'SYSTEM_REJECTED',
              offerId: rejectedOffer.id,
              offerKey: rejectedOffer.offerKey,
              propertyUuid: offer.property_uuid,
              createdAt: new Date().toISOString(),
              actionData: {
                message: 'Offer automatically rejected - property deal accepted',
                rejectedAt: new Date().toISOString(),
                reason: 'Another offer was accepted for this property'
              }
            };

            try {
              await executeMutation(CREATE_OFFER_ACTION_MUTATION, { action: rejectedOfferAction });
            } catch (rejectActionError) {
              console.warn(`Accept Offer API: Failed to create reject action record for offer ${rejectedOffer.id}:`, rejectActionError);
            }
          }
        }
      }
    } catch (rejectError) {
      console.error('Accept Offer API: Error rejecting pending offers:', rejectError);
      // Don't fail the whole request if bulk rejection fails
      // The main offer acceptance was successful
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
        bulkRejection: {
          rejectedOffersCount,
          rejectedOffers
        }
      },
      message: 'Offer accepted successfully',
    });

  } catch (error) {
    console.error('Accept Offer API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to accept offer' },
      { status: 500 }
    );
  }
}
