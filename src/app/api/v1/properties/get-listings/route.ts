import { NextRequest, NextResponse } from 'next/server';
import { PropertyService } from '@/app/api/graphql/services/propertyService';
import { formatPropertyLocation } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  const location = searchParams.get('location');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const bedrooms = searchParams.get('bedrooms');
  const type = searchParams.get('type');
  const landlordFirebaseUid = searchParams.get('landlord_firebase_uid'); // Add landlord filter
  
  console.log('Get Listings API: Received request with search params:', {
    limit,
    offset,
    location,
    minPrice,
    maxPrice,
    bedrooms,
    type,
    landlordFirebaseUid
  });
  
  try {

    // Build filters object using PropertyService filter interface
    const filters: {
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      bedrooms?: number;
      type?: string;
      landlordFirebaseUid?: string; // Add landlord filter to filters
    } = {};
    
    if (location) {
      filters.location = location; // PropertyService will handle the _ilike mapping
      console.log('Get Listings API: Added location filter:', location);
    }
    
    if (minPrice) {
      filters.minPrice = parseFloat(minPrice);
      console.log('Get Listings API: Added minPrice filter:', filters.minPrice);
    }
    
    if (maxPrice) {
      filters.maxPrice = parseFloat(maxPrice);
      console.log('Get Listings API: Added maxPrice filter:', filters.maxPrice);
    }
    
    if (bedrooms) {
      filters.bedrooms = parseInt(bedrooms);
      console.log('Get Listings API: Added bedrooms filter:', filters.bedrooms);
    }
    
    if (type) {
      filters.type = type;
      console.log('Get Listings API: Added type filter:', filters.type);
    }

    if (landlordFirebaseUid) {
      filters.landlordFirebaseUid = landlordFirebaseUid; // Add landlord filter
      console.log('Get Listings API: Added landlord filter:', filters.landlordFirebaseUid);
    }

    console.log('Get Listings API: Built filters object:', filters);
    console.log('Get Listings API: Calling PropertyService.getProperties with:', { limit, offset, filters });

    // Get properties from PropertyService
    const data = await PropertyService.getProperties(limit, offset, filters);
    
    console.log('Get Listings API: PropertyService returned data:', data);
    console.log('Get Listings API: Data structure check - has properties:', !!data?.properties);
    console.log('Get Listings API: Data structure check - properties length:', data?.properties?.length || 0);
    
    // Check if data exists and has the expected structure
    if (!data || !data.properties) {
      console.error('Invalid data structure received from PropertyService:', data);
      return NextResponse.json(
        { error: 'Invalid data structure received from PropertyService' },
        { status: 500 }
      );
    }
    
    console.log('Total properties:', data.total);
    
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
        property_uuid: typedProperty.property_uuid || '', // Add property_uuid for UUID-based navigation
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
          parking: false, // You might want to add this field to your Hasura schema
        },
        rules: [], // You might want to add this field to your Hasura schema
        amenities: typedProperty.amenities || [],
        minimumLease: 12, // Default value, you might want to add this field
        availableDate: typedProperty.availability_date,
        createdAt: typedProperty.created_at || new Date().toISOString(),
        updatedAt: typedProperty.created_at || new Date().toISOString(), // Using created_at as fallback
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
