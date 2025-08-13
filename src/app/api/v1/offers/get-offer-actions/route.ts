import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_OFFER_ACTIONS_QUERY = `
  query GetOfferActions($offerId: Int!) {
    real_estate_offer_action(
      where: { offer_id: { _eq: $offerId } }
      order_by: { created_at: asc }
    ) {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');

    if (!offerId) {
      return NextResponse.json(
        { error: 'offerId is required' },
        { status: 400 }
      );
    }

    console.log('Get Offer Actions API: Fetching actions for offer:', offerId);

    const actionsData = await executeQuery(GET_OFFER_ACTIONS_QUERY, { 
      offerId: parseInt(offerId) 
    }) as {
      real_estate_offer_action: Array<{
        id: string;
        action: string;
        offer_id: string;
        offer_key: string;
        property_uuid: string;
        created_at: string;
        action_data?: Record<string, unknown>;
      }>;
    };

    if (!actionsData.real_estate_offer_action) {
      return NextResponse.json(
        { error: 'Failed to fetch offer actions' },
        { status: 500 }
      );
    }

    // Transform the data to match our frontend interface
    const transformedActions = actionsData.real_estate_offer_action.map(action => ({
      id: action.id,
      action: action.action,
      offerId: action.offer_id,
      offerKey: action.offer_key,
      propertyUuid: action.property_uuid,
      createdAt: action.created_at,
      actionData: action.action_data || {}
    }));

    return NextResponse.json({
      success: true,
      data: transformedActions,
      total: transformedActions.length,
      message: `Successfully fetched ${transformedActions.length} actions for offer ${offerId}`
    });

  } catch (error) {
    console.error('Get Offer Actions API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offer actions' },
      { status: 500 }
    );
  }
}
