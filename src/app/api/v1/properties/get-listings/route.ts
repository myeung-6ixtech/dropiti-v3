import { NextRequest, NextResponse } from 'next/server';
import { PropertyService } from '@/app/api/graphql/services/propertyService';
import { formatPropertyLocation } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const bedrooms = searchParams.get('bedrooms');
  const type = searchParams.get('type');
  const landlordFirebaseUid = searchParams.get('landlord_firebase_uid');
  
  try {
    // Build filters object using PropertyService filter interface
    const filters: {
      minPrice?: number;
      maxPrice?: number;
      bedrooms?: number;
      type?: string;
      landlordFirebaseUid?: string;
    } = {};
    
    if (minPrice) {
      filters.minPrice = parseFloat(minPrice);
    }
    
    if (maxPrice) {
      filters.maxPrice = parseFloat(maxPrice);
    }
    
    if (bedrooms) {
      filters.bedrooms = parseInt(bedrooms);
    }
    
    if (type) {
      filters.type = type;
    }

    if (landlordFirebaseUid) {
      filters.landlordFirebaseUid = landlordFirebaseUid;
    }

    // Get properties from PropertyService
    const data = await PropertyService.getProperties(limit, offset, filters);
    
    // Check if data exists and has the expected structure
    if (!data || !data.properties) {
      console.error('Invalid data structure received from PropertyService:', data);
      return NextResponse.json(
        { error: 'Invalid data structure received from PropertyService' },
        { status: 500 }
      );
    }
    
    // Transform the data to match your frontend expectations
    const transformedProperties = data.properties.map((property) => {
      // Type assertion for the property object
      const typedProperty = property as { 
        id: string; 
        property_uuid?: string; 
        title: string; 
        description: string; 
        address: unknown; 
        rental_price?: number | null; 
        num_bedroom?: number | null; 
        num_bathroom?: number | null; 
        display_image?: string | null; 
        uploaded_images?: string[] | null; 
        property_type?: string; 
        furnished?: string | null; 
        pets_allowed?: boolean | null; 
        amenities?: string[] | null; 
        availability_date?: string | null; 
        created_at?: string; 
      };
      
      // Handle both string and JSON address formats
      let location: string;
      
      if (typeof typedProperty.address === 'string') {
        // Handle old string format (backward compatibility)
        location = typedProperty.address;
      } else if (typedProperty.address && typeof typedProperty.address === 'object') {
        // Handle new JSON format
        location = formatPropertyLocation(typedProperty.address);
      } else {
        // Fallback
        location = 'Location not specified';
      }
      
      return {
        id: typedProperty.id,
        property_uuid: typedProperty.property_uuid || '',
        title: typedProperty.title,
        description: typedProperty.description,
        location: location,
        price: typedProperty.rental_price || 0,
        bedrooms: typedProperty.num_bedroom || 0,
        bathrooms: typedProperty.num_bathroom || 0,
        imageUrl: typedProperty.display_image || typedProperty.uploaded_images?.[0] || '',
        details: {
          type: typedProperty.property_type || 'residential',
          furnished: typedProperty.furnished || 'non-furnished',
          petsAllowed: typedProperty.pets_allowed || false,
          parking: false,
        },
        rules: [],
        amenities: typedProperty.amenities || [],
        minimumLease: 12,
        availableDate: typedProperty.availability_date,
        createdAt: typedProperty.created_at || new Date().toISOString(),
        updatedAt: typedProperty.created_at || new Date().toISOString(),
      };
    });
    
    return NextResponse.json({
      success: true,
      data: transformedProperties,
      pagination: {
        total: data.total || 0,
        limit,
        offset,
        hasMore: offset + limit < (data.total || 0),
      },
    });
  } catch (error) {
    console.error('Get properties error:', error);
    
    // For development, return mock data if Hasura is not configured
    if (!process.env.HASURA_ENDPOINT) {
      console.log('Hasura not configured, returning mock data');
      return NextResponse.json({
        success: true,
        data: [
          {
            id: '1',
            title: 'Modern Downtown Apartment',
            description: 'Beautiful 2-bedroom apartment in the heart of downtown.',
            location: 'Downtown, City Center',
            price: 2500,
            bedrooms: 2,
            bathrooms: 2,
            imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            details: { type: 'apartment', furnished: 'full', petsAllowed: false, parking: true },
            rules: 'No smoking, no parties',
            amenities: ['WiFi', 'Gym', 'Pool'],
            minimumLease: 12,
            availableDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Cozy Suburban House',
            description: 'Family-friendly 3-bedroom house in a quiet neighborhood.',
            location: 'Suburban Area, North District',
            price: 3200,
            bedrooms: 3,
            bathrooms: 2,
            imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            details: { type: 'house', furnished: 'none', petsAllowed: true, parking: true },
            rules: 'Pet friendly, quiet hours 10PM-7AM',
            amenities: ['Backyard', 'Garage', 'Garden'],
            minimumLease: 12,
            availableDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        pagination: {
          total: 2,
          limit,
          offset,
          hasMore: false,
        },
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
