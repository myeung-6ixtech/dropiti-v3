import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const UPDATE_REVIEW_MUTATION = `
  mutation UpdateReview($reviewUuid: String!, $updates: real_estate_review_set_input!) {
    update_real_estate_review(
      where: { review_uuid: { _eq: $reviewUuid } }
      _set: $updates
    ) {
      affected_rows
      returning {
        id
        review_uuid
        reviewer_user_id
        reviewee_user_id
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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewUuid = searchParams.get('reviewUuid');

    if (!reviewUuid) {
      return NextResponse.json(
        { error: 'reviewUuid parameter is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    console.log('Update Review API: Received update data:', updateData);

    // Validate rating if provided
    if (updateData.rating !== undefined) {
      const rating = parseFloat(updateData.rating);
      if (rating < 0.5 || rating > 5.0 || rating % 0.5 !== 0) {
        return NextResponse.json(
          { error: 'Rating must be between 0.5 and 5.0 in 0.5 increments' },
          { status: 400 }
        );
      }
    }

    // Validate review type if provided
    if (updateData.reviewType) {
      const validReviewTypes = ['offer_review', 'tenant_review', 'landlord_review'];
      if (!validReviewTypes.includes(updateData.reviewType)) {
        return NextResponse.json(
          { error: 'Invalid review type. Must be one of: offer_review, tenant_review, landlord_review' },
          { status: 400 }
        );
      }
    }

    // Prepare the updates object for Hasura
    const updates: Record<string, unknown> = {};

    // Map frontend field names to database field names
    if (updateData.rating !== undefined) updates.rating = parseFloat(updateData.rating);
    if (updateData.title !== undefined) updates.title = updateData.title;
    if (updateData.comment !== undefined) updates.comment = updateData.comment;
    if (updateData.reviewType !== undefined) updates.review_type = updateData.reviewType;
    if (updateData.isPublic !== undefined) updates.is_public = updateData.isPublic;
    if (updateData.isVerified !== undefined) updates.is_verified = updateData.isVerified;
    if (updateData.helpfulCount !== undefined) updates.helpful_count = updateData.helpfulCount;

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    console.log('Update Review API: Prepared updates object:', updates);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const data = await executeMutation(UPDATE_REVIEW_MUTATION, { 
      reviewUuid, 
      updates 
    }) as {
      update_real_estate_review: {
        affected_rows: number;
        returning: Array<{
          id: string;
          review_uuid: string;
          reviewer_user_id: string;
          reviewee_user_id: string;
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

    if (!data.update_real_estate_review || data.update_real_estate_review.affected_rows === 0) {
      return NextResponse.json(
        { error: 'Review not found or no changes made' },
        { status: 404 }
      );
    }

    const updatedReview = data.update_real_estate_review.returning[0];

    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully',
    });

  } catch (error) {
    console.error('Update Review API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
