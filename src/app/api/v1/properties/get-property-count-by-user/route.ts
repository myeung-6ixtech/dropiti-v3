import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_PROPERTY_COUNT_BY_USER_QUERY = `
  query GetPropertyCountByUser($landlordFirebaseUid: String!) {
    real_estate_property_listing_aggregate(
      where: { 
        landlord_firebase_uid: { _eq: $landlordFirebaseUid }
        status: { _eq: "published" }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

interface GraphQLPropertyCountResponse {
  real_estate_property_listing_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landlordFirebaseUid = searchParams.get('landlordFirebaseUid');

    console.log('Get Property Count by User API: Received request with params:', { 
      landlordFirebaseUid 
    });

    if (!landlordFirebaseUid) {
      console.log('Get Property Count by User API: Missing landlordFirebaseUid parameter');
      return NextResponse.json(
        { error: 'landlordFirebaseUid parameter is required' },
        { status: 400 }
      );
    }

    // Execute GraphQL query
    console.log('Get Property Count by User API: Executing GraphQL query for user:', landlordFirebaseUid);
    const result = await executeQuery(GET_PROPERTY_COUNT_BY_USER_QUERY, {
      landlordFirebaseUid
    }) as GraphQLPropertyCountResponse;

    console.log('Get Property Count by User API: Raw GraphQL response:', result);

    if (!result?.real_estate_property_listing_aggregate?.aggregate) {
      console.log('Get Property Count by User API: No aggregate data found');
      return NextResponse.json({
        success: true,
        data: {
          count: 0
        },
        message: 'No published properties found for this user',
      });
    }

    const count = result.real_estate_property_listing_aggregate.aggregate.count;

    console.log('Get Property Count by User API: Successfully retrieved count:', count);

    return NextResponse.json({
      success: true,
      data: {
        count
      },
      message: `Found ${count} published properties for user`,
    });

  } catch (error) {
    console.error('Get Property Count by User API: Error occurred:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        message: 'Failed to retrieve property count'
      },
      { status: 500 }
    );
  }
}
