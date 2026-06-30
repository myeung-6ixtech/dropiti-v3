import { propertiesAPI } from '@/lib/api-client';
import type { Offer, OfferProperty } from '@/types/offer';

function mapPropertyRecordToOfferProperty(
  offer: Offer,
  property: Record<string, unknown>,
): OfferProperty {
  const details =
    property.details && typeof property.details === 'object'
      ? (property.details as Record<string, unknown>)
      : null;

  return {
    propertyUuid: offer.propertyUuid,
    title: String(property.title ?? 'Property'),
    location: String(property.location ?? ''),
    rentalPrice: Number(property.rental_price ?? property.price ?? 0),
    rentalPriceCurrency: String(property.rental_price_currency ?? 'HKD'),
    propertyType: String(property.property_type ?? details?.type ?? ''),
    bedrooms: Number(property.num_bedroom ?? property.bedrooms ?? 0),
    bathrooms: Number(property.num_bathroom ?? property.bathrooms ?? 0),
    imageUrl: String(property.display_image ?? property.image_url ?? ''),
  };
}

function normalizeEmbeddedProperty(offer: Offer): Offer {
  if (!offer.property) return offer;

  return {
    ...offer,
    property: {
      propertyUuid: offer.propertyUuid,
      title: offer.property.title,
      location: offer.property.location,
      rentalPrice: offer.property.rentalPrice || 0,
      rentalPriceCurrency: offer.property.rentalPriceCurrency || 'HKD',
      propertyType: offer.property.propertyType,
      bedrooms: offer.property.bedrooms || 0,
      bathrooms: offer.property.bathrooms || 0,
      imageUrl: offer.property.imageUrl || '',
    },
  };
}

/** Ensure each offer has property details for OfferCard (API embed or per-uuid fetch). */
export async function enhanceOffersWithProperty(offers: Offer[]): Promise<Offer[]> {
  if (offers.length === 0) return [];

  const hasEmbeddedProperty = offers.some((offer) => Boolean(offer.property?.title));

  if (hasEmbeddedProperty) {
    return offers.map((offer) => normalizeEmbeddedProperty(offer));
  }

  return Promise.all(
    offers.map(async (offer) => {
      if (offer.property?.title) {
        return normalizeEmbeddedProperty(offer);
      }

      try {
        const propertyResponse = await propertiesAPI.getPropertyByUuid(offer.propertyUuid);
        if (propertyResponse?.success && propertyResponse?.data?.property) {
          const property = propertyResponse.data.property as Record<string, unknown>;
          return {
            ...offer,
            property: mapPropertyRecordToOfferProperty(offer, property),
          };
        }
      } catch (err) {
        console.error('[enhanceOffersWithProperty] failed for offer', offer.id, err);
      }

      return offer;
    }),
  );
}
