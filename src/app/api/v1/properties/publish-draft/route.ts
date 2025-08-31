import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const PUBLISH_DRAFT_MUTATION = `
  mutation PublishDraft($property_uuid: uuid!) {
    update_real_estate_property_listing(
      where: { property_uuid: { _eq: $property_uuid } }
      _set: { 
        status: "published",
        is_public: true,
        updated_at: "now()",
        last_saved_at: "now()",
        completion_percentage: 100
      }
    ) {
      affected_rows
      returning {
        id
        property_uuid
        title
        status
        is_public
        updated_at
        last_saved_at
        completion_percentage
      }
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const { property_uuid } = await request.json();

    if (!property_uuid) {
      return NextResponse.json(
        { error: 'property_uuid is required' },
        { status: 400 }
      );
    }

    console.log('Publish Draft API: Publishing draft:', property_uuid);

    const data = await executeMutation(PUBLISH_DRAFT_MUTATION, { property_uuid });

    console.log('Publish Draft API: GraphQL response:', data);

    // Type assertion for the response data
    const typedData = data as {
      update_real_estate_property_listing: {
        affected_rows: number;
        returning: Array<{
          id: string;
          property_uuid: string;
          title: string;
          status: string;
          is_public: boolean;
          updated_at: string;
          last_saved_at: string;
          completion_percentage: number;
        }>;
      };
    };

    if (typedData.update_real_estate_property_listing.affected_rows === 0) {
      return NextResponse.json(
        { error: 'Draft not found or already published' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: typedData.update_real_estate_property_listing.returning[0],
      message: 'Draft published successfully',
    });
  } catch (error) {
    console.error('Publish Draft API: Error details:', error);
    
    if (error instanceof Error) {
      console.error('Publish Draft API: Error message:', error.message);
      console.error('Publish Draft API: Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to publish draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
