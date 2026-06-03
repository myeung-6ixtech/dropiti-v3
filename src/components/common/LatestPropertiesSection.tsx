/**
 * Server component — fetches the 4 most recently created published listings
 * via PropertyService (same source as /search and get-listings).
 */
import { PropertyService } from '@/app/api/graphql/services/propertyService';
import { formatPropertyLocation } from '@/lib/utils';
import PropertyCarousel from './PropertyCarousel';
import type { Property } from '@/types';

type RawListing = {
  id: string;
  property_uuid?: string;
  title: string;
  description: string;
  address: unknown;
  rental_price?: number | null;
  num_bedroom?: number | null;
  num_bathroom?: number | null;
  display_image?: string | null;
  uploaded_images?: string[] | null;
  property_type?: string;
  furnished?: string | null;
  pets_allowed?: boolean | null;
  amenities?: string[] | null;
  availability_date?: string | null;
  created_at?: string;
};

function transformListing(property: RawListing): Property & {
  property_uuid?: string;
  address?: unknown;
  rental_price?: number;
  num_bedroom?: number;
  num_bathroom?: number;
  display_image?: string | null;
  property_type?: string;
} {
  let location = 'Location not specified';
  if (typeof property.address === 'string') {
    location = property.address;
  } else if (property.address && typeof property.address === 'object') {
    location = formatPropertyLocation(property.address);
  }

  return {
    id: property.id,
    property_uuid: property.property_uuid || property.id,
    title: property.title,
    description: property.description,
    location,
    address: property.address,
    price: property.rental_price || 0,
    bedrooms: property.num_bedroom || 0,
    bathrooms: property.num_bathroom || 0,
    imageUrl: property.display_image || property.uploaded_images?.[0] || '',
    rental_price: property.rental_price ?? undefined,
    num_bedroom: property.num_bedroom ?? undefined,
    num_bathroom: property.num_bathroom ?? undefined,
    display_image: property.display_image,
    property_type: property.property_type,
    details: {
      type: property.property_type || 'residential',
      furnished: property.furnished || 'non-furnished',
      petsAllowed: property.pets_allowed || false,
      parking: false,
    },
    rules: [],
    amenities: property.amenities || [],
    minimumLease: 12,
    availableDate: property.availability_date ?? null,
    createdAt: property.created_at || new Date().toISOString(),
    updatedAt: property.created_at || new Date().toISOString(),
    ownerId: '',
  };
}

export default async function LatestPropertiesSection() {
  try {
    const data = await PropertyService.getProperties(4, 0);
    const raw = (data.properties ?? []) as RawListing[];

    if (raw.length === 0) {
      return null;
    }

    const normalised = raw.map(transformListing);

    return (
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-purple-600 mb-1 uppercase tracking-wide">
              Latest Listings
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Recently added properties
            </h2>
            <p className="mt-2 text-base text-gray-500">
              Fresh listings — updated in real time as landlords publish.
            </p>
          </div>

          <PropertyCarousel properties={normalised} />
        </div>
      </section>
    );
  } catch (error) {
    console.error('[LatestPropertiesSection] Failed to load listings:', error);
    return null;
  }
}
