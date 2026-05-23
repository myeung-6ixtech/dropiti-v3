import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeMutation } from '@/app/api/graphql/serverClient';

// ── GraphQL ───────────────────────────────────────────────────────────────────

const GET_INVITATION_QUERY = `
  query GetInvitationByToken($tokenUuid: uuid!) {
    real_estate_property_transfer_invitation(
      where: { token_uuid: { _eq: $tokenUuid } }
      limit: 1
    ) {
      id
      token_uuid
      property_uuid
      external_contact
      status
      expires_at
      created_at
      used_at
      claimed_by_user_id
      property_listing {
        property_uuid
        title
        address
        rental_price
        rental_price_currency
        property_type
        num_bedroom
        num_bathroom
        display_image
      }
    }
  }
`;

const EXPIRE_INVITATION_MUTATION = `
  mutation ExpireInvitation($id: Int!) {
    update_real_estate_property_transfer_invitation_by_pk(
      pk_columns: { id: $id }
      _set: { status: "expired" }
    ) {
      id
      status
    }
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────

export type InvitationStatus = 'valid' | 'expired' | 'used' | 'cancelled' | 'invalid';

interface PropertyListing {
  property_uuid: string;
  title: string;
  address: unknown;
  rental_price: number;
  rental_price_currency: string;
  property_type: string;
  num_bedroom: number;
  num_bathroom: number;
  display_image: string | null;
}

interface InvitationRow {
  id: number;
  token_uuid: string;
  property_uuid: string;
  external_contact: string;
  status: string;
  expires_at: string;
  created_at: string;
  used_at: string | null;
  claimed_by_user_id: string | null;
  property_listing: PropertyListing | null;
}

function extractLocation(address: unknown): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') {
    const a = address as Record<string, string | undefined>;
    return [a.buildingName, a.addressLine1, a.district, a.state, a.country]
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

// ── Route ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/transfer-ownership/validate?token=<token_uuid>
 *
 * Public endpoint — no authentication required.
 * Performs a live expiry check and auto-marks overdue tokens as expired.
 *
 * Returns:
 *   { status: InvitationStatus, property?: {...}, expiresAt?: string }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    // ── 1. Look up the invitation ──────────────────────────────────────────
    const data = await executeQuery<{
      real_estate_property_transfer_invitation: InvitationRow[];
    }>(GET_INVITATION_QUERY, { tokenUuid: token });

    const invitation = data?.real_estate_property_transfer_invitation?.[0];

    if (!invitation) {
      return NextResponse.json({
        success: true,
        status: 'invalid' as InvitationStatus,
        property: null,
        expiresAt: null,
      });
    }

    // ── 2. Resolve status ──────────────────────────────────────────────────
    let resolvedStatus = invitation.status as InvitationStatus;

    // Live expiry check: if DB says pending but expires_at has passed, expire it
    if (
      invitation.status === 'pending' &&
      new Date(invitation.expires_at) < new Date()
    ) {
      resolvedStatus = 'expired';
      // Persist the state change asynchronously — don't block the response
      executeMutation(EXPIRE_INVITATION_MUTATION, { id: invitation.id }).catch(
        (err) => console.error('Failed to persist expired status:', err)
      );
    }

    // ── 3. Build property shape for client ─────────────────────────────────
    const prop = invitation.property_listing;
    const property = prop
      ? {
          propertyUuid: prop.property_uuid,
          title: prop.title,
          location: extractLocation(prop.address),
          rentalPrice: prop.rental_price,
          rentalPriceCurrency: prop.rental_price_currency,
          propertyType: prop.property_type,
          bedrooms: prop.num_bedroom,
          bathrooms: prop.num_bathroom,
          imageUrl: prop.display_image ?? null,
        }
      : null;

    return NextResponse.json({
      success: true,
      status: resolvedStatus,
      property,
      expiresAt: invitation.expires_at,
      tokenUuid: invitation.token_uuid,
    });
  } catch (error) {
    console.error('Transfer Ownership Validate API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}
