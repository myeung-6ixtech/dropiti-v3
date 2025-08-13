import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($review: real_estate_review_insert_input!) {
    insert_real_estate_review_one(object: $review) {
      id
      review_uuid
      reviewer_firebase_uid
      reviewed_user_firebase_uid
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
`;

export async function POST(request: NextRequest) {
  try {
    const reviewData = await request.json();
    console.log('Create Review API: Received review data:', reviewData);

    // Validate required fields
    const requiredFields = [
      'reviewerFirebaseUid',
      'reviewedUserFirebaseUid',
      'reviewType',
      'rating'
    ];
    
    for (const field of requiredFields) {
      if (!reviewData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate rating is between 0.5 and 5.0
    const rating = parseFloat(reviewData.rating);
    if (rating < 0.5 || rating > 5.0 || rating % 0.5 !== 0) {
      return NextResponse.json(
        { error: 'Rating must be between 0.5 and 5.0 in 0.5 increments' },
        { status: 400 }
      );
    }

    // Validate review type
    const validReviewTypes = ['offer_review', 'tenant_review', 'landlord_review'];
    if (!validReviewTypes.includes(reviewData.reviewType)) {
      return NextResponse.json(
        { error: 'Invalid review type. Must be one of: offer_review, tenant_review, landlord_review' },
        { status: 400 }
      );
    }

    // Prepare the review object for Hasura
    const review = {
      reviewer_firebase_uid: reviewData.reviewerFirebaseUid,
      reviewed_user_firebase_uid: reviewData.reviewedUserFirebaseUid,
      review_type: reviewData.reviewType,
      rating: rating,
      title: reviewData.title || null,
      comment: reviewData.comment || null,
      offer_uuid: reviewData.offerUuid || null,
      property_uuid: reviewData.propertyUuid || null,
      is_public: reviewData.isPublic !== false, // Default to true
      is_verified: false, // Default to false
      helpful_count: 0, // Default to 0
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Create Review API: Prepared review object:', review);

    const data = await executeMutation(CREATE_REVIEW_MUTATION, { review }) as {
      insert_real_estate_review_one: {
        id: string;
        review_uuid: string;
        reviewer_firebase_uid: string;
        reviewed_user_firebase_uid: string;
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
      };
    };
    
    console.log('Create Review API: GraphQL response:', data);

    // Check if the mutation was successful
    if (!data || !data.insert_real_estate_review_one) {
      throw new Error('GraphQL mutation failed - no data returned');
    }

    return NextResponse.json({
      success: true,
      data: data.insert_real_estate_review_one,
      message: 'Review created successfully',
    });

  } catch (error) {
    console.error('Create Review API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
