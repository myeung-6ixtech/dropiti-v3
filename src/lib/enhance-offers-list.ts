import { propertiesAPI } from '@/lib/api-client';
import type { Offer, OfferProperty } from '@/types/offer';

function resolveOfferPropertyUuid(offer: Offer): string {
  const fromOffer = offer.propertyUuid?.trim();
  if (fromOffer) return fromOffer;

  const row = offer as Offer & { property_uuid?: string };
  const fromSnake = row.property_uuid?.trim();
  if (fromSnake) return fromSnake;

  return offer.property?.propertyUuid?.trim() ?? '';
}

function mapPropertyRecordToOfferProperty(
  propertyUuid: string,
  property: Record<string, unknown>,
): OfferProperty {
  const details =
    property.details && typeof property.details === 'object'
      ? (property.details as Record<string, unknown>)
      : null;

  return {
    propertyUuid,
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
  if (!offer.property?.title) return offer;

  const propertyUuid = resolveOfferPropertyUuid(offer);

  return {
    ...offer,
    propertyUuid: propertyUuid || offer.propertyUuid,
    property: {
      propertyUuid: propertyUuid || offer.property.propertyUuid,
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

async function enhanceSingleOffer(offer: Offer): Promise<Offer> {
  if (offer.property?.title) {
    return normalizeEmbeddedProperty(offer);
  }

  const propertyUuid = resolveOfferPropertyUuid(offer);
  if (!propertyUuid) {
    return offer;
  }

  try {
    const propertyResponse = await propertiesAPI.getPropertyByUuid(propertyUuid);
    if (propertyResponse?.success && propertyResponse?.data?.property) {
      const property = propertyResponse.data.property as Record<string, unknown>;
      return {
        ...offer,
        propertyUuid,
        property: mapPropertyRecordToOfferProperty(propertyUuid, property),
      };
    }
  } catch (err) {
    console.error('[enhanceOffersWithProperty] failed for offer', offer.id, err);
  }

  return { ...offer, propertyUuid };
}

/** Ensure each offer has property details for OfferCard (API embed or per-uuid fetch). */
export async function enhanceOffersWithProperty(offers: Offer[]): Promise<Offer[]> {
  if (offers.length === 0) return [];
  return Promise.all(offers.map((offer) => enhanceSingleOffer(offer)));
}
