import { NextRequest, NextResponse } from 'next/server';
import { executeMutation, executeQuery } from '@/app/api/graphql/serverClient';
import type { CreateUserInput } from '@/types';
import { DEFAULT_AVATAR_URL } from '@/constants/images';

const CREATE_USER_MUTATION = `
  mutation CreateUser($user: real_estate_user_insert_input!) {
    insert_real_estate_user_one(object: $user) {
      uuid
      nhost_user_id
      display_name
      email
      auth_provider
      photo_url
    }
  }
`;

const CHECK_USER_BY_EMAIL = `
  query CheckUserByEmail($email: String!) {
    real_estate_user(where: { email: { _eq: $email } }, limit: 1) {
      uuid
      nhost_user_id
      email
      auth_provider
      photo_url
    }
  }
`;

const CHECK_USER_EXISTS = `
  query CheckUserExists($nhost_user_id: uuid!) {
    real_estate_user(where: { nhost_user_id: { _eq: $nhost_user_id } }, limit: 1) {
      uuid
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.HASURA_ENDPOINT || !process.env.HASURA_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 },
      );
    }

    const userData: CreateUserInput = await request.json();

    const requiredFields = ['nhost_user_id', 'display_name', 'email'] as const;
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Check if user already exists by nhost_user_id
    const existingById = await executeQuery(CHECK_USER_EXISTS, { nhost_user_id: userData.nhost_user_id });
    const typedExistingById = existingById as { real_estate_user?: Array<{ uuid: string }> };
    if (typedExistingById?.real_estate_user?.length) {
      return NextResponse.json(
        { error: 'User already exists with this Nhost user ID' },
        { status: 409 },
      );
    }

    // Check if user already exists by email
    const existingByEmail = await executeQuery(CHECK_USER_BY_EMAIL, { email: userData.email.toLowerCase() }).catch(() => null);
    const typedExistingByEmail = existingByEmail as {
      real_estate_user?: Array<{ uuid: string; nhost_user_id: string; email: string; auth_provider: string; photo_url?: string }>;
    };
    if (typedExistingByEmail?.real_estate_user?.length) {
      return NextResponse.json(
        { success: true, data: typedExistingByEmail.real_estate_user[0], message: 'User already exists by email.' },
        { status: 200 },
      );
    }

    const user = {
      nhost_user_id: userData.nhost_user_id,
      display_name: userData.display_name,
      email: userData.email.toLowerCase(),
      photo_url: userData.photo_url || DEFAULT_AVATAR_URL,
      auth_provider: userData.auth_provider || 'email',
    };

    const data = await executeMutation(CREATE_USER_MUTATION, { user });

    const typedData = data as {
      insert_real_estate_user_one: {
        uuid: string;
        nhost_user_id: string;
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
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
