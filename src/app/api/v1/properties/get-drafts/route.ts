import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_DRAFTS_QUERY = `
  query GetDrafts($landlord_user_id: uuid!) {
    real_estate_property_listing(
      where: { 
        landlord_user_id: { _eq: $landlord_user_id },
        status: { _eq: "draft" }
      },
      order_by: { last_saved_at: desc }
    ) {
      id
      property_uuid
      title
      description
      landlord_user_id
      created_at
      updated_at
      last_saved_at
      status
      property_type
      rental_space
      address
      num_bedroom
      num_bathroom
      rental_price
      amenities
      display_image
      completion_percentage
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get('landlord_id');

    if (!landlordId) {
      return NextResponse.json(
        { error: 'landlord_id is required' },
        { status: 400 }
      );
    }

    console.log('Get Drafts API: Fetching drafts for landlord:', landlordId);

    const data = await executeQuery(GET_DRAFTS_QUERY, { 
      landlord_user_id: landlordId 
    });

    console.log('Get Drafts API: GraphQL response:', data);

    // Type assertion for the response data
    const typedData = data as {
      real_estate_property_listing: Array<{
        id: string;
        property_uuid: string;
        title: string;
        description: string;
        landlord_user_id: string | null;
        created_at: string;
        updated_at: string;
        last_saved_at: string;
        status: string;
        property_type: string;
        rental_space: string;
        address: string;
        num_bedroom: number;
        num_bathroom: number;
        rental_price: number;
        amenities: string[];
        display_image: string;
        completion_percentage: number;
      }>;
    };

    return NextResponse.json({
      success: true,
      data: typedData.real_estate_property_listing,
      message: 'Drafts fetched successfully',
    });
  } catch (error) {
    console.error('Get Drafts API: Error details:', error);
    
    if (error instanceof Error) {
      console.error('Get Drafts API: Error message:', error.message);
      console.error('Get Drafts API: Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch drafts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
