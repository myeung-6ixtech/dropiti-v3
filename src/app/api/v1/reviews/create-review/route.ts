import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($review: review_insert_input!) {
    insert_review_one(object: $review) {
      id
      offer_uuid
      review_type
      rating
      comment
      reviewer_id
      reviewed_user_id
      property_uuid
      created_at
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
    const {
      offerId,
      offerUuid,
      reviewType,
      rating,
      comment,
      reviewerId,
      reviewedUserId,
      propertyUuid
    } = await request.json();

    // Validate required fields
    if (!offerId || !offerUuid || !reviewType || !rating || !comment || !reviewerId || !reviewedUserId || !propertyUuid) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    console.log('Create Review API: Creating review for offer:', offerUuid);

    // Create the review
    const reviewData = {
      offer_uuid: offerUuid,
      review_type: reviewType,
      rating: rating,
      comment: comment,
      reviewer_id: reviewerId,
      reviewed_user_id: reviewedUserId,
      property_uuid: propertyUuid,
      created_at: new Date().toISOString()
    };

    const createResult = await executeMutation(CREATE_REVIEW_MUTATION, { review: reviewData }) as {
      insert_review_one: {
        id: string;
        offer_uuid: string;
        review_type: string;
        rating: number;
        comment: string;
        reviewer_id: string;
        reviewed_user_id: string;
        property_uuid: string;
        created_at: string;
      };
    };

    if (!createResult.insert_review_one) {
      throw new Error('Failed to create review');
    }

    // Update the offer's review status
    // Determine if the reviewer is the initiator or recipient
    const getOfferQuery = `
      query GetOffer($offerId: Int!) {
        real_estate_offer_by_pk(id: $offerId) {
          id
          initiator_firebase_uid
          recipient_firebase_uid
        }
      }
    `;

    const offerData = await executeMutation(getOfferQuery, { offerId }) as {
      real_estate_offer_by_pk: {
        id: string;
        initiator_firebase_uid: string;
        recipient_firebase_uid: string;
      };
    };

    if (offerData.real_estate_offer_by_pk) {
      const isInitiator = offerData.real_estate_offer_by_pk.initiator_firebase_uid === reviewerId;
      
      // Update the review status in the offer
      await executeMutation(UPDATE_OFFER_REVIEW_STATUS_MUTATION, {
        offerId: parseInt(offerId),
        isInitiator: isInitiator,
        status: 'completed'
      });
    }

    console.log('Create Review API: Review created successfully');

    return NextResponse.json({
      success: true,
      data: {
        review: createResult.insert_review_one
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
