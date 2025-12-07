import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';
import { formatPropertyLocation } from '@/lib/utils';

const GET_PROPERTY_QUERY = `
  query GetProperty($property_uuid: uuid!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $property_uuid } }, limit: 1) {
      id
      property_uuid
      title
      description
      address
      property_type
      rental_space
      num_bedroom
      num_bathroom
      gross_area_size
      gross_area_size_unit
      furnished
      pets_allowed
      amenities
      display_image
      uploaded_images
      rental_price
      rental_price_currency
      availability_date
      status
      created_at
      updated_at
      landlord_firebase_uid
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyUuid = searchParams.get('property_uuid');

    if (!propertyUuid) {
      return NextResponse.json(
        { error: 'Property UUID is required' },
        { status: 400 }
      );
    }

    const data = await executeQuery(GET_PROPERTY_QUERY, { property_uuid: propertyUuid });

    // Type assertion for the response data
    const typedData = data as {
      real_estate_property_listing: {
        id: number;
        property_uuid: string;
        title: string;
        description: string;
        address: string;
        property_type: string;
        rental_space: string;
        num_bedroom: number;
        num_bathroom: number;
        gross_area_size: number;
        gross_area_size_unit: string;
        furnished: boolean;
        pets_allowed: boolean;
        amenities: string[];
        display_image: string;
        uploaded_images: string[];
        rental_price: number;
        rental_price_currency: string;
        availability_date: string | null;
        status: string;
        created_at: string;
        updated_at: string;
        landlord_firebase_uid: string;
      }[];
    };

    if (!typedData.real_estate_property_listing || typedData.real_estate_property_listing.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const property = typedData.real_estate_property_listing[0];
    
    // Transform the response to include both raw address and formatted location
    const transformedProperty = {
      ...property,
      location: formatPropertyLocation(property.address), // Formatted location for display
      address: property.address, // Raw JSON address data for editing
    };

    return NextResponse.json({
      success: true,
      data: transformedProperty,
    });
  } catch (error) {
    console.error('Get property error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}
