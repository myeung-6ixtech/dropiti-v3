import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeMutation } from '@/app/api/graphql/serverClient';
import { sendOwnershipInvitation, INVITATION_EXPIRY_DAYS } from '@/lib/whatsappService';

// ── GraphQL ───────────────────────────────────────────────────────────────────

const GET_PROPERTY_QUERY = `
  query GetPropertyForInvite($propertyUuid: uuid!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $propertyUuid } }, limit: 1) {
      property_uuid
      title
      address
      landlord_user_id
      external_contact
    }
  }
`;

const CANCEL_PENDING_INVITATIONS_MUTATION = `
  mutation CancelPendingInvitations($propertyUuid: uuid!, $externalContact: String!) {
    update_real_estate_property_transfer_invitation(
      where: {
        property_uuid: { _eq: $propertyUuid }
        external_contact: { _eq: $externalContact }
        status: { _eq: "pending" }
      }
      _set: { status: "cancelled" }
    ) {
      affected_rows
    }
  }
`;

const INSERT_INVITATION_MUTATION = `
  mutation InsertInvitation($invitation: real_estate_property_transfer_invitation_insert_input!) {
    insert_real_estate_property_transfer_invitation_one(object: $invitation) {
      id
      token_uuid
      expires_at
      created_at
    }
  }
`;

const UPDATE_MESSAGE_ID_MUTATION = `
  mutation UpdateInvitationMessageId($id: Int!, $messageId: String!) {
    update_real_estate_property_transfer_invitation_by_pk(
      pk_columns: { id: $id }
      _set: { whatsapp_message_id: $messageId }
    ) {
      id
    }
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface PropertyRow {
  property_uuid: string;
  title: string;
  address: unknown;
  landlord_user_id: string;
  external_contact: string | null;
}

interface InvitationRow {
  id: number;
  token_uuid: string;
  expires_at: string;
  created_at: string;
}

// ── Helper ────────────────────────────────────────────────────────────────────

/** Extract a simple location string from the address field. */
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
 * POST /api/v1/admin/transfer-ownership/invite
 *
 * Creates a time-limited ownership invitation, then dispatches a WhatsApp
 * message to the property's external_contact (or an override number).
 *
 * Body: { propertyUuid: string, externalContact?: string, offerId?: string }
 *
 * Admin-only: in production, add a session / role check here.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyUuid, externalContact: overrideContact, offerId } = body as {
      propertyUuid?: string;
      externalContact?: string;
      offerId?: string;
    };

    if (!propertyUuid) {
      return NextResponse.json({ error: 'propertyUuid is required' }, { status: 400 });
    }

    // ── 1. Fetch property details ───────────────────────────────────────────
    const propertyData = await executeQuery<{
      real_estate_property_listing: PropertyRow[];
    }>(GET_PROPERTY_QUERY, { propertyUuid });

    const property = propertyData?.real_estate_property_listing?.[0];
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const phoneTarget = overrideContact ?? property.external_contact;
    if (!phoneTarget) {
      return NextResponse.json(
        { error: 'No external_contact set for this property and none provided in request' },
        { status: 422 }
      );
    }

    const adminId = request.headers.get('x-admin-user-id') ?? 'system';

    // ── 2. Cancel any existing pending invitations for this property+contact ─
    await executeMutation(CANCEL_PENDING_INVITATIONS_MUTATION, {
      propertyUuid,
      externalContact: phoneTarget,
    });

    // ── 3. Insert a new invitation record ──────────────────────────────────
    const insertData = await executeMutation<{
      insert_real_estate_property_transfer_invitation_one: InvitationRow;
    }>(INSERT_INVITATION_MUTATION, {
      invitation: {
        property_uuid: propertyUuid,
        external_contact: phoneTarget,
        sent_by_admin_id: adminId,
        offer_id: offerId ?? null,
        status: 'pending',
      },
    });

    const invitation =
      insertData?.insert_real_estate_property_transfer_invitation_one;
    if (!invitation) {
      throw new Error('Failed to create invitation record');
    }

    // ── 4. Build invitation URL ────────────────────────────────────────────
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://dropiti.com';
    const invitationUrl = `${appUrl}/transfer-ownership/${invitation.token_uuid}`;

    // ── 5. Send WhatsApp message ───────────────────────────────────────────
    const waResult = await sendOwnershipInvitation(phoneTarget, {
      propertyTitle: property.title,
      invitationUrl,
      expiryDays: INVITATION_EXPIRY_DAYS,
    });

    if (!waResult.success) {
      console.error('WhatsApp send failed:', waResult.error);
      // Non-fatal: the invitation row is created; admin can resend
    }

    // ── 6. Persist WhatsApp message ID ────────────────────────────────────
    if (waResult.messageId) {
      await executeMutation(UPDATE_MESSAGE_ID_MUTATION, {
        id: invitation.id,
        messageId: waResult.messageId,
      }).catch((err) =>
        console.error('Failed to persist whatsapp_message_id:', err)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        invitationId: invitation.id,
        tokenUuid: invitation.token_uuid,
        invitationUrl,
        expiresAt: invitation.expires_at,
        whatsappSent: waResult.success,
        whatsappError: waResult.error ?? null,
        location: extractLocation(property.address),
      },
      message: waResult.success
        ? 'Invitation created and WhatsApp message sent'
        : 'Invitation created but WhatsApp message failed — use resend to retry',
    });
  } catch (error) {
    console.error('Transfer Ownership Invite API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to create ownership invitation' },
      { status: 500 }
    );
  }
}
