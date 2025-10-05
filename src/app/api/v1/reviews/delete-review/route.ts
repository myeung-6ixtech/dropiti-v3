import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const DELETE_REVIEW_MUTATION = `
  mutation DeleteReview($reviewUuid: String!) {
    delete_real_estate_review(where: { review_uuid: { _eq: $reviewUuid } }) {
      affected_rows
      returning {
        id
        review_uuid
        reviewer_firebase_uid
        reviewee_firebase_uid
        review_type
        rating
        title
        comment
        offer_uuid
        property_uuid
        is_public
        is_verified
        helpful_count
        created_at
        updated_at
      }
    }
  }
`;

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewUuid = searchParams.get('reviewUuid');

    if (!reviewUuid) {
      return NextResponse.json(
        { error: 'reviewUuid parameter is required' },
        { status: 400 }
      );
    }

    console.log('Delete Review API: Deleting review with UUID:', reviewUuid);

    const data = await executeMutation(DELETE_REVIEW_MUTATION, { reviewUuid }) as {
      delete_real_estate_review: {
        affected_rows: number;
        returning: Array<{
          id: string;
          review_uuid: string;
          reviewer_firebase_uid: string;
          reviewee_firebase_uid: string;
          review_type: string;
          rating: number;
          title?: string;
          comment?: string;
          offer_uuid?: string;
          property_uuid?: string;
          is_public: boolean;
          is_verified: boolean;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        }>;
      };
    };

    if (!data.delete_real_estate_review || data.delete_real_estate_review.affected_rows === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const deletedReview = data.delete_real_estate_review.returning[0];

    return NextResponse.json({
      success: true,
      data: deletedReview,
      message: 'Review deleted successfully',
    });

  } catch (error) {
    console.error('Delete Review API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
