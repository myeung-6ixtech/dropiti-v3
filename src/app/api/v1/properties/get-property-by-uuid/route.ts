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
      landlord_details {
        nhost_user_id
        display_name
        first_name
        last_name
        email
        photo_url
        about
        phone_number
        languages
        education
        occupation
        avg_response_time
      }
      landlord_user {
        id
        avatarUrl
        email
        lastSeen
        createdAt
        defaultRole
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
        landlord_details?: {
          nhost_user_id: string;
          display_name: string;
          first_name?: string;
          last_name?: string;
          email: string;
          photo_url?: string;
          about?: string;
          phone_number?: string;
          languages?: string[];
          education?: string;
          occupation?: string;
          avg_response_time?: string;
        };
        landlord_user?: {
          id?: string;
          avatarUrl?: string;
          email?: string;
          lastSeen?: string;
          createdAt?: string;
          defaultRole?: string;
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
    const details = property.landlord_details ?? null;
    const authUser = property.landlord_user ?? null; // auth.users: defaultRole used for admin listing detection

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
      // Always return a landlord object if we have any identity info
      landlord: (details || authUser || property.landlord_user_id) ? {
        id: details?.nhost_user_id || authUser?.id || property.landlord_user_id,
        uuid: details?.nhost_user_id || authUser?.id || property.landlord_user_id,
        nhost_user_id: details?.nhost_user_id || authUser?.id || property.landlord_user_id,
        name: details?.display_name || authUser?.email?.split('@')[0] || 'Landlord',
        email: details?.email || authUser?.email || '',
        avatar: details?.photo_url || authUser?.avatarUrl,
        verified: false,
        rating: 0,
        review_count: 0,
        response_rate: 0,
        avg_response_time: details?.avg_response_time || 'Unknown',
        user_since: authUser?.createdAt,
        about: details?.about,
        location: null,
        phone_number: details?.phone_number,
        languages: details?.languages,
        education: details?.education,
        occupation: details?.occupation,
        marital_status: null,
        role: authUser?.defaultRole ?? undefined, // from auth.users.defaultRole; 'admin' => admin/claim listing
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
