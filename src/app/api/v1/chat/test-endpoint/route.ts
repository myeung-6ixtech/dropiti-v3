import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== TEST ENDPOINT CALLED ===');
    console.log('Environment variables check:');
    console.log('HASURA_ENDPOINT:', process.env.HASURA_ENDPOINT ? 'SET' : 'NOT SET');
    console.log('HASURA_ADMIN_SECRET:', process.env.HASURA_ADMIN_SECRET ? 'SET' : 'NOT SET');
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      env: {
        hasuraEndpoint: process.env.HASURA_ENDPOINT ? 'SET' : 'NOT SET',
        hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test endpoint failed' },
      { status: 500 }
    );
  }
}
