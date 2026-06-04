import { toClientPaymentFrequency } from '@/lib/payment-frequency';
import type { Offer, OfferActionType, OfferStatus } from '@/types/offer';

/** Raw Hasura row shape from Nhost Functions offer endpoints. */
export type RawOfferRow = Record<string, unknown>;

export function isRawOfferRow(value: unknown): value is RawOfferRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;

  // Notifications also carry recipient_user_id — exclude them first.
  if ('is_read' in row || 'is_archived' in row || 'type_id' in row) {
    return false;
  }

  return (
    'offer_status' in row ||
    'offer_key' in row ||
    'proposing_rent_price' in row ||
    ('initiator_user_id' in row && 'property_uuid' in row)
  );
}

export function isOfferItemsPayload(items: unknown[]): boolean {
  return items.length > 0 && items.some(isRawOfferRow);
}

function readString(row: RawOfferRow, camel: string, snake: string): string {
  const value = row[camel] ?? row[snake];
  return value == null ? '' : String(value);
}

function readOptionalNumber(row: RawOfferRow, camel: string, snake: string): number | undefined {
  const value = row[camel] ?? row[snake];
  if (value == null || value === '') return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

/** Map Hasura offer row → frontend `Offer` shape. */
export function normalizeOffer(row: RawOfferRow): Offer {
  const paymentFrequency =
    toClientPaymentFrequency(
      readString(row, 'paymentFrequency', 'payment_frequency') || undefined,
    ) ?? readString(row, 'paymentFrequency', 'payment_frequency');

  const currentPaymentFrequencyRaw = readString(row, 'currentPaymentFrequency', 'current_payment_frequency');
  const currentPaymentFrequency = currentPaymentFrequencyRaw
    ? toClientPaymentFrequency(currentPaymentFrequencyRaw) ?? currentPaymentFrequencyRaw
    : undefined;

  const finalPaymentFrequencyRaw = readString(row, 'finalPaymentFrequency', 'final_payment_frequency');
  const finalPaymentFrequency = finalPaymentFrequencyRaw
    ? toClientPaymentFrequency(finalPaymentFrequencyRaw) ?? finalPaymentFrequencyRaw
    : undefined;

  return {
    id: readString(row, 'id', 'id') || readString(row, 'offerUuid', 'offer_uuid'),
    offerKey: readString(row, 'offerKey', 'offer_key'),
    propertyUuid: readString(row, 'propertyUuid', 'property_uuid'),
    initiatorUserId: readString(row, 'initiatorUserId', 'initiator_user_id'),
    recipientUserId: readString(row, 'recipientUserId', 'recipient_user_id'),
    proposingRentPrice: Number(row.proposingRentPrice ?? row.proposing_rent_price ?? 0),
    proposingRentPriceCurrency: readString(row, 'proposingRentPriceCurrency', 'proposing_rent_price_currency') || 'HKD',
    numLeasingMonths: Number(row.numLeasingMonths ?? row.num_leasing_months ?? 0),
    paymentFrequency,
    moveInDate: readString(row, 'moveInDate', 'move_in_date'),
    offerStatus: readString(row, 'offerStatus', 'offer_status') as OfferStatus,
    isActive: Boolean(row.isActive ?? row.is_active ?? true),
    createdAt: readString(row, 'createdAt', 'created_at'),
    updatedAt: readString(row, 'updatedAt', 'updated_at'),
    currentRentPrice: readOptionalNumber(row, 'currentRentPrice', 'current_rent_price'),
    currentRentPriceCurrency: readString(row, 'currentRentPriceCurrency', 'current_rent_price_currency') || undefined,
    currentNumLeasingMonths: readOptionalNumber(row, 'currentNumLeasingMonths', 'current_num_leasing_months'),
    currentPaymentFrequency: currentPaymentFrequency || undefined,
    currentMoveInDate: readString(row, 'currentMoveInDate', 'current_move_in_date') || undefined,
    negotiationRound: Number(row.negotiationRound ?? row.negotiation_round ?? 0),
    lastActionBy: (readString(row, 'lastActionBy', 'last_action_by') || 'initiator') as 'initiator' | 'recipient',
    lastActionAt:
      readString(row, 'lastActionAt', 'last_action_at') ||
      readString(row, 'updatedAt', 'updated_at') ||
      readString(row, 'createdAt', 'created_at'),
    lastActionType: readString(row, 'lastActionType', 'last_action_type') as OfferActionType,
    finalRentPrice: readOptionalNumber(row, 'finalRentPrice', 'final_rent_price'),
    finalRentPriceCurrency: readString(row, 'finalRentPriceCurrency', 'final_rent_price_currency') || undefined,
    finalNumLeasingMonths: readOptionalNumber(row, 'finalNumLeasingMonths', 'final_num_leasing_months'),
    finalPaymentFrequency,
    finalMoveInDate: readString(row, 'finalMoveInDate', 'final_move_in_date') || undefined,
    finalAcceptedAt: readString(row, 'finalAcceptedAt', 'final_accepted_at') || undefined,
    finalAcceptedBy: (row.finalAcceptedBy ?? row.final_accepted_by) as Offer['finalAcceptedBy'],
    initiator: row.initiator as Offer['initiator'],
    recipient: row.recipient as Offer['recipient'],
    property: row.property as Offer['property'],
    actionHistory: row.actionHistory as Offer['actionHistory'],
  };
}

export function normalizeOffers(items: unknown[]): Offer[] {
  return items.map((item) => {
    if (isRawOfferRow(item)) {
      return normalizeOffer(item);
    }
    return item as Offer;
  });
}
