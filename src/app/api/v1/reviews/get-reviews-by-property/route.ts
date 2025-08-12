import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

// GraphQL response types
interface GraphQLReview {
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
}

interface GraphQLUser {
  uuid: string;
  firebase_uid: string;
  display_name: string;
  email: string;
  photo_url?: string;
}

interface GraphQLOffersResponse {
  real_estate_review: GraphQLReview[];
}

interface GraphQLUserResponse {
  real_estate_user: GraphQLUser[];
}

// GraphQL query to get reviews by property
const GET_REVIEWS_BY_PROPERTY_QUERY = `
  query GetReviewsByProperty($propertyUuid: String!, $reviewType: String, $limit: Int, $offset: Int) {
    real_estate_review(
      where: {
        property_uuid: { _eq: $propertyUuid }
        review_type: { _eq: $reviewType }
        is_public: { _eq: true }
      }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
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

// GraphQL query to get user details by Firebase UID
const GET_USER_BY_FIREBASE_UID_QUERY = `
  query GetUserByFirebaseUid($firebaseUid: String!) {
    real_estate_user(where: { firebase_uid: { _eq: $firebaseUid } }) {
      uuid
      firebase_uid
      display_name
      email
      photo_url
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyUuid = searchParams.get('propertyUuid');
    const reviewType = searchParams.get('reviewType'); // Optional filter
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    console.log('Get Reviews by Property API: Received request with params:', { 
      propertyUuid, 
      reviewType, 
      limit, 
      offset 
    });

    if (!propertyUuid) {
      console.log('Get Reviews by Property API: Missing propertyUuid parameter');
      return NextResponse.json(
        { error: 'propertyUuid parameter is required' },
        { status: 400 }
      );
    }

    // Build query variables
    const variables: Record<string, unknown> = {
      propertyUuid,
      limit,
      offset
    };

    // Add reviewType filter if provided
    if (reviewType) {
      variables.reviewType = reviewType;
    }

    // First, fetch the reviews
    console.log('Get Reviews by Property API: Executing GraphQL query for property:', propertyUuid);
    const reviewsData = await executeQuery(GET_REVIEWS_BY_PROPERTY_QUERY, variables) as GraphQLOffersResponse;

    console.log('Get Reviews by Property API: Raw GraphQL response:', reviewsData);

    if (!reviewsData?.real_estate_review) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'No reviews found for this property',
      });
    }

    // Collect unique user IDs to fetch additional data
    const uniqueUserIds = [...new Set([
      ...reviewsData.real_estate_review.map(review => review.reviewer_firebase_uid),
      ...reviewsData.real_estate_review.map(review => review.reviewed_user_firebase_uid)
    ])];

    // Fetch user details for all unique users
    const userDetails: Record<string, GraphQLUser> = {};
    for (const userId of uniqueUserIds) {
      try {
        const userResponse = await executeQuery(GET_USER_BY_FIREBASE_UID_QUERY, { firebaseUid: userId }) as GraphQLUserResponse;
        if (userResponse?.real_estate_user?.[0]) {
          userDetails[userId] = userResponse.real_estate_user[0];
        }
      } catch (error) {
        console.error(`Error fetching user details for ${userId}:`, error);
      }
    }

    // Transform and combine data
    const transformedReviews = reviewsData.real_estate_review.map((review: GraphQLReview) => {
      const reviewer = userDetails[review.reviewer_firebase_uid];
      const reviewedUser = userDetails[review.reviewed_user_firebase_uid];

      return {
        id: review.id,
        reviewUuid: review.review_uuid,
        reviewerFirebaseUid: review.reviewer_firebase_uid,
        reviewedUserFirebaseUid: review.reviewed_user_firebase_uid,
        reviewType: review.review_type,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        offerUuid: review.offer_uuid,
        propertyUuid: review.property_uuid,
        isPublic: review.is_public,
        isVerified: review.is_verified,
        helpfulCount: review.helpful_count,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
        // Include reviewer details
        reviewer: reviewer ? {
          uuid: reviewer.uuid,
          displayName: reviewer.display_name,
          email: reviewer.email,
          photoUrl: reviewer.photo_url,
        } : null,
        // Include reviewed user details
        reviewedUser: reviewedUser ? {
          uuid: reviewedUser.uuid,
          displayName: reviewedUser.display_name,
          email: reviewedUser.email,
          photoUrl: reviewedUser.photo_url,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedReviews,
      total: transformedReviews.length,
      message: 'Reviews fetched successfully',
    });

  } catch (error) {
    console.error('Get Reviews by Property API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
