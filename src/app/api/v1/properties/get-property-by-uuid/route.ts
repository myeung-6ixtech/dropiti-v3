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
      landlord_user_id
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
      status
      user {
        uuid
        nhost_user_id
        display_name
        first_name
        last_name
        email
        photo_url
        verified
        rating
        review_count
        about
        location
        phone_number
        languages
        education
        occupation
        marital_status
        response_time
        response_rate
        avg_response_time
        total_properties
        total_guests
        updated_at
      }
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

    const propertyData = await executeQuery(GET_PROPERTY_BY_UUID_QUERY, { property_uuid: propertyUuid });

    const typedPropertyData = propertyData as {
      real_estate_property_listing?: Array<{
        id: string;
        property_uuid: string;
        title: string;
        description: string;
        landlord_user_id: string;
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
        status: string;
        user?: {
          uuid: string;
          nhost_user_id: string;
          display_name: string;
          first_name?: string;
          last_name?: string;
          email: string;
          photo_url?: string;
          verified: boolean;
          rating: number;
          review_count: number;
          about?: string;
          location?: string;
          phone_number?: string;
          languages?: string[];
          education?: string;
          occupation?: string;
          marital_status?: string;
          response_time?: string;
          response_rate?: number;
          avg_response_time?: string;
          total_properties?: number;
          total_guests?: number;
          updated_at?: string;
        };
      }>;
    };

    if (!typedPropertyData.real_estate_property_listing?.length) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const property = typedPropertyData.real_estate_property_listing[0];
    const landlordUser = property.user ?? null;

    const response = {
      property: {
        id: property.id,
        property_uuid: property.property_uuid,
        title: property.title,
        description: property.description,
        location: formatPropertyLocation(property.address),
        address: property.address,
        show_specific_location: property.show_specific_location || false,
        price: property.rental_price || 0,
        bedrooms: property.num_bedroom || 0,
        bathrooms: property.num_bathroom || 0,
        num_bedroom: property.num_bedroom,
        num_bathroom: property.num_bathroom,
        gross_area_size: property.gross_area_size,
        gross_area_size_unit: property.gross_area_size_unit,
        furnished: property.furnished,
        pets_allowed: property.pets_allowed,
        image_url: property.display_image || (property.uploaded_images?.length ? property.uploaded_images[0] : ''),
        display_image: property.display_image || '',
        uploaded_images: property.uploaded_images || [],
        available: property.status === 'published',
        status: property.status || 'draft',
        created_at: property.created_at,
        updated_at: property.created_at,
        details: {
          type: property.property_type,
          furnished: property.furnished,
          petsAllowed: property.pets_allowed,
          parking: false,
        },
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        minimum_lease: 12,
        available_date: property.availability_date,
        owner_id: property.landlord_user_id,
      },
      landlord: landlordUser ? {
        id: landlordUser.uuid,
        uuid: landlordUser.uuid,
        nhost_user_id: landlordUser.nhost_user_id,
        name: landlordUser.display_name,
        email: landlordUser.email,
        avatar: landlordUser.photo_url,
        verified: landlordUser.verified,
        rating: landlordUser.rating,
        review_count: landlordUser.review_count,
        response_time: landlordUser.response_time || 'Unknown',
        response_rate: landlordUser.response_rate || 0,
        avg_response_time: landlordUser.avg_response_time || 'Unknown',
        total_properties: landlordUser.total_properties || 0,
        total_guests: landlordUser.total_guests || 0,
        user_since: landlordUser.updated_at,
        about: landlordUser.about,
        location: landlordUser.location,
        phone_number: landlordUser.phone_number,
        languages: landlordUser.languages,
        education: landlordUser.education,
        occupation: landlordUser.occupation,
        marital_status: landlordUser.marital_status,
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
