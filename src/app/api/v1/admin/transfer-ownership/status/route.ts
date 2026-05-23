import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

// ── GraphQL ───────────────────────────────────────────────────────────────────

const GET_INVITATION_STATUS_QUERY = `
  query GetInvitationStatus($propertyUuid: uuid!) {
    real_estate_property_transfer_invitation(
      where: { property_uuid: { _eq: $propertyUuid } }
      order_by: { created_at: desc }
      limit: 1
    ) {
      id
      token_uuid
      status
      expires_at
      created_at
      used_at
      resend_count
      claimed_by_user_id
      external_contact
    }
  }
`;

// ── Route ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/transfer-ownership/status?propertyUuid=<uuid>
 *
 * Returns the latest invitation state for a given property so the
 * admin UI can render the correct badge / button.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyUuid = searchParams.get('propertyUuid');

    if (!propertyUuid) {
      return NextResponse.json({ error: 'propertyUuid is required' }, { status: 400 });
    }

    const data = await executeQuery<{
      real_estate_property_transfer_invitation: Array<{
        id: number;
        token_uuid: string;
        status: string;
        expires_at: string;
        created_at: string;
        used_at: string | null;
        resend_count: number;
        claimed_by_user_id: string | null;
        external_contact: string;
      }>;
    }>(GET_INVITATION_STATUS_QUERY, { propertyUuid });

    const latest = data?.real_estate_property_transfer_invitation?.[0];

    if (!latest) {
      return NextResponse.json({
        success: true,
        data: null,
        hasInvitation: false,
      });
    }

    // Live expiry resolution
    const isLiveExpired =
      latest.status === 'pending' && new Date(latest.expires_at) < new Date();
    const resolvedStatus = isLiveExpired ? 'expired' : latest.status;

    // Days remaining helper
    const now = Date.now();
    const expiresMs = new Date(latest.expires_at).getTime();
    const daysRemaining = Math.max(
      0,
      Math.ceil((expiresMs - now) / (1000 * 60 * 60 * 24))
    );

    // Hours since creation (for "too fresh to resend" guard)
    const createdMs = new Date(latest.created_at).getTime();
    const hoursSinceSent = Math.floor((now - createdMs) / (1000 * 60 * 60));

    return NextResponse.json({
      success: true,
      hasInvitation: true,
      data: {
        invitationId: latest.id,
        tokenUuid: latest.token_uuid,
        status: resolvedStatus,
        expiresAt: latest.expires_at,
        createdAt: latest.created_at,
        usedAt: latest.used_at,
        resendCount: latest.resend_count,
        claimedByUserId: latest.claimed_by_user_id,
        externalContact: latest.external_contact,
        daysRemaining: resolvedStatus === 'pending' ? daysRemaining : 0,
        hoursSinceSent,
        canResend:
          resolvedStatus === 'expired' ||
          (resolvedStatus === 'pending' && hoursSinceSent >= 24),
      },
    });
  } catch (error) {
    console.error('Transfer Ownership Status API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation status' },
      { status: 500 }
    );
  }
}
