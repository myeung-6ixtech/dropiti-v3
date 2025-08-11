import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';
import { formatPropertyLocation } from '@/lib/utils';

const GET_PROPERTY_BY_UUID_QUERY = `
  query GetPropertyByUuid($property_uuid: uuid!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $property_uuid } }, limit: 1) {
      id
      property_uuid
      title
      description
      landlord_firebase_uid
      created_at
      property_type
      rental_space
      address
      show_specific_location
      gross_area_size
      gross_area_size_unit
      num_bedroom
      num_bathroom
      furnished
      pets_allowed
      amenities
      display_image
      uploaded_images
      rental_price
      rental_price_currency
      availability_date
      is_public
    }
  }
`;

const GET_LANDLORD_BY_FIREBASE_UID_QUERY = `
  query GetLandlordByFirebaseUid($firebase_uid: String!) {
    user(where: { firebase_uid: { _eq: $firebase_uid } }, limit: 1) {
      id
      firebase_uid
      display_name
      email
      photo_url
      verified
      rating
      review_count
      response_time
      response_rate
      total_properties
      total_guests
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyUuid = searchParams.get('property_uuid');

    if (!propertyUuid) {
      return NextResponse.json(
        { error: 'Property UUID parameter is required' },
        { status: 400 }
      );
    }

    // Get property by UUID
    const propertyData = await executeQuery(GET_PROPERTY_BY_UUID_QUERY, { property_uuid: propertyUuid });

    // Type assertion for the response data
    const typedPropertyData = propertyData as {
      real_estate_property_listing?: Array<{
        id: string;
        property_uuid: string;
        title: string;
        description: string;
        landlord_firebase_uid: string;
        created_at: string;
        property_type: string;
        rental_space: string;
        address: string;
        show_specific_location: boolean;
        gross_area_size: number;
        gross_area_size_unit: string;
        num_bedroom: number;
        num_bathroom: number;
        furnished: boolean;
        pets_allowed: boolean;
        amenities: string[];
        display_image: string;
        uploaded_images: string[];
        rental_price: number;
        rental_price_currency: string;
        availability_date: string;
        is_public: boolean;
      }>;
    };

    if (!typedPropertyData.real_estate_property_listing || typedPropertyData.real_estate_property_listing.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const property = typedPropertyData.real_estate_property_listing[0];

    // Get landlord information if landlord_firebase_uid exists
    let landlord = null;
    if (property.landlord_firebase_uid) {
      try {
        const landlordData = await executeQuery(GET_LANDLORD_BY_FIREBASE_UID_QUERY, { 
          firebase_uid: property.landlord_firebase_uid 
        });

        const typedLandlordData = landlordData as {
          user?: Array<{
            id: string;
            firebase_uid: string;
            display_name: string;
            email: string;
            photo_url?: string;
            verified: boolean;
            rating: number;
            review_count: number;
            response_time?: string;
            response_rate: number;
            total_properties: number;
            total_guests: number;
          }>;
        };

        if (typedLandlordData.user && typedLandlordData.user.length > 0) {
          landlord = typedLandlordData.user[0];
        }
      } catch (error) {
        console.error('Failed to fetch landlord data:', error);
        // Continue without landlord data
      }
    }

    // Prepare the response with property and landlord data
    const response = {
      property: {
        id: property.id,
        property_uuid: property.property_uuid,
        title: property.title,
        description: property.description,
        location: formatPropertyLocation(property.address),
        price: property.rental_price || 0,
        bedrooms: property.num_bedroom || 0,
        bathrooms: property.num_bathroom || 0,
        image_url: property.display_image || (property.uploaded_images && property.uploaded_images.length > 0 ? property.uploaded_images[0] : ''),
        available: property.is_public || false,
        created_at: property.created_at,
        updated_at: property.created_at, // Using created_at as fallback
        details: {
          type: property.property_type,
          furnished: property.furnished,
          petsAllowed: property.pets_allowed,
          parking: false, // Default value
        },
        amenities: Array.isArray(property.amenities) ? property.amenities : [], // Ensure amenities is an array
        minimum_lease: 12, // Default value
        available_date: property.availability_date,
        owner_id: property.landlord_firebase_uid,
      },
      landlord: landlord ? {
        id: landlord.id,
        firebase_uid: landlord.firebase_uid,
        name: landlord.display_name,
        email: landlord.email,
        avatar: landlord.photo_url,
        verified: landlord.verified,
        rating: landlord.rating,
        review_count: landlord.review_count,
        response_time: landlord.response_time || 'Unknown',
        response_rate: landlord.response_rate,
        total_properties: landlord.total_properties,
        total_guests: landlord.total_guests,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Property retrieved successfully',
    });
  } catch (error) {
    console.error('Get property by UUID error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve property' },
      { status: 500 }
    );
  }
}
