import { NextResponse } from 'next/server';
import { PropertyService } from '../graphql/services/propertyService';
import { executeQuery } from '../graphql/serverClient';

export async function GET() {
  try {
    console.log('Testing Hasura connection...');
    
    // Test the getProperties method
    const result = await PropertyService.getProperties(5, 0);
    
    console.log('Hasura response:', JSON.stringify(result, null, 2));
    
    // Test user table query
    const userTestQuery = `
      query TestUsers {
        real_estate_user(limit: 10) {
          uuid
          firebase_uid
          display_name
          email
          created_at
        }
      }
    `;
    
    let userResult;
    try {
      userResult = await executeQuery(userTestQuery, {});
      console.log('User table test successful:', userResult);
    } catch (userError) {
      console.error('User table test failed:', userError);
      userResult = { error: userError instanceof Error ? userError.message : 'Unknown error' };
    }
    
    return NextResponse.json({
      success: true,
      message: 'Hasura connection successful',
      data: result,
      userTest: userResult,
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
