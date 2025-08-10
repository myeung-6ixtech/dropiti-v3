import { NextResponse } from 'next/server';
import { PropertyService } from '../graphql/services/propertyService';

export async function GET() {
  try {
    console.log('Testing Hasura connection...');
    
    // Test the getProperties method
    const result = await PropertyService.getProperties(5, 0);
    
    console.log('Hasura response:', JSON.stringify(result, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Hasura connection successful',
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hasura test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
