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

interface GraphQLProperty {
  property_uuid: string;
  title: string;
  location: string;
  rental_price: number;
  rental_price_currency: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  photos: string[];
}

interface GraphQLOffersResponse {
  real_estate_review: GraphQLReview[];
}

interface GraphQLUserResponse {
  real_estate_user: GraphQLUser[];
}

interface GraphQLPropertyResponse {
  real_estate_property_listing: GraphQLProperty[];
}

// GraphQL query to get reviews by user (either as reviewer or reviewed)
const GET_REVIEWS_BY_USER_QUERY = `
  query GetReviewsByUser($userFirebaseUid: String!, $reviewType: String, $limit: Int, $offset: Int) {
    real_estate_review(
      where: {
        _or: [
          { reviewer_firebase_uid: { _eq: $userFirebaseUid } },
          { reviewed_user_firebase_uid: { _eq: $userFirebaseUid } }
        ]
        review_type: { _eq: $reviewType }
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

// GraphQL query to get property details by UUID
const GET_PROPERTY_BY_UUID_QUERY = `
  query GetPropertyByUuid($propertyUuid: String!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $propertyUuid } }) {
      property_uuid
      title
      location
      rental_price
      rental_price_currency
      property_type
      bedrooms
      bathrooms
      photos
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFirebaseUid = searchParams.get('userFirebaseUid');
    const reviewType = searchParams.get('reviewType'); // Optional filter
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    console.log('Get Reviews by User API: Received request with params:', { 
      userFirebaseUid, 
      reviewType, 
      limit, 
      offset 
    });

    if (!userFirebaseUid) {
      console.log('Get Reviews by User API: Missing userFirebaseUid parameter');
      return NextResponse.json(
        { error: 'userFirebaseUid parameter is required' },
        { status: 400 }
      );
    }

    // Build query variables
    const variables: Record<string, unknown> = {
      userFirebaseUid,
      limit,
      offset
    };

    // Add reviewType filter if provided
    if (reviewType) {
      variables.reviewType = reviewType;
    }

    // First, fetch the reviews
    console.log('Get Reviews by User API: Executing GraphQL query for user:', userFirebaseUid);
    const reviewsData = await executeQuery(GET_REVIEWS_BY_USER_QUERY, variables) as GraphQLOffersResponse;

    console.log('Get Reviews by User API: Raw GraphQL response:', reviewsData);

    if (!reviewsData?.real_estate_review) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'No reviews found for this user',
      });
    }

    // Collect unique user IDs and property UUIDs to fetch additional data
    const uniqueUserIds = [...new Set([
      ...reviewsData.real_estate_review.map(review => review.reviewer_firebase_uid),
      ...reviewsData.real_estate_review.map(review => review.reviewed_user_firebase_uid)
    ])];
    
    const uniquePropertyUuids = [...new Set(
      reviewsData.real_estate_review
        .map(review => review.property_uuid)
        .filter(uuid => uuid !== null)
    )];

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

    // Fetch property details for all unique properties
    const propertyDetails: Record<string, GraphQLProperty> = {};
    for (const propUuid of uniquePropertyUuids) {
      if (!propUuid) continue; // Skip if propUuid is undefined
      try {
        const propertyResponse = await executeQuery(GET_PROPERTY_BY_UUID_QUERY, { propertyUuid: propUuid }) as GraphQLPropertyResponse;
        if (propertyResponse?.real_estate_property_listing?.[0]) {
          propertyDetails[propUuid] = propertyResponse.real_estate_property_listing[0];
        }
      } catch (error) {
        console.error(`Error fetching property details for ${propUuid}:`, error);
      }
    }

    // Transform and combine data
    const transformedReviews = reviewsData.real_estate_review.map((review: GraphQLReview) => {
      const reviewer = userDetails[review.reviewer_firebase_uid];
      const reviewedUser = userDetails[review.reviewed_user_firebase_uid];
      const property = review.property_uuid ? propertyDetails[review.property_uuid] : null;

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
        // Include property details
        property: property ? {
          propertyUuid: property.property_uuid,
          title: property.title,
          location: property.location,
          rentalPrice: property.rental_price,
          rentalPriceCurrency: property.rental_price_currency,
          propertyType: property.property_type,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          photos: property.photos,
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
    console.error('Get Reviews by User API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
