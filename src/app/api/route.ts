import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Dropiti API v1.0',
    version: '1.0.0',
    endpoints: {
      graphql: '/api/graphql',
      v1: {
        properties: {
          'get-listings': '/api/v1/properties/get-listings',
          'get-property': '/api/v1/properties/get-property',
          'create-property': '/api/v1/properties/create-property',
          'update-property': '/api/v1/properties/update-property',
        },
        offers: {
          'get-offers': '/api/v1/offers/get-offers',
          'create-offer': '/api/v1/offers/create-offer',
        },
      },
    },
    documentation: '/documentation/guides/api-structure.md',
  });
}
