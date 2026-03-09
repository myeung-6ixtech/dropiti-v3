import { Offer } from '@/types/offer';

// ========================================
// OFFER VALIDATION RULES
// ========================================

/**
 * Validate that only one offer can be accepted per property
 */
export function validateSingleAcceptance(
  offers: Offer[], 
  propertyUuid: string, 
  currentOfferId: string
): { isValid: boolean; error?: string } {
  const acceptedOffers = offers.filter(offer => 
    offer.propertyUuid === propertyUuid && 
    offer.offerStatus === 'accepted' &&
    offer.id !== currentOfferId
  );

  if (acceptedOffers.length > 0) {
    return {
      isValid: false,
      error: 'Another offer has already been accepted for this property'
    };
  }

  return { isValid: true };
}

/**
 * Validate offer status transitions
 */
export function validateOfferStatusTransition(
  currentStatus: string,
  newStatus: string
): { isValid: boolean; error?: string } {
  const validTransitions: Record<string, string[]> = {
    'pending': ['accepted', 'rejected', 'countered', 'withdrawn'],
    'countered': ['accepted', 'rejected', 'countered'],
    'accepted': [], // No further transitions allowed
    'rejected': [], // No further transitions allowed
    'withdrawn': [], // No further transitions allowed
    'expired': [], // No further transitions allowed
    'completed': [] // No further transitions allowed
  };

  const allowedTransitions = validTransitions[currentStatus] || [];
  
  if (!allowedTransitions.includes(newStatus)) {
    return {
      isValid: false,
      error: `Invalid status transition from '${currentStatus}' to '${newStatus}'`
    };
  }

  return { isValid: true };
}

/**
 * Validate that offers in negotiation can still be acted upon
 */
export function validateNegotiationState(
  offer: Offer
): { isValid: boolean; error?: string } {
  // Check if offer is in a final state
  if (['accepted', 'rejected', 'withdrawn', 'completed'].includes(offer.offerStatus)) {
    return {
      isValid: false,
      error: 'Offer is in a final state and cannot be modified'
    };
  }

  // Check if offer is still active
  if (!offer.isActive) {
    return {
      isValid: false,
      error: 'Offer is no longer active'
    };
  }

  return { isValid: true };
}

/**
 * Validate property availability for new offers
 */
export function validatePropertyAvailability(
  offers: Offer[],
  propertyUuid: string
): { isValid: boolean; error?: string } {
  const hasAcceptedOffer = offers.some(offer => 
    offer.propertyUuid === propertyUuid && 
    offer.offerStatus === 'accepted'
  );

  if (hasAcceptedOffer) {
    return {
      isValid: false,
      error: 'Property already has an accepted offer'
    };
  }

  return { isValid: true };
}

/**
 * Get validation summary for an offer
 */
export function getOfferValidationSummary(
  offer: Offer,
  allOffers: Offer[]
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check negotiation state
  const negotiationValidation = validateNegotiationState(offer);
  if (!negotiationValidation.isValid) {
    errors.push(negotiationValidation.error!);
  }

  // Check if property is available
  const availabilityValidation = validatePropertyAvailability(allOffers, offer.propertyUuid);
  if (!availabilityValidation.isValid) {
    warnings.push(availabilityValidation.error!);
  }

  // Check for duplicate offers from same user
  const duplicateOffers = allOffers.filter(o => 
    o.propertyUuid === offer.propertyUuid &&
    o.initiatorUserId === offer.initiatorUserId &&
    o.id !== offer.id &&
    o.offerStatus === 'pending'
  );

  if (duplicateOffers.length > 0) {
    warnings.push(`You have ${duplicateOffers.length} other pending offer${duplicateOffers.length === 1 ? '' : 's'} for this property`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
