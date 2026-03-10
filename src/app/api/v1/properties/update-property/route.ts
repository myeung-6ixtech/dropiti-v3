import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const UPDATE_PROPERTY_MUTATION = `
  mutation UpdateProperty($property_uuid: uuid!, $updates: real_estate_property_listing_set_input!) {
    update_real_estate_property_listing(
      where: { property_uuid: { _eq: $property_uuid } }
      _set: $updates
    ) {
      affected_rows
      returning {
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
      }
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
      address?: string;
      property_type?: string;
      rental_space?: string;
      num_bedroom?: number;
      num_bathroom?: number;
      gross_area_size?: number;
      gross_area_size_unit?: string;
      furnished?: string;
      pets_allowed?: boolean;
      amenities?: string[];
      display_image?: string;
      uploaded_images?: string[];
      rental_price?: number;
      rental_price_currency?: string;
      availability_date?: string | null;
      status?: string;
      updated_at?: string;
    } = {};
    
    if (updates.title) preparedUpdates.title = updates.title;
    if (updates.description) preparedUpdates.description = updates.description;
    if (updates.address) preparedUpdates.address = updates.address;
    if (updates.property_type) preparedUpdates.property_type = updates.property_type;
    if (updates.rental_space) preparedUpdates.rental_space = updates.rental_space;
    if (updates.num_bedroom) preparedUpdates.num_bedroom = parseInt(updates.num_bedroom);
    if (updates.num_bathroom) preparedUpdates.num_bathroom = parseInt(updates.num_bathroom);
    if (updates.gross_area_size) preparedUpdates.gross_area_size = parseFloat(updates.gross_area_size);
    if (updates.gross_area_size_unit) preparedUpdates.gross_area_size_unit = updates.gross_area_size_unit;
    if (updates.furnished !== undefined) {
      // Handle furnished field - it should be a string, not boolean
      preparedUpdates.furnished = typeof updates.furnished === 'string' ? updates.furnished : 'non-furnished';
    }
    if (updates.pets_allowed !== undefined) preparedUpdates.pets_allowed = updates.pets_allowed;
    if (updates.amenities !== undefined) preparedUpdates.amenities = updates.amenities;
    if (updates.display_image !== undefined) preparedUpdates.display_image = updates.display_image;
    if (updates.uploaded_images !== undefined) preparedUpdates.uploaded_images = updates.uploaded_images;
    if (updates.rental_price) preparedUpdates.rental_price = parseFloat(updates.rental_price);
    if (updates.rental_price_currency) preparedUpdates.rental_price_currency = updates.rental_price_currency;
    if (updates.availability_date) preparedUpdates.availability_date = updates.availability_date;
    
    // Validate and set status (status is the single source of truth)
    if (updates.status) {
      const validStatuses = ['draft', 'published', 'archived', 'expired'];
      if (validStatuses.includes(updates.status)) {
        preparedUpdates.status = updates.status;
      } else {
        console.error('Invalid status value:', updates.status);
        return NextResponse.json(
          { error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }
    
    // Always update the updated_at timestamp
    preparedUpdates.updated_at = new Date().toISOString();

    const data = await executeMutation(UPDATE_PROPERTY_MUTATION, { 
      property_uuid: id, 
      updates: preparedUpdates 
    });

    // Type assertion for the response data
    const typedData = data as {
      update_real_estate_property_listing: {
        affected_rows: number;
        returning: {
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
          furnished: string;
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
        }[];
      };
    };

    if (typedData.update_real_estate_property_listing.affected_rows === 0) {
      return NextResponse.json(
        { error: 'Property not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: typedData.update_real_estate_property_listing.returning[0],
      message: 'Property updated successfully',
    });
  } catch (error) {
    console.error('Update property error:', error);
    
    // Provide more specific error information
    let errorMessage = 'Failed to update property';
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check for specific GraphQL errors
      if (error.message.includes('constraint')) {
        errorMessage = 'Database constraint violation. Please check your input values.';
        statusCode = 400;
      } else if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. You may not have access to update this property.';
        statusCode = 403;
      } else if (error.message.includes('not found')) {
        errorMessage = 'Property not found.';
        statusCode = 404;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: statusCode }
    );
  }
}
