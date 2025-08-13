import { NextResponse } from 'next/server';
import { PropertyService } from '@/app/api/graphql/services/propertyService';

export async function GET() {
  try {
    console.log('Test Hasura: Starting database content test...');
    
    // Test the PropertyService to see what's in the database
    const dbContent = await PropertyService.testDatabaseContent();
    
    console.log('Test Hasura: Database content test completed');
    
    // Test the search functionality specifically
    console.log('Test Hasura: Testing search functionality...');
    
    // Test search for "Hong Kong"
    const searchTest = await PropertyService.getProperties(10, 0, { location: 'Hong Kong' });
    console.log('Test Hasura: Search test for "Hong Kong":', searchTest);
    
    // Test search for "Wan Chai"
    const searchTest2 = await PropertyService.getProperties(10, 0, { location: 'Wan Chai' });
    console.log('Test Hasura: Search test for "Wan Chai":', searchTest2);
    
    // Test search for "Whampoa" (should work since it's in title)
    const searchTest3 = await PropertyService.getProperties(10, 0, { location: 'Whampoa' });
    console.log('Test Hasura: Search test for "Whampoa":', searchTest3);
    
    // Check the address field format specifically
    console.log('Test Hasura: Checking address field format...');
    if (dbContent && typeof dbContent === 'object' && 'real_estate_property_listing' in dbContent) {
      const properties = (dbContent as { real_estate_property_listing?: Array<{ address?: unknown }> }).real_estate_property_listing || [];
      if (properties.length > 0) {
        const firstProperty = properties[0];
        console.log('Test Hasura: First property address field type:', typeof firstProperty.address);
        console.log('Test Hasura: First property address field value:', firstProperty.address);
        
        if (typeof firstProperty.address === 'string') {
          try {
            const parsedAddress = JSON.parse(firstProperty.address);
            console.log('Test Hasura: Parsed address (JSON string):', parsedAddress);
            console.log('Test Hasura: Address is stored as JSON string - this is the problem!');
          } catch {
            console.log('Test Hasura: Address is a plain string, not JSON');
          }
        } else if (typeof firstProperty.address === 'object') {
          console.log('Test Hasura: Address is stored as JSON object - this is correct!');
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database content and search tests completed',
      databaseContent: dbContent,
      searchTestHongKong: searchTest,
      searchTestWanChai: searchTest2,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test Hasura: Error testing database content:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
