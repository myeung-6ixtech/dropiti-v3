import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';
import { formatPropertyLocation } from '@/lib/utils';

/** RFC4122-ish UUID (Hasura `uuid` scalar). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type LandlordDetails = {
  nhost_user_id: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  photo_url?: string;
  about?: string;
  phone_number?: string;
  languages?: string[];
  education?: string;
  occupation?: string;
  avg_response_time?: string;
};

/**
 * Best-effort query for the landlord's real_estate_user profile.
 * Kept separate from the listing query so a missing/broken real_estate_user
 * record never causes the main property fetch to 500.
 */
const GET_LANDLORD_DETAILS_QUERY = `
  query GetLandlordDetails($nhostUserId: uuid!) {
    real_estate_user(where: { nhost_user_id: { _eq: $nhostUserId } }, limit: 1) {
      nhost_user_id
      display_name
      first_name
      last_name
      email
      photo_url
      about
      phone_number
      languages
      education
      occupation
      avg_response_time
    }
  }
`;

async function fetchLandlordDetails(landlordUserId: string): Promise<LandlordDetails | null> {
  try {
    const data = (await executeQuery(GET_LANDLORD_DETAILS_QUERY, { nhostUserId: landlordUserId })) as {
      real_estate_user?: LandlordDetails[];
    };
    return data?.real_estate_user?.[0] ?? null;
  } catch {
    // real_estate_user record may not exist — silently ignore
    return null;
  }
}

/**
 * Best-effort query to get a user's defaultRole from auth.users.
 * Kept separate from the listing query so a relationship/permissions issue
 * in auth schema never breaks the main property fetch.
 */
const GET_LANDLORD_ROLE_QUERY = `
  query GetLandlordDefaultRole($userId: uuid!) {
    users(where: { id: { _eq: $userId } }) {
      defaultRole
    }
  }
`;

async function fetchLandlordRole(landlordUserId: string): Promise<string | undefined> {
  // Also honour the env-var shortcut for setups where auth.users isn't exposed
  const raw = process.env.DROPITI_PLATFORM_LANDLORD_USER_IDS;
  if (raw?.trim()) {
    const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.includes(landlordUserId)) return 'admin';
  }

  try {
    const data = (await executeQuery(GET_LANDLORD_ROLE_QUERY, { userId: landlordUserId })) as {
      users?: { defaultRole: string }[];
    };
    return data?.users?.[0]?.defaultRole ?? undefined;
  } catch {
    // auth.users may not be exposed — silently ignore and return undefined
    return undefined;
  }
}

// NOTE: landlord_details and landlord_user are intentionally omitted — both are
// Hasura relationships that can fail for non-admin landlords and would 500 the
// entire query. They are fetched separately with try/catch fallbacks above.
const LISTING_FIELDS = `
      id
      property_uuid
      title
      description
      landlord_user_id
      created_at
      property_type
      rental_space
      address
      show_specific_location
      gross_area_size
      gross_area_size_unit
      num_bedroom
      num_bathroom
      furnished
      pets_allowed
      amenities
      display_image
      uploaded_images
      rental_price
      rental_price_currency
      availability_date
      status
`;

// NOTE: Do not nest `landlord_user` / auth.users here — it breaks Hasura for many landlord rows
// (relationship or permissions), which fails the whole query.
// Role detection is done separately via GET_LANDLORD_ROLE_QUERY with a try/catch fallback.
const GET_PROPERTY_BY_UUID_QUERY = `
  query GetPropertyByUuid($property_uuid: uuid!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $property_uuid } }, limit: 1) {
      ${LISTING_FIELDS}
    }
  }
`;

const GET_PROPERTY_BY_INT_ID_QUERY = `
  query GetPropertyByIntId($id: Int!) {
    real_estate_property_listing(where: { id: { _eq: $id } }, limit: 1) {
      ${LISTING_FIELDS}
    }
  }
`;

type ListingRow = {
  id: string;
  property_uuid: string;
  title: string;
  description: string;
  landlord_user_id: string;
  created_at: string;
  property_type: string;
  rental_space: string;
  address: string;
  show_specific_location: boolean;
  gross_area_size: number;
  gross_area_size_unit: string;
  num_bedroom: number;
  num_bathroom: number;
  furnished: boolean;
  pets_allowed: boolean;
  amenities: string[];
  display_image: string;
  uploaded_images: string[];
  rental_price: number;
  rental_price_currency: string;
  availability_date: string;
  status: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = (searchParams.get('property_uuid') || '').trim().split('?')[0].split('#')[0];
    const slug = raw;

    if (!slug) {
      return NextResponse.json(
        { error: 'Property UUID parameter is required' },
        { status: 400 }
      );
    }

    let typedPropertyData: { real_estate_property_listing?: ListingRow[] };

    if (UUID_RE.test(slug)) {
      typedPropertyData = (await executeQuery(GET_PROPERTY_BY_UUID_QUERY, {
        property_uuid: slug,
      })) as { real_estate_property_listing?: ListingRow[] };
    } else if (/^\d+$/.test(slug)) {
      try {
        typedPropertyData = (await executeQuery(GET_PROPERTY_BY_INT_ID_QUERY, {
          id: parseInt(slug, 10),
        })) as { real_estate_property_listing?: ListingRow[] };
      } catch {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid property identifier' },
        { status: 400 }
      );
    }

    if (!typedPropertyData.real_estate_property_listing?.length) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const property = typedPropertyData.real_estate_property_listing[0];

    // Run both secondary lookups in parallel — each has its own try/catch so
    // a missing record or Hasura permission issue never breaks the main fetch.
    const [details, landlordRole] = await Promise.all([
      fetchLandlordDetails(property.landlord_user_id),
      fetchLandlordRole(property.landlord_user_id),
    ]);

    const response = {
      property: {
        id: property.id,
        property_uuid: property.property_uuid,
        title: property.title,
        description: property.description,
        location: formatPropertyLocation(property.address),
        address: property.address,
        show_specific_location: property.show_specific_location || false,
        price: property.rental_price || 0,
        bedrooms: property.num_bedroom || 0,
        bathrooms: property.num_bathroom || 0,
        num_bedroom: property.num_bedroom,
        num_bathroom: property.num_bathroom,
        gross_area_size: property.gross_area_size,
        gross_area_size_unit: property.gross_area_size_unit,
        furnished: property.furnished,
        pets_allowed: property.pets_allowed,
        image_url: property.display_image || (property.uploaded_images?.length ? property.uploaded_images[0] : ''),
        display_image: property.display_image || '',
        uploaded_images: property.uploaded_images || [],
        available: property.status === 'published',
        status: property.status || 'draft',
        created_at: property.created_at,
        updated_at: property.created_at,
        details: {
          type: property.property_type,
          furnished: property.furnished,
          petsAllowed: property.pets_allowed,
          parking: false,
        },
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        minimum_lease: 12,
        available_date: property.availability_date,
        owner_id: property.landlord_user_id,
      },
      // Always return a landlord object if we have any identity info
      landlord: (details || property.landlord_user_id) ? {
        id: details?.nhost_user_id || property.landlord_user_id,
        uuid: details?.nhost_user_id || property.landlord_user_id,
        nhost_user_id: details?.nhost_user_id || property.landlord_user_id,
        name: details?.display_name || details?.email?.split('@')[0] || 'Landlord',
        email: details?.email || '',
        avatar: details?.photo_url,
        verified: false,
        rating: 0,
        review_count: 0,
        response_rate: 0,
        avg_response_time: details?.avg_response_time || 'Unknown',
        user_since: undefined,
        about: details?.about,
        location: null,
        phone_number: details?.phone_number,
        languages: details?.languages,
        education: details?.education,
        occupation: details?.occupation,
        marital_status: null,
        role: landlordRole,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Property retrieved successfully',
    });
  } catch (error) {
    console.error('Get property by UUID error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve property' },
      { status: 500 }
    );
  }
}
