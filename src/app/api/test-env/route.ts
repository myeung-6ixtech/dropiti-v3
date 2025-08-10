import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasuraEndpoint: process.env.HASURA_ENDPOINT ? 'Set' : 'Not Set',
    hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET ? 'Set' : 'Not Set',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
