import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_PROPERTY_QUERY = `
  query GetProperty($id: uuid!) {
    properties_by_pk(id: $id) {
      id
      title
      description
      location
      price
      bedrooms
      bathrooms
      imageUrl
      details {
        type
        furnished
        petsAllowed
        parking
      }
      rules
      amenities
      minimumLease
      availableDate
      createdAt
      updatedAt
      owner {
        id
        name
        email
        avatar
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const data = await executeQuery(GET_PROPERTY_QUERY, { id });

    // Type assertion for the response data
    const typedData = data as {
      properties_by_pk: {
        id: string;
        title: string;
        description: string;
        location: string;
        price: number;
        bedrooms: number;
        bathrooms: number;
        imageUrl: string;
        details: {
          type: string;
          furnished: string;
          petsAllowed: boolean;
          parking: boolean;
        };
        rules: string[];
        amenities: string[];
        minimumLease: number;
        availableDate: string | null;
        createdAt: string;
        updatedAt: string;
        owner: {
          id: string;
          name: string;
          email: string;
          avatar: string;
        };
      } | null;
    };

    if (!typedData.properties_by_pk) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: typedData.properties_by_pk,
    });
  } catch (error) {
    console.error('Get property error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}
