import { NextRequest, NextResponse } from 'next/server';
import { executeMutation, executeQuery } from '@/app/api/graphql/serverClient';
import type { CreateUserInput } from '@/types';

const CREATE_USER_MUTATION = `
  mutation CreateUser($user: real_estate_user_insert_input!) {
    insert_real_estate_user_one(object: $user) {
      uuid
      firebase_uid
      display_name
      email
      auth_provider
      photo_url
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    console.log('Environment check:');
    console.log('HASURA_ENDPOINT:', process.env.HASURA_ENDPOINT ? '✅ Set' : '❌ Missing');
    console.log('HASURA_ADMIN_SECRET:', process.env.HASURA_ADMIN_SECRET ? '✅ Set' : '❌ Missing');
    
    if (!process.env.HASURA_ENDPOINT || !process.env.HASURA_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const userData: CreateUserInput = await request.json();

    // Validate required fields
    const requiredFields = ['firebase_uid', 'display_name', 'email'] as const;
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const CHECK_USER_EXISTS = `
      query CheckUserExists($firebase_uid: String!) {
        real_estate_user(where: { firebase_uid: { _eq: $firebase_uid } }, limit: 1) {
          uuid
        }
      }
    `;

    const existingUser = await executeQuery(CHECK_USER_EXISTS, { firebase_uid: userData.firebase_uid });
    
    // Type assertion for the response data
    const typedExistingUser = existingUser as {
      real_estate_user?: Array<{ uuid: string }>;
    };
    
    if (typedExistingUser?.real_estate_user && typedExistingUser.real_estate_user.length > 0) {
      return NextResponse.json(
        { error: 'User already exists with this Firebase UID' },
        { status: 409 }
      );
    }

    // Prepare the user object for Hasura
    const user = {
      firebase_uid: userData.firebase_uid,
      display_name: userData.display_name,
      email: userData.email,
      photo_url: userData.photo_url || '/src/assets/img/Portrait_Placeholder.png', // Set default profile photo
      auth_provider: userData.auth_provider || 'firebase',
      // Only include fields that are guaranteed to exist in the database
      // Remove fields that might not exist or cause parsing errors
    };

    console.log('Creating user with data:', JSON.stringify(user, null, 2));

    let data;
    try {
      console.log('Executing GraphQL mutation...');
      data = await executeMutation(CREATE_USER_MUTATION, { user });
      console.log('GraphQL mutation successful, response:', JSON.stringify(data, null, 2));
    } catch (mutationError) {
      console.error('GraphQL mutation failed:', mutationError);
      throw mutationError;
    }

    // Type assertion for the response data
    const typedData = data as {
      insert_real_estate_user_one: {
        uuid: string;
        firebase_uid: string;
        display_name: string;
        email: string;
        auth_provider: string;
        photo_url: string;
      };
    };

    if (!typedData.insert_real_estate_user_one) {
      throw new Error('Failed to create user');
    }

    return NextResponse.json({
      success: true,
      data: typedData.insert_real_estate_user_one,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check if it's a GraphQL error
    if (error && typeof error === 'object' && 'graphqlErrors' in error) {
      console.error('GraphQL errors:', (error as Record<string, unknown>).graphqlErrors);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
