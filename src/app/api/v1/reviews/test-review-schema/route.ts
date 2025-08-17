import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const TEST_REVIEW_SCHEMA_QUERY = `
  query TestReviewSchema {
    __schema {
      types {
        name
        kind
        fields {
          name
          type {
            name
            kind
          }
        }
      }
    }
  }
`;

const TEST_REVIEW_TABLE_QUERY = `
  query TestReviewTable {
    real_estate_review(limit: 1) {
      id
      review_uuid
      offer_uuid
      review_type
      rating
      comment
      reviewer_firebase_uid
      reviewed_user_firebase_uid
      property_uuid
      is_public
      is_verified
      helpful_count
      created_at
      updated_at
    }
  }
`;

export async function GET() {
  try {
    console.log('Test Review Schema API: Starting schema test...');

    // Test 1: Check if we can query the review table
    console.log('Test Review Schema API: Testing basic table query...');
    try {
      const tableResult = await executeQuery(TEST_REVIEW_TABLE_QUERY);
      console.log('Test Review Schema API: Table query successful:', tableResult);
    } catch (tableError) {
      console.error('Test Review Schema API: Table query failed:', tableError);
      return NextResponse.json({
        success: false,
        error: 'Table query failed',
        details: tableError instanceof Error ? tableError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Test 2: Check GraphQL schema introspection
    console.log('Test Review Schema API: Testing schema introspection...');
    try {
      const schemaResult = await executeQuery(TEST_REVIEW_SCHEMA_QUERY) as {
        __schema: {
          types: Array<{ name?: string; kind?: string; fields?: Array<{ name?: string; type?: { name?: string; kind?: string } }> }>;
        };
      };
      console.log('Test Review Schema API: Schema introspection successful');
      
      // Look for review-related types
      const reviewTypes = schemaResult.__schema.types.filter((type) => 
        type.name && type.name.toLowerCase().includes('review')
      );
      
      console.log('Test Review Schema API: Found review types:', reviewTypes.map((t) => t.name || ''));
      
      return NextResponse.json({
        success: true,
        message: 'Schema test completed successfully',
        tableQuery: 'Success',
        schemaIntrospection: 'Success',
        reviewTypes: reviewTypes.map((t) => t.name || '')
      });
      
    } catch (schemaError) {
      console.error('Test Review Schema API: Schema introspection failed:', schemaError);
      return NextResponse.json({
        success: false,
        error: 'Schema introspection failed',
        details: schemaError instanceof Error ? schemaError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test Review Schema API: Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
