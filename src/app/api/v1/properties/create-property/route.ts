import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const CREATE_PROPERTY_MUTATION = `
  mutation CreateProperty($property: properties_insert_input!) {
    insert_properties_one(object: $property) {
      id
      title
      description
      location
      price
      bedrooms
      bathrooms
      imageUrl
      details
      rules
      amenities
      minimumLease
      availableDate
      createdAt
      updatedAt
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'price', 'bedrooms', 'bathrooms'];
    for (const field of requiredFields) {
      if (!propertyData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Prepare the property object for Hasura
    const property = {
      title: propertyData.title,
      description: propertyData.description,
      location: propertyData.location,
      price: parseFloat(propertyData.price),
      bedrooms: parseInt(propertyData.bedrooms),
      bathrooms: parseInt(propertyData.bathrooms),
      imageUrl: propertyData.imageUrl || '',
      details: propertyData.details || {},
      rules: propertyData.rules || [],
      amenities: propertyData.amenities || [],
      minimumLease: parseInt(propertyData.minimumLease) || 12,
      availableDate: propertyData.availableDate || null,
      ownerId: propertyData.ownerId, // This should come from the authenticated user
    };

    const data = await executeMutation(CREATE_PROPERTY_MUTATION, { property });

    // Type assertion for the response data
    const typedData = data as {
      insert_properties_one: {
        id: string;
        title: string;
        description: string;
        location: string;
        price: number;
        bedrooms: number;
        bathrooms: number;
        imageUrl: string;
        details: Record<string, unknown>;
        rules: string[];
        amenities: string[];
        minimumLease: number;
        availableDate: string | null;
        createdAt: string;
        updatedAt: string;
      };
    };

    return NextResponse.json({
      success: true,
      data: typedData.insert_properties_one,
      message: 'Property created successfully',
    });
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
