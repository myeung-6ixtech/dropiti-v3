import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';
import { v4 as uuidv4 } from 'uuid';
import { getDefaultStatus } from '@/lib/utils/propertyStatus';

const CREATE_PROPERTY_MUTATION = `
  mutation CreateProperty($property: real_estate_property_listing_insert_input!) {
    insert_real_estate_property_listing_one(object: $property) {
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
      status
      last_saved_at
      completion_percentage
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json();

    console.log('Create Property API: Received data:', propertyData);

    // Check if this is a draft
    const isDraft = propertyData.isDraft || false;
    
    // For drafts, only validate title (minimal requirement)
    if (isDraft) {
      if (!propertyData.title || propertyData.title.trim().length < 3) {
        console.log('Create Property API: Draft requires at least a title (3+ characters)');
        return NextResponse.json(
          { error: 'Draft requires at least a title (3+ characters)' },
          { status: 400 }
        );
      }
    } else {
      // For published properties, validate all required fields
      const requiredFields = ['title', 'description', 'location', 'price', 'bedrooms', 'bathrooms'];
      for (const field of requiredFields) {
        if (!propertyData[field]) {
          console.log(`Create Property API: Missing required field: ${field}`);
          return NextResponse.json(
            { error: `${field} is required` },
            { status: 400 }
          );
        }
      }
    }

    // Prepare the property object for Hasura using the correct field names
    const property = {
      property_uuid: uuidv4(), // Generate a Version 4 UUID
      title: propertyData.title || 'Untitled Draft',
      description: propertyData.description || '',
      // Store address as a structured JSON object for better searchability
      address: propertyData.address || propertyData.location || 'Address not specified', // Use address object if available, fallback to location
      rental_price: propertyData.price ? parseFloat(propertyData.price) : 0, // Use 0 instead of null for drafts
      rental_price_currency: 'HKD', // Set default currency to HKD
      num_bedroom: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : 0, // Use 0 instead of null for drafts
      num_bathroom: propertyData.bathrooms ? parseInt(propertyData.bathrooms) : 0, // Use 0 instead of null for drafts
      display_image: propertyData.photos?.[0] || propertyData.imageUrl || '',
      uploaded_images: propertyData.photos || (propertyData.imageUrl ? [propertyData.imageUrl] : []),
      property_type: propertyData.details?.propertyType || 'residential',
      rental_space: propertyData.details?.rentalSpace || 'entire',
      furnished: propertyData.details?.furnished || 'non-furnished',
      pets_allowed: propertyData.details?.petsAllowed || false,
      amenities: propertyData.amenities || [],
      gross_area_size: propertyData.details?.grossArea || 0, // Use 0 instead of null for drafts
      gross_area_size_unit: 'sqft', // Default unit
      availability_date: propertyData.availableDate || new Date().toISOString(), // Use current date as default for drafts
      status: getDefaultStatus(isDraft), // Use status as single source of truth
      landlord_firebase_uid: propertyData.ownerId, // Use the authenticated user's Firebase UID
      show_specific_location: propertyData.address?.showSpecificLocation ?? false, // Add the show specific location boolean
      last_saved_at: new Date().toISOString(), // Set current timestamp
      completion_percentage: isDraft ? 0 : 100, // Drafts start at 0%, published at 100%
    };

    console.log('Create Property API: Generated property_uuid:', property.property_uuid);
    console.log('Create Property API: Prepared property object:', property);

    const data = await executeMutation(CREATE_PROPERTY_MUTATION, { property });

    console.log('Create Property API: GraphQL response:', data);

    // Type assertion for the response data
    const typedData = data as {
      insert_real_estate_property_listing_one: {
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
        status: string;
      };
    };

    return NextResponse.json({
      success: true,
      data: typedData.insert_real_estate_property_listing_one,
      message: 'Property created successfully',
    });
  } catch (error) {
    console.error('Create Property API: Error details:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Create Property API: Error message:', error.message);
      console.error('Create Property API: Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
