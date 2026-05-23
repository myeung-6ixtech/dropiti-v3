import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';
import { toClientPaymentFrequency } from '@/lib/payment-frequency';

// ── GraphQL ───────────────────────────────────────────────────────────────────

const ADMIN_INCOMING_OFFERS_QUERY = `
  query AdminIncomingOffers(
    $where: real_estate_offer_bool_exp!
    $limit: Int!
    $offset: Int!
  ) {
    real_estate_offer(
      where: $where
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      offer_key
      offer_uuid
      property_uuid
      initiator_user_id
      recipient_user_id
      proposing_rent_price
      proposing_rent_price_currency
      num_leasing_months
      payment_frequency
      move_in_date
      offer_status
      is_active
      created_at
      updated_at
      negotiation_round
      last_action_by
      last_action_type
      last_action_at
    }
    real_estate_offer_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

const GET_USER_QUERY = `
  query GetUserForAdmin($nhostUserId: uuid!) {
    real_estate_user(where: { nhost_user_id: { _eq: $nhostUserId } }, limit: 1) {
      uuid
      display_name
      email
      photo_url
    }
  }
`;

const GET_PROPERTY_QUERY = `
  query GetPropertyForAdmin($propertyUuid: uuid!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $propertyUuid } }, limit: 1) {
      id
      property_uuid
      title
      address
      rental_price
      rental_price_currency
      property_type
      num_bedroom
      num_bathroom
      display_image
      external_contact
      landlord_firebase_uid
    }
  }
`;

const PLATFORM_LANDLORD_IDS_QUERY = `
  query GetAdminUserIds {
    real_estate_user(where: { is_platform_admin: { _eq: true } }) {
      nhost_user_id
    }
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface GraphQLOffer {
  id: string;
  offer_key: string;
  offer_uuid?: string;
  property_uuid: string;
  initiator_user_id: string;
  recipient_user_id: string;
  proposing_rent_price: number;
  proposing_rent_price_currency: string;
  num_leasing_months: number;
  payment_frequency: string;
  move_in_date: string;
  offer_status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  negotiation_round?: number;
  last_action_by?: string;
  last_action_type?: string;
  last_action_at?: string;
}

interface GraphQLUser {
  uuid: string;
  display_name: string;
  email: string;
  photo_url: string | null;
}

interface GraphQLProperty {
  id: string;
  property_uuid: string;
  title: string;
  address: unknown;
  rental_price: number;
  rental_price_currency: string;
  property_type: string;
  num_bedroom: number;
  num_bathroom: number;
  display_image: string | null;
  external_contact: string | null;
  landlord_firebase_uid: string;
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
 * GET /api/v1/admin/offers/incoming
 *
 * Returns all offers on admin-managed listings.
 * Admin-managed = recipient is one of the platform landlord user IDs
 * (stored in DROPITI_PLATFORM_LANDLORD_USER_IDS env var, comma-separated).
 *
 * Query params:
 *   propertyUuid? — filter to single listing
 *   status?       — filter by offer_status
 *   limit?        — page size (default 50)
 *   offset?       — pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyUuid = searchParams.get('propertyUuid');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    // ── 1. Resolve admin / platform landlord user IDs ──────────────────
    // Primary: env var (comma-separated Nhost user IDs for platform-admin landlords)
    const envIds = (process.env.DROPITI_PLATFORM_LANDLORD_USER_IDS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Fallback: query users with is_platform_admin flag (if that column exists)
    let adminUserIds = envIds;
    if (adminUserIds.length === 0) {
      try {
        const adminData = await executeQuery<{
          real_estate_user: Array<{ nhost_user_id: string }>;
        }>(PLATFORM_LANDLORD_IDS_QUERY);
        adminUserIds = (adminData?.real_estate_user ?? []).map((u) => u.nhost_user_id);
      } catch {
        // Column may not exist yet — log and continue with empty result
        console.warn('AdminIncomingOffers: Could not resolve admin user IDs');
      }
    }

    if (adminUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: 'No admin user IDs configured',
      });
    }

    // ── 2. Build where clause ──────────────────────────────────────────
    const where: Record<string, unknown> = {
      recipient_user_id: { _in: adminUserIds },
      is_active: { _eq: true },
    };
    if (propertyUuid) where.property_uuid = { _eq: propertyUuid };
    if (status) where.offer_status = { _eq: status };

    // ── 3. Fetch offers ────────────────────────────────────────────────
    const data = await executeQuery<{
      real_estate_offer: GraphQLOffer[];
      real_estate_offer_aggregate: { aggregate: { count: number } };
    }>(ADMIN_INCOMING_OFFERS_QUERY, { where, limit, offset });

    const offers = data?.real_estate_offer ?? [];
    const total = data?.real_estate_offer_aggregate?.aggregate?.count ?? 0;

    if (offers.length === 0) {
      return NextResponse.json({ success: true, data: [], total, message: 'No offers found' });
    }

    // ── 4. Enrich with user + property details ─────────────────────────
    const uniqueUserIds = [...new Set(offers.map((o) => o.initiator_user_id))];
    const uniquePropUuids = [...new Set(offers.map((o) => o.property_uuid))];

    const userDetails: Record<string, GraphQLUser> = {};
    for (const userId of uniqueUserIds) {
      try {
        const ud = await executeQuery<{ real_estate_user: GraphQLUser[] }>(
          GET_USER_QUERY, { nhostUserId: userId }
        );
        if (ud?.real_estate_user?.[0]) userDetails[userId] = ud.real_estate_user[0];
      } catch {
        console.warn(`AdminIncomingOffers: Failed to fetch user ${userId}`);
      }
    }

    const propertyDetails: Record<string, GraphQLProperty> = {};
    for (const propUuid of uniquePropUuids) {
      try {
        const pd = await executeQuery<{ real_estate_property_listing: GraphQLProperty[] }>(
          GET_PROPERTY_QUERY, { propertyUuid: propUuid }
        );
        if (pd?.real_estate_property_listing?.[0]) {
          propertyDetails[propUuid] = pd.real_estate_property_listing[0];
        }
      } catch {
        console.warn(`AdminIncomingOffers: Failed to fetch property ${propUuid}`);
      }
    }

    // ── 5. Transform ────────────────────────────────────────────────────
    const transformed = offers.map((offer) => {
      const initiator = userDetails[offer.initiator_user_id];
      const prop = propertyDetails[offer.property_uuid];

      return {
        id: offer.id,
        offerKey: offer.offer_key,
        propertyUuid: offer.property_uuid,
        initiatorUserId: offer.initiator_user_id,
        recipientUserId: offer.recipient_user_id,
        proposingRentPrice: offer.proposing_rent_price,
        proposingRentPriceCurrency: offer.proposing_rent_price_currency,
        numLeasingMonths: offer.num_leasing_months,
        paymentFrequency:
          toClientPaymentFrequency(offer.payment_frequency) ?? offer.payment_frequency,
        moveInDate: offer.move_in_date,
        offerStatus: offer.offer_status,
        isActive: offer.is_active,
        createdAt: offer.created_at,
        updatedAt: offer.updated_at,
        negotiationRound: offer.negotiation_round ?? 0,
        lastActionBy: offer.last_action_by as 'initiator' | 'recipient',
        lastActionAt: offer.last_action_at ?? offer.created_at,
        lastActionType: offer.last_action_type,
        // Tenant (initiator)
        initiator: initiator
          ? {
              uuid: initiator.uuid,
              displayName: initiator.display_name,
              email: initiator.email,
              photoUrl: initiator.photo_url ?? undefined,
            }
          : null,
        // Property + external contact
        property: prop
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
          : null,
        // Admin-specific field
        externalContact: prop?.external_contact ?? undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformed,
      total,
      message: 'Admin offers fetched successfully',
    });
  } catch (error) {
    console.error('Admin Incoming Offers API: Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin offers' }, { status: 500 });
  }
}
