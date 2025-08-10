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
  
  try {

    // Build filters object using PropertyService filter interface
    const filters: any = {};
    
    if (location) {
      filters.location = location; // PropertyService will handle the _ilike mapping
    }
    
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

    // Use PropertyService instead of direct GraphQL query
    const data = await PropertyService.getProperties(limit, offset, Object.keys(filters).length > 0 ? filters : undefined);
    // Check if data exists and has the expected structure
    if (!data || !data.real_estate_property_listing) {
      console.error('Invalid data structure received:', data);
      return NextResponse.json(
        { error: 'Invalid data structure received from GraphQL' },
        { status: 500 }
      );
    }
    
    console.log('Total properties:', data.real_estate_property_listing_aggregate?.aggregate?.count);
    
    // Transform the data to match your frontend expectations
    const transformedProperties = data.real_estate_property_listing.map((property: any) => ({
      id: property.id,
      title: property.title,
      description: property.description,
      location: formatPropertyLocation(property.address),
      price: property.rental_price || 0,
      bedrooms: property.num_bedroom || 0,
      bathrooms: property.num_bathroom || 0,
      imageUrl: property.display_image || property.uploaded_images?.[0] || '',
      details: {
        type: property.property_type,
        furnished: property.furnished,
        petsAllowed: property.pets_allowed,
        parking: false, // You might want to add this field to your Hasura schema
      },
      rules: [], // You might want to add this field to your Hasura schema
      amenities: property.amenities || [],
      minimumLease: 12, // Default value, you might want to add this field
      availableDate: property.availability_date,
      createdAt: property.created_at,
      updatedAt: property.created_at, // Using created_at as fallback
    }));
    
    return NextResponse.json({
      success: true,
      data: transformedProperties,
      pagination: {
        total: data.real_estate_property_listing_aggregate?.aggregate?.count || 0,
        limit,
        offset,
        hasMore: offset + limit < (data.real_estate_property_listing_aggregate?.aggregate?.count || 0),
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
