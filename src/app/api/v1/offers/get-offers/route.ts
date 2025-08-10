import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_OFFERS_QUERY = `
  query GetOffers($userId: uuid!, $type: String!, $limit: Int, $offset: Int) {
    offers(
      where: {
        _or: [
          { property: { ownerId: { _eq: $userId } } },
          { userId: { _eq: $userId } }
        ]
      }
      limit: $limit
      offset: $offset
      order_by: { createdAt: desc }
    ) {
      id
      amount
      message
      status
      createdAt
      updatedAt
      property {
        id
        title
        location
        imageUrl
        price
      }
      user {
        id
        name
        email
        avatar
      }
    }
    offers_aggregate(
      where: {
        _or: [
          { property: { ownerId: { _eq: $userId } } },
          { userId: { _eq: $userId } }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'incoming' or 'outgoing'
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!type || !['incoming', 'outgoing'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "incoming" or "outgoing"' },
        { status: 400 }
      );
    }

    const data = await executeQuery(GET_OFFERS_QUERY, { 
      userId, 
      type, 
      limit, 
      offset 
    });

    // Filter offers based on type
    let filteredOffers = data.offers;
    if (type === 'incoming') {
      filteredOffers = data.offers.filter((offer: any) => 
        offer.property.ownerId === userId
      );
    } else if (type === 'outgoing') {
      filteredOffers = data.offers.filter((offer: any) => 
        offer.userId === userId
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredOffers,
      pagination: {
        total: data.offers_aggregate.aggregate.count,
        limit,
        offset,
        hasMore: offset + limit < data.offers_aggregate.aggregate.count,
      },
    });
  } catch (error) {
    console.error('Get offers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}
