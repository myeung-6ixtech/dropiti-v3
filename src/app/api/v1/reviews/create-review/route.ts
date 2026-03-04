import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { executeMutation } from '@/app/api/graphql/serverClient';

const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($review: real_estate_review_insert_input!) {
    insert_real_estate_review_one(object: $review) {
      id
      review_uuid
      offer_uuid
      review_type
      rating
      comment
      reviewer_user_id
      reviewee_user_id
      property_uuid
      is_public
      is_verified
      helpful_count
      created_at
      updated_at
    }
  }
`;

const UPDATE_OFFER_REVIEW_STATUS_MUTATION = `
  mutation UpdateOfferReviewStatus($offerId: Int!, $isInitiator: Boolean!, $status: String!) {
    update_real_estate_offer_by_pk(
      pk_columns: { id: $offerId }
      _set: {
        initiator_review_status: $isInitiator ? $status : "pending",
        recipient_review_status: $isInitiator ? "pending" : $status
      }
    ) {
      id
      initiator_review_status
      recipient_review_status
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    console.log('Create Review API: Environment check:', {
      hasuraEndpoint: process.env.HASURA_ENDPOINT ? 'Set' : 'Missing',
      hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET ? 'Set' : 'Missing'
    });

    const {
      offerId,
      offerUuid, // DB offer_uuid (UUID)
      reviewType,
      rating,
      comment,
      reviewerId,
      reviewedUserId
    } = await request.json();

    // Validate required fields
    if (!offerId || !offerUuid || !reviewType || !rating || !comment || !reviewerId || !reviewedUserId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Note: propertyUuid is optional now since we'll look it up from the offer

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    console.log('Create Review API: Creating review for offer:', offerUuid);

    // First, look up the offer to get the actual property_uuid
    console.log('Create Review API: Looking up offer details...');
    
    const getOfferDetailsQuery = `
      query GetOfferDetails($offerId: Int!) {
        real_estate_offer_by_pk(id: $offerId) {
          id
          offer_key
          offer_uuid
          property_uuid
          initiator_user_id
          recipient_user_id
        }
      }
    `;

    const offerDetails = await executeMutation(getOfferDetailsQuery, { offerId }) as {
      real_estate_offer_by_pk: {
        id: string;
        offer_key: string;
        offer_uuid: string;
        property_uuid: string;
        initiator_user_id: string;
        recipient_user_id: string;
      };
    };

    if (!offerDetails.real_estate_offer_by_pk) {
      console.error('Create Review API: Offer not found for ID:', offerId);
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Verify the offer_uuid matches what was sent
    if (offerDetails.real_estate_offer_by_pk.offer_uuid !== offerUuid) {
      console.error('Create Review API: Offer UUID mismatch:', {
        sent: offerUuid,
        found: offerDetails.real_estate_offer_by_pk.offer_uuid
      });
      return NextResponse.json(
        { error: 'Offer UUID mismatch' },
        { status: 400 }
      );
    }

    const actualPropertyUuid = offerDetails.real_estate_offer_by_pk.property_uuid;

    // Prevent duplicate reviews: if current user's corresponding review status is already completed, block
    // Fetch the current review statuses for this offer
    const reviewerIsInitiator = offerDetails.real_estate_offer_by_pk.initiator_user_id === reviewerId;
    const GET_REVIEW_STATUS_QUERY = `
      query GetReviewStatus($offerId: Int!) {
        real_estate_offer_by_pk(id: $offerId) {
          initiator_review_status
          recipient_review_status
        }
      }
    `;
    const reviewStatusData = await executeMutation(GET_REVIEW_STATUS_QUERY, { offerId }) as {
      real_estate_offer_by_pk: {
        initiator_review_status: string;
        recipient_review_status: string;
      } | null;
    };
    const userReviewStatus = reviewerIsInitiator
      ? reviewStatusData?.real_estate_offer_by_pk?.initiator_review_status
      : reviewStatusData?.real_estate_offer_by_pk?.recipient_review_status;
    if (userReviewStatus && userReviewStatus.toLowerCase() === 'completed') {
      return NextResponse.json(
        { error: 'You have already submitted a review for this offer.' },
        { status: 409 }
      );
    }
    console.log('Create Review API: Found property UUID:', actualPropertyUuid);

    // Create the review
    const reviewData = {
      review_uuid: randomUUID(),
      offer_uuid: offerUuid, // DB offer_uuid (UUID)
      review_type: reviewType,
      rating: rating,
      comment: comment,
      reviewer_user_id: reviewerId,
      reviewee_user_id: reviewedUserId,
      property_uuid: actualPropertyUuid, // Use the actual UUID from the offer
      is_public: true, // Default to public
      is_verified: false, // Default to not verified
      helpful_count: 0, // Default to 0 helpful votes
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Create Review API: Review data:', reviewData);

    console.log('Create Review API: Executing GraphQL mutation...');
    
    const createResult = await executeMutation(CREATE_REVIEW_MUTATION, { review: reviewData }) as {
      insert_real_estate_review_one: {
        id: string;
        review_uuid: string;
        offer_uuid: string;
        review_type: string;
        rating: number;
        comment: string;
        reviewer_user_id: string;
        reviewee_user_id: string;
        property_uuid: string;
        is_public: boolean;
        is_verified: boolean;
        helpful_count: number;
        created_at: string;
        updated_at: string;
      };
    };

    console.log('Create Review API: GraphQL result:', createResult);

    if (!createResult.insert_real_estate_review_one) {
      console.error('Create Review API: GraphQL mutation failed - no result returned');
      throw new Error('Failed to create review - GraphQL mutation returned no result');
    }

    // Update the offer's review status
    // Determine if the reviewer is the initiator or recipient
    console.log('Create Review API: Updating offer review status...');
    
    const isInitiator = offerDetails.real_estate_offer_by_pk.initiator_user_id === reviewerId;
    console.log('Create Review API: Updating offer review status. Is initiator:', isInitiator);
    
    try {
      // Update the review status in the offer
      const updateResult = await executeMutation(UPDATE_OFFER_REVIEW_STATUS_MUTATION, {
        offerId: parseInt(offerId),
        isInitiator: isInitiator,
        status: 'completed'
      });
      console.log('Create Review API: Offer review status updated successfully:', updateResult);
    } catch (updateError) {
      console.warn('Create Review API: Failed to update offer review status:', updateError);
      // Don't fail the whole request if this update fails
    }

    console.log('Create Review API: Review created successfully');

    return NextResponse.json({
      success: true,
      data: {
        review: createResult.insert_real_estate_review_one
      },
      message: 'Review created successfully'
    });

  } catch (error) {
    console.error('Create Review API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
