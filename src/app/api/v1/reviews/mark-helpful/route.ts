import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const MARK_HELPFUL_MUTATION = `
  mutation MarkReviewHelpful($reviewUuid: String!) {
    update_real_estate_review(
      where: { review_uuid: { _eq: $reviewUuid } }
      _set: { 
        helpful_count: real_estate_review.helpful_count + 1,
        updated_at: "now()"
      }
    ) {
      affected_rows
      returning {
        id
        review_uuid
        helpful_count
        updated_at
      }
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewUuid = searchParams.get('reviewUuid');

    if (!reviewUuid) {
      return NextResponse.json(
        { error: 'reviewUuid parameter is required' },
        { status: 400 }
      );
    }

    console.log('Mark Review Helpful API: Marking review as helpful:', reviewUuid);

    const data = await executeMutation(MARK_HELPFUL_MUTATION, { reviewUuid }) as {
      update_real_estate_review: {
        affected_rows: number;
        returning: Array<{
          id: string;
          review_uuid: string;
          helpful_count: number;
          updated_at: string;
        }>;
      };
    };

    if (!data.update_real_estate_review || data.update_real_estate_review.affected_rows === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const updatedReview = data.update_real_estate_review.returning[0];

    return NextResponse.json({
      success: true,
      data: {
        reviewUuid: updatedReview.review_uuid,
        helpfulCount: updatedReview.helpful_count,
        updatedAt: updatedReview.updated_at,
      },
      message: 'Review marked as helpful successfully',
    });

  } catch (error) {
    console.error('Mark Review Helpful API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark review as helpful' },
      { status: 500 }
    );
  }
}
