import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

// GraphQL response types
interface GraphQLReview {
  id: string;
  review_uuid: string;
  reviewer_user_id: string;
  reviewee_user_id: string;
  review_type: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  offer_uuid?: string | null;
  property_uuid?: string | null;
  is_public: boolean;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

interface GraphQLUser {
  uuid: string;
  nhost_user_id: string;
  display_name: string;
  email: string;
  photo_url?: string | null;
}

interface GraphQLReviewsResponse {
  real_estate_review: GraphQLReview[];
}

interface GraphQLUserResponse {
  real_estate_user: GraphQLUser[];
}

// GraphQL query to get reviews by property with reviewType filter
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
`;

// GraphQL query to get reviews by property without reviewType filter
const GET_REVIEWS_BY_PROPERTY_NO_TYPE_QUERY = `
  query GetReviewsByProperty($propertyUuid: String!, $limit: Int, $offset: Int) {
    real_estate_review(
      where: {
        property_uuid: { _eq: $propertyUuid }
        is_public: { _eq: true }
      }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
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
`;

// GraphQL query to get user details by Firebase UID
const GET_USER_BY_FIREBASE_UID_QUERY = `
  query GetUserByFirebaseUid($nhostUserId: String!) {
    real_estate_user(where: { nhost_user_id: { _eq: $nhostUserId } }) {
      uuid
      nhost_user_id
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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

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

    // Select the appropriate GraphQL query based on whether reviewType is provided
    let query: string;
    if (reviewType) {
      query = GET_REVIEWS_BY_PROPERTY_QUERY;
      variables.reviewType = reviewType;
    } else {
      query = GET_REVIEWS_BY_PROPERTY_NO_TYPE_QUERY;
    }

    // First, fetch the reviews
    console.log('Get Reviews by Property API: Executing GraphQL query for property:', propertyUuid);
    const reviewsData = await executeQuery(query, variables) as GraphQLReviewsResponse;

    console.log('Get Reviews by Property API: Raw GraphQL response:', reviewsData);

    if (!reviewsData?.real_estate_review || reviewsData.real_estate_review.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'No reviews found for this property',
      });
    }

    // Collect unique user IDs to fetch additional data
    const uniqueUserIds = [...new Set([
      ...reviewsData.real_estate_review.map(review => review.reviewer_user_id),
      ...reviewsData.real_estate_review.map(review => review.reviewee_user_id)
    ])];

    // Fetch user details for all unique users
    const userDetails: Record<string, GraphQLUser> = {};
    for (const userId of uniqueUserIds) {
      try {
        const userResponse = await executeQuery(GET_USER_BY_FIREBASE_UID_QUERY, { nhostUserId: userId }) as GraphQLUserResponse;
        if (userResponse?.real_estate_user?.[0]) {
          userDetails[userId] = userResponse.real_estate_user[0];
        }
      } catch (error) {
        console.error(`Error fetching user details for ${userId}:`, error);
      }
    }

    // Transform and combine data
    const transformedReviews = reviewsData.real_estate_review.map((review: GraphQLReview) => {
      const reviewer = userDetails[review.reviewer_user_id];
      const reviewee = userDetails[review.reviewee_user_id];

      return {
        id: review.id,
        reviewUuid: review.review_uuid,
        reviewerFirebaseUid: review.reviewer_user_id,
        revieweeFirebaseUid: review.reviewee_user_id,
        reviewType: review.review_type,
        rating: review.rating,
        title: review.title || undefined,
        comment: review.comment || undefined,
        offerUuid: review.offer_uuid || undefined,
        propertyUuid: review.property_uuid || undefined,
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
          photoUrl: reviewer.photo_url || undefined,
        } : null,
        // Include reviewee details
        reviewee: reviewee ? {
          uuid: reviewee.uuid,
          displayName: reviewee.display_name,
          email: reviewee.email,
          photoUrl: reviewee.photo_url || undefined,
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
