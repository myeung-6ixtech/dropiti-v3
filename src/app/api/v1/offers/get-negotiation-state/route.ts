import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';
import { calculateNegotiationState } from '@/lib/offer-negotiation';

const GET_OFFER_QUERY = `
  query GetOffer($offerId: Int!) {
    real_estate_offer_by_pk(id: $offerId) {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');
    const currentUserId = searchParams.get('currentUserId');

    if (!offerId || !currentUserId) {
      return NextResponse.json(
        { error: 'offerId and currentUserId are required' },
        { status: 400 }
      );
    }

    console.log('Get Negotiation State API: Fetching state for offer:', offerId, 'user:', currentUserId);

    const offerData = await executeQuery(GET_OFFER_QUERY, { 
      offerId: parseInt(offerId) 
    }) as {
      real_estate_offer_by_pk: {
        id: string;
        offer_key: string;
        offer_uuid: string;
        property_uuid: string;
        initiator_user_id: string;
        recipient_user_id: string;
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
        final_rent_price?: number;
        final_rent_price_currency?: string;
        final_num_leasing_months?: number;
        final_payment_frequency?: string;
        final_move_in_date?: string;
        final_accepted_at?: string;
        final_accepted_by?: string;
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
      initiatorUserId: offer.initiator_user_id,
      recipientUserId: offer.recipient_user_id,
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
      finalRentPrice: offer.final_rent_price,
      finalRentPriceCurrency: offer.final_rent_price_currency,
      finalNumLeasingMonths: offer.final_num_leasing_months,
      finalPaymentFrequency: offer.final_payment_frequency,
      finalMoveInDate: offer.final_move_in_date,
      finalAcceptedAt: offer.final_accepted_at,
      finalAcceptedBy: offer.final_accepted_by as 'initiator' | 'recipient' | undefined,
      createdAt: offer.created_at,
      updatedAt: offer.updated_at
    };

    // Calculate the negotiation state
    const negotiationState = calculateNegotiationState(transformedOffer, currentUserId);

    return NextResponse.json({
      success: true,
      data: {
        offer: transformedOffer,
        negotiationState
      },
      message: 'Negotiation state retrieved successfully'
    });

  } catch (error) {
    console.error('Get Negotiation State API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to get negotiation state' },
      { status: 500 }
    );
  }
}
