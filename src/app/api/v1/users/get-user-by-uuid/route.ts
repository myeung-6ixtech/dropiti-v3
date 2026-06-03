import { NextResponse } from 'next/server';

/**
 * @deprecated Use GET /api/v1/users/get-user-by-id?nhost_user_id=<uuid> instead.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'Deprecated: use GET /api/v1/users/get-user-by-id?nhost_user_id=<uuid>',
    },
    { status: 410 },
  );
}
