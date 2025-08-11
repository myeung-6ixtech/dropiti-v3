import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const UPDATE_PROPERTY_MUTATION = `
  mutation UpdateProperty($id: uuid!, $updates: properties_set_input!) {
    update_properties_by_pk(
      pk_columns: { id: $id }
      _set: $updates
    ) {
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
      updatedAt
    }
  }
`;

export async function PUT(request: NextRequest) {
  try {
    const { id, updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Prepare updates object, ensuring proper data types
    const preparedUpdates: {
      title?: string;
      description?: string;
      location?: string;
      price?: number;
      bedrooms?: number;
      bathrooms?: number;
      imageUrl?: string;
      details?: Record<string, unknown>;
      rules?: string[];
      amenities?: string[];
      minimumLease?: number;
      availableDate?: string | null;
      updatedAt?: string;
    } = {};
    
    if (updates.title) preparedUpdates.title = updates.title;
    if (updates.description) preparedUpdates.description = updates.description;
    if (updates.location) preparedUpdates.location = updates.location;
    if (updates.price) preparedUpdates.price = parseFloat(updates.price);
    if (updates.bedrooms) preparedUpdates.bedrooms = parseInt(updates.bedrooms);
    if (updates.bathrooms) preparedUpdates.bathrooms = parseInt(updates.bathrooms);
    if (updates.imageUrl) preparedUpdates.imageUrl = updates.imageUrl;
    if (updates.details) preparedUpdates.details = updates.details;
    if (updates.rules) preparedUpdates.rules = updates.rules;
    if (updates.amenities) preparedUpdates.amenities = updates.amenities;
    if (updates.minimumLease) preparedUpdates.minimumLease = parseInt(updates.minimumLease);
    if (updates.availableDate) preparedUpdates.availableDate = updates.availableDate;
    
    // Always update the updatedAt timestamp
    preparedUpdates.updatedAt = new Date().toISOString();

    const data = await executeMutation(UPDATE_PROPERTY_MUTATION, { 
      id, 
      updates: preparedUpdates 
    });

    // Type assertion for the response data
    const typedData = data as {
      update_properties_by_pk: {
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
        updatedAt: string;
      };
    };

    return NextResponse.json({
      success: true,
      data: typedData.update_properties_by_pk,
      message: 'Property updated successfully',
    });
  } catch (error) {
    console.error('Update property error:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}
