import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: When real_estate_offer_action table is created, uncomment this section
    /*
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
    */

    // For now, return empty actions since the table doesn't exist
    const transformedActions: Array<{
      id: string;
      action: string;
      offerId: string;
      offerKey: string;
      propertyUuid: string;
      createdAt: string;
      actionData: Record<string, unknown>;
    }> = [];
    console.log('Get Offer Actions API: Returning empty actions - table not yet implemented');

    return NextResponse.json({
      success: true,
      data: transformedActions,
      total: transformedActions.length,
      message: `Offer actions table not yet implemented. Returning empty actions for offer ${offerId}`
    });

  } catch (error) {
    console.error('Get Offer Actions API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offer actions' },
      { status: 500 }
    );
  }
}
