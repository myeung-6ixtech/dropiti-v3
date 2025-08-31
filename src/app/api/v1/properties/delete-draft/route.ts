import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const DELETE_DRAFT_MUTATION = `
  mutation DeleteDraft($property_uuid: uuid!) {
    delete_real_estate_property_listing(
      where: { 
        property_uuid: { _eq: $property_uuid },
        status: { _eq: "draft" }
      }
    ) {
      affected_rows
    }
  }
`;

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyUuid = searchParams.get('property_uuid');

    if (!propertyUuid) {
      return NextResponse.json(
        { error: 'property_uuid is required' },
        { status: 400 }
      );
    }

    console.log('Delete Draft API: Deleting draft:', propertyUuid);

    const data = await executeMutation(DELETE_DRAFT_MUTATION, { property_uuid: propertyUuid });

    console.log('Delete Draft API: GraphQL response:', data);

    // Type assertion for the response data
    const typedData = data as {
      delete_real_estate_property_listing: {
        affected_rows: number;
      };
    };

    if (typedData.delete_real_estate_property_listing.affected_rows === 0) {
      return NextResponse.json(
        { error: 'Draft not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
    });
  } catch (error) {
    console.error('Delete Draft API: Error details:', error);
    
    if (error instanceof Error) {
      console.error('Delete Draft API: Error message:', error.message);
      console.error('Delete Draft API: Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
