import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeMutation } from '@/app/api/graphql/serverClient';
import { sendOwnershipInvitation, INVITATION_EXPIRY_DAYS } from '@/lib/whatsappService';

// ── GraphQL ───────────────────────────────────────────────────────────────────

const GET_PROPERTY_FOR_RESEND_QUERY = `
  query GetPropertyForResend($propertyUuid: uuid!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $propertyUuid } }, limit: 1) {
      property_uuid
      title
      external_contact
    }
  }
`;

const GET_LATEST_INVITATION_QUERY = `
  query GetLatestInvitation($propertyUuid: uuid!, $externalContact: String!) {
    real_estate_property_transfer_invitation(
      where: {
        property_uuid: { _eq: $propertyUuid }
        external_contact: { _eq: $externalContact }
      }
      order_by: { created_at: desc }
      limit: 1
    ) {
      id
      resend_count
      status
    }
  }
`;

const CANCEL_PENDING_INVITATIONS_MUTATION = `
  mutation CancelForResend($propertyUuid: uuid!, $externalContact: String!) {
    update_real_estate_property_transfer_invitation(
      where: {
        property_uuid: { _eq: $propertyUuid }
        external_contact: { _eq: $externalContact }
        status: { _in: ["pending", "expired"] }
      }
      _set: { status: "cancelled" }
    ) {
      affected_rows
    }
  }
`;

const INSERT_RESEND_INVITATION_MUTATION = `
  mutation InsertResendInvitation($invitation: real_estate_property_transfer_invitation_insert_input!) {
    insert_real_estate_property_transfer_invitation_one(object: $invitation) {
      id
      token_uuid
      expires_at
      created_at
    }
  }
`;

const UPDATE_MESSAGE_ID_MUTATION = `
  mutation UpdateResendMessageId($id: Int!, $messageId: String!) {
    update_real_estate_property_transfer_invitation_by_pk(
      pk_columns: { id: $id }
      _set: { whatsapp_message_id: $messageId }
    ) {
      id
    }
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface InvitationRow {
  id: number;
  token_uuid: string;
  expires_at: string;
  created_at: string;
}

interface PreviousInvitation {
  id: number;
  resend_count: number;
  status: string;
}

// ── Route ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/admin/transfer-ownership/resend
 *
 * Cancels all existing pending/expired invitations for the given
 * property + contact pair, creates a fresh invitation with a new
 * 7-day window, and resends the WhatsApp message.
 *
 * Body: { propertyUuid: string, externalContact?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyUuid, externalContact: overrideContact } = body as {
      propertyUuid?: string;
      externalContact?: string;
    };

    if (!propertyUuid) {
      return NextResponse.json({ error: 'propertyUuid is required' }, { status: 400 });
    }

    // ── 1. Fetch property ──────────────────────────────────────────────────
    const propertyData = await executeQuery<{
      real_estate_property_listing: Array<{
        property_uuid: string;
        title: string;
        external_contact: string | null;
      }>;
    }>(GET_PROPERTY_FOR_RESEND_QUERY, { propertyUuid });

    const property = propertyData?.real_estate_property_listing?.[0];
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const phoneTarget = overrideContact ?? property.external_contact;
    if (!phoneTarget) {
      return NextResponse.json(
        { error: 'No external_contact set for this property' },
        { status: 422 }
      );
    }

    // ── 2. Determine cumulative resend count ───────────────────────────────
    const prevData = await executeQuery<{
      real_estate_property_transfer_invitation: PreviousInvitation[];
    }>(GET_LATEST_INVITATION_QUERY, { propertyUuid, externalContact: phoneTarget });

    const prev = prevData?.real_estate_property_transfer_invitation?.[0];
    const newResendCount = prev ? prev.resend_count + 1 : 0;

    const adminId = request.headers.get('x-admin-user-id') ?? 'system';

    // ── 3. Cancel existing invitations ────────────────────────────────────
    await executeMutation(CANCEL_PENDING_INVITATIONS_MUTATION, {
      propertyUuid,
      externalContact: phoneTarget,
    });

    // ── 4. Insert fresh invitation ─────────────────────────────────────────
    const insertData = await executeMutation<{
      insert_real_estate_property_transfer_invitation_one: InvitationRow;
    }>(INSERT_RESEND_INVITATION_MUTATION, {
      invitation: {
        property_uuid: propertyUuid,
        external_contact: phoneTarget,
        sent_by_admin_id: adminId,
        status: 'pending',
        resend_count: newResendCount,
      },
    });

    const invitation =
      insertData?.insert_real_estate_property_transfer_invitation_one;
    if (!invitation) {
      throw new Error('Failed to create resend invitation record');
    }

    // ── 5. Build invitation URL + send ────────────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dropiti.com';
    const invitationUrl = `${appUrl}/transfer-ownership/${invitation.token_uuid}`;

    const waResult = await sendOwnershipInvitation(phoneTarget, {
      propertyTitle: property.title,
      invitationUrl,
      expiryDays: INVITATION_EXPIRY_DAYS,
    });

    if (waResult.messageId) {
      await executeMutation(UPDATE_MESSAGE_ID_MUTATION, {
        id: invitation.id,
        messageId: waResult.messageId,
      }).catch((err) => console.error('Failed to persist whatsapp_message_id:', err));
    }

    return NextResponse.json({
      success: true,
      data: {
        invitationId: invitation.id,
        tokenUuid: invitation.token_uuid,
        invitationUrl,
        expiresAt: invitation.expires_at,
        resendCount: newResendCount,
        whatsappSent: waResult.success,
        whatsappError: waResult.error ?? null,
      },
      message: waResult.success
        ? 'Invitation resent successfully'
        : 'New invitation created but WhatsApp send failed',
    });
  } catch (error) {
    console.error('Transfer Ownership Resend API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to resend ownership invitation' },
      { status: 500 }
    );
  }
}
