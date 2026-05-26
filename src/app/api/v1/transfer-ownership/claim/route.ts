import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeMutation } from '@/app/api/graphql/serverClient';

// ── GraphQL ───────────────────────────────────────────────────────────────────

const GET_INVITATION_FOR_CLAIM_QUERY = `
  query GetInvitationForClaim($tokenUuid: uuid!) {
    real_estate_property_transfer_invitation(
      where: { token_uuid: { _eq: $tokenUuid } }
      limit: 1
    ) {
      id
      property_uuid
      status
      expires_at
      claimed_by_user_id
    }
  }
`;

const TRANSFER_OWNERSHIP_MUTATION = `
  mutation TransferPropertyOwnership($propertyUuid: uuid!, $newOwnerId: uuid!) {
    update_real_estate_property_listing(
      where: { property_uuid: { _eq: $propertyUuid } }
      _set: { landlord_user_id: $newOwnerId }
    ) {
      affected_rows
      returning {
        property_uuid
        title
        landlord_user_id
      }
    }
  }
`;

const MARK_INVITATION_USED_MUTATION = `
  mutation MarkInvitationUsed($id: Int!, $userId: String!) {
    update_real_estate_property_transfer_invitation_by_pk(
      pk_columns: { id: $id }
      _set: {
        status: "used"
        used_at: "now()"
        claimed_by_user_id: $userId
      }
    ) {
      id
      status
      used_at
    }
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface InvitationRow {
  id: number;
  property_uuid: string;
  status: string;
  expires_at: string;
  claimed_by_user_id: string | null;
}

// ── Route ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/transfer-ownership/claim
 *
 * Transfers property ownership to the authenticated Nhost user.
 * The Nhost user ID is passed in the request body because this API layer
 * does not yet have a server-side Nhost session verification middleware.
 * In production, verify the JWT and extract the user ID server-side.
 *
 * Body: { token: string, userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, userId } = body as { token?: string; userId?: string };

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // ── 1. Look up the invitation ──────────────────────────────────────────
    const data = await executeQuery<{
      real_estate_property_transfer_invitation: InvitationRow[];
    }>(GET_INVITATION_FOR_CLAIM_QUERY, { tokenUuid: token });

    const invitation = data?.real_estate_property_transfer_invitation?.[0];

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found', code: 'INVITATION_INVALID' },
        { status: 404 }
      );
    }

    // ── 2. Guard against invalid states ───────────────────────────────────
    if (invitation.status === 'used') {
      return NextResponse.json(
        { error: 'This invitation has already been used', code: 'INVITATION_USED' },
        { status: 409 }
      );
    }

    if (invitation.status === 'cancelled') {
      return NextResponse.json(
        { error: 'This invitation has been cancelled', code: 'INVITATION_CANCELLED' },
        { status: 410 }
      );
    }

    if (
      invitation.status === 'expired' ||
      new Date(invitation.expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: 'This invitation has expired', code: 'INVITATION_EXPIRED' },
        { status: 410 }
      );
    }

    // ── 3. Transfer ownership ──────────────────────────────────────────────
    const transferData = await executeMutation<{
      update_real_estate_property_listing: {
        affected_rows: number;
        returning: Array<{ property_uuid: string; title: string }>;
      };
    }>(TRANSFER_OWNERSHIP_MUTATION, {
      propertyUuid: invitation.property_uuid,
      newOwnerId: userId,
    });

    if (!transferData?.update_real_estate_property_listing?.affected_rows) {
      throw new Error('Property ownership update returned 0 affected rows');
    }

    const updatedProperty =
      transferData.update_real_estate_property_listing.returning[0];

    // ── 4. Mark invitation as used ─────────────────────────────────────────
    await executeMutation(MARK_INVITATION_USED_MUTATION, {
      id: invitation.id,
      userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        propertyUuid: updatedProperty.property_uuid,
        propertyTitle: updatedProperty.title,
        claimedByUserId: userId,
      },
      message: 'Property successfully claimed. Welcome to Dropiti!',
    });
  } catch (error) {
    console.error('Transfer Ownership Claim API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to claim property ownership' },
      { status: 500 }
    );
  }
}
