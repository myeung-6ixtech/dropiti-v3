// ========================================
// OFFER NEGOTIATION LOGIC
// ========================================

import { 
  Offer, 
  OfferStatus, 
  OfferActionType, 
  OfferNegotiationState,
  CounterOfferInput 
} from '@/types/offer';

// ========================================
// NEGOTIATION CONSTANTS
// ========================================

export const MAX_NEGOTIATION_ROUNDS = 2;
export const INITIAL_ROUND = 0;

// ========================================
// NEGOTIATION STATE CALCULATION
// ========================================

/**
 * Calculate the current negotiation state for an offer
 */
export function calculateNegotiationState(
  offer: Offer, 
  currentUserId: string
): OfferNegotiationState {
  const isInitiator = offer.initiatorFirebaseUid === currentUserId;
  
  // Determine whose turn it is
  const nextActionBy = determineNextActionBy(offer);
  
  // Check if this is the final round
  const isFinalRound = offer.negotiationRound >= MAX_NEGOTIATION_ROUNDS;
  
  // Calculate available actions based on current state
  const availableActions = calculateAvailableActions(offer, isInitiator, isFinalRound);
  
  return {
    canInitiatorAct: nextActionBy === 'initiator' && offer.offerStatus !== 'completed',
    canRecipientAct: nextActionBy === 'recipient' && offer.offerStatus !== 'completed',
    availableActions,
    nextActionBy,
    isFinalRound,
    canCounter: canCounterOffer(offer, isInitiator, isFinalRound),
    canAccept: canAcceptOffer(offer, isInitiator),
    canReject: canRejectOffer(offer, isInitiator),
    canWithdraw: canWithdrawOffer(offer, isInitiator)
  };
}

/**
 * Determine whose turn it is to act on the offer
 */
function determineNextActionBy(offer: Offer): 'initiator' | 'recipient' | 'none' {
  // If offer is completed, no one can act
  if (offer.offerStatus === 'accepted' || 
      offer.offerStatus === 'rejected' || 
      offer.offerStatus === 'withdrawn' ||
      offer.offerStatus === 'completed') {
    return 'none';
  }
  
  // If offer is tentatively accepted, only recipient (landlord) can confirm
  if (offer.offerStatus === 'tentatively_accepted') {
    return 'recipient';
  }
  
  // If offer is pending and no action taken yet, it's recipient's turn
  if (offer.offerStatus === 'pending' && offer.negotiationRound === INITIAL_ROUND) {
    return 'recipient';
  }
  
  // If offer is countered, it's the other party's turn
  if (offer.offerStatus === 'countered') {
    return offer.lastActionBy === 'initiator' ? 'recipient' : 'initiator';
  }
  
  return 'none';
}

/**
 * Calculate available actions for the current user
 */
function calculateAvailableActions(
  offer: Offer, 
  isInitiator: boolean, 
  isFinalRound: boolean
): OfferActionType[] {
  const actions: OfferActionType[] = [];
  
  if (offer.offerStatus === 'pending') {
    if (isInitiator) {
      actions.push('INITIATOR_CANCELLED'); // Withdraw
    } else {
      actions.push('RECIPIENT_ACCEPTED', 'RECIPIENT_REJECTED', 'RECIPIENT_COUNTERED');
    }
  } else if (offer.offerStatus === 'countered') {
    if (isInitiator) {
      actions.push('INITIATOR_ACCEPTED', 'INITIATOR_REJECTED');
      if (!isFinalRound) {
        actions.push('INITIATOR_COUNTERED');
      }
    } else {
      actions.push('RECIPIENT_ACCEPTED', 'RECIPIENT_REJECTED');
      if (!isFinalRound) {
        actions.push('RECIPIENT_COUNTERED');
      }
    }
  }
  
  return actions;
}

/**
 * Check if the current user can counter the offer
 */
function canCounterOffer(
  offer: Offer, 
  isInitiator: boolean, 
  isFinalRound: boolean
): boolean {
  if (offer.offerStatus !== 'countered') return false;
  if (isFinalRound) return false;
  
  // Can only counter if it's your turn and you haven't reached max rounds
  const nextActionBy = determineNextActionBy(offer);
  const userRole = isInitiator ? 'initiator' : 'recipient';
  
  return nextActionBy === userRole && offer.negotiationRound < MAX_NEGOTIATION_ROUNDS;
}

/**
 * Check if the current user can accept the offer
 */
function canAcceptOffer(offer: Offer, isInitiator: boolean): boolean {
  if (offer.offerStatus === 'accepted' || 
      offer.offerStatus === 'rejected' || 
      offer.offerStatus === 'withdrawn') {
    return false;
  }
  
  // Special handling for tentative acceptance
  if (offer.offerStatus === 'tentatively_accepted') {
    // Only recipient (landlord) can confirm tentative acceptance
    return !isInitiator;
  }
  
  // Can accept if it's your turn
  const nextActionBy = determineNextActionBy(offer);
  const userRole = isInitiator ? 'initiator' : 'recipient';
  
  return nextActionBy === userRole;
}

/**
 * Check if the current user can reject the offer
 */
function canRejectOffer(offer: Offer, isInitiator: boolean): boolean {
  if (offer.offerStatus === 'accepted' || 
      offer.offerStatus === 'rejected' || 
      offer.offerStatus === 'withdrawn') {
    return false;
  }
  
  // Can reject if it's your turn
  const nextActionBy = determineNextActionBy(offer);
  const userRole = isInitiator ? 'initiator' : 'recipient';
  
  return nextActionBy === userRole;
}

/**
 * Check if the current user can withdraw the offer
 */
function canWithdrawOffer(offer: Offer, isInitiator: boolean): boolean {
  // Only initiator can withdraw
  if (!isInitiator) return false;
  
  // Can withdraw if offer is still pending
  return offer.offerStatus === 'pending';
}

// ========================================
// OFFER VALIDATION
// ========================================

/**
 * Validate if an offer action is allowed
 */
export function validateOfferAction(
  offer: Offer,
  action: OfferActionType,
  currentUserId: string
): { isValid: boolean; error?: string } {
  const isInitiator = offer.initiatorFirebaseUid === currentUserId;
  const isRecipient = offer.recipientFirebaseUid === currentUserId;
  
  // Check if user is involved in the offer
  if (!isInitiator && !isRecipient) {
    return { isValid: false, error: 'User not involved in this offer' };
  }
  
  // Check if offer is still active
  if (offer.offerStatus === 'accepted' || 
      offer.offerStatus === 'rejected' || 
      offer.offerStatus === 'withdrawn') {
    return { isValid: false, error: 'Offer is no longer active' };
  }
  
  // Check if it's the user's turn
  const nextActionBy = determineNextActionBy(offer);
  const userRole = isInitiator ? 'initiator' : 'recipient';
  
  if (nextActionBy !== userRole) {
    return { isValid: false, error: 'Not your turn to act on this offer' };
  }
  
  // Validate specific actions
  switch (action) {
    case 'INITIATOR_COUNTERED':
    case 'RECIPIENT_COUNTERED':
      if (offer.negotiationRound >= MAX_NEGOTIATION_ROUNDS) {
        return { isValid: false, error: 'Maximum negotiation rounds reached' };
      }
      break;
      
    case 'INITIATOR_CANCELLED':
      if (!isInitiator) {
        return { isValid: false, error: 'Only initiator can withdraw offer' };
      }
      if (offer.offerStatus !== 'pending') {
        return { isValid: false, error: 'Can only withdraw pending offers' };
      }
      break;
  }
  
  return { isValid: true };
}

/**
 * Validate counter offer data
 */
export function validateCounterOffer(
  offer: Offer,
  counterData: CounterOfferInput
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate rent price
  if (counterData.rentPrice <= 0) {
    errors.push('Rent price must be positive');
  }
  
  // Validate lease duration
  if (counterData.numLeasingMonths <= 0) {
    errors.push('Lease duration must be positive');
  }
  
  // Validate move-in date
  const moveInDate = new Date(counterData.moveInDate);
  const today = new Date();
  if (moveInDate < today) {
    errors.push('Move-in date cannot be in the past');
  }
  
  // Check if this is a valid counter (different from current offer)
  const currentOffer = {
    rentPrice: offer.currentRentPrice || offer.proposingRentPrice,
    numLeasingMonths: offer.currentNumLeasingMonths || offer.numLeasingMonths,
    paymentFrequency: offer.currentPaymentFrequency || offer.paymentFrequency,
    moveInDate: offer.currentMoveInDate || offer.moveInDate
  };
  
  if (counterData.rentPrice === currentOffer.rentPrice &&
      counterData.numLeasingMonths === currentOffer.numLeasingMonths &&
      counterData.paymentFrequency === currentOffer.paymentFrequency &&
      counterData.moveInDate === currentOffer.moveInDate) {
    errors.push('Counter offer must be different from current offer');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ========================================
// OFFER TRANSITION LOGIC
// ========================================

/**
 * Calculate the new offer status after an action
 */
export function calculateNewOfferStatus(
  currentStatus: OfferStatus,
  action: OfferActionType
): OfferStatus {
  switch (action) {
    case 'INITIATOR_ACCEPTED':
    case 'RECIPIENT_ACCEPTED':
      return 'accepted';
      
    case 'INITIATOR_REJECTED':
    case 'RECIPIENT_REJECTED':
    case 'SYSTEM_REJECTED':
      return 'rejected';
      
    case 'INITIATOR_CANCELLED':
      return 'withdrawn';
      
    case 'INITIATOR_COUNTERED':
    case 'RECIPIENT_COUNTERED':
      return 'countered';
      
    default:
      return currentStatus;
  }
}

/**
 * Calculate the new negotiation round after an action
 */
export function calculateNewNegotiationRound(
  currentRound: number,
  action: OfferActionType
): number {
  if (action === 'INITIATOR_COUNTERED' || action === 'RECIPIENT_COUNTERED') {
    return currentRound + 1;
  }
  
  return currentRound;
}

/**
 * Calculate the new last action by after an action
 */
export function calculateNewLastActionBy(
  action: OfferActionType
): 'initiator' | 'recipient' {
  if (action.startsWith('INITIATOR_')) {
    return 'initiator';
  } else if (action.startsWith('RECIPIENT_')) {
    return 'recipient';
  }
  
  // Default fallback
  return 'initiator';
}

// ========================================
// OFFER ACTION CREATION
// ========================================

/**
 * Create an offer action record
 */
export function createOfferAction(
  offer: Offer,
  action: OfferActionType,
  actionData?: Record<string, unknown>
) {
  return {
    action,
    offerId: offer.id,
    offerKey: offer.offerKey,
    propertyUuid: offer.propertyUuid,
    createdAt: new Date().toISOString(),
    actionData: actionData || {}
  };
}

/**
 * Create action data for counter offers
 */
export function createCounterActionData(
  offer: Offer,
  counterData: CounterOfferInput
) {
  return {
    previousRentPrice: offer.currentRentPrice || offer.proposingRentPrice,
    newRentPrice: counterData.rentPrice,
    previousLeasingMonths: offer.currentNumLeasingMonths || offer.numLeasingMonths,
    newLeasingMonths: counterData.numLeasingMonths,
    previousPaymentFrequency: offer.currentPaymentFrequency || offer.paymentFrequency,
    newPaymentFrequency: counterData.paymentFrequency,
    previousMoveInDate: offer.currentMoveInDate || offer.moveInDate,
    newMoveInDate: counterData.moveInDate,
    reason: counterData.reason,
    message: counterData.message
  };
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check if an offer is in a final state
 */
export function isOfferFinal(offer: Offer): boolean {
  return ['accepted', 'rejected', 'withdrawn', 'completed'].includes(offer.offerStatus);
}

/**
 * Check if an offer can be negotiated further
 */
export function canNegotiateFurther(offer: Offer): boolean {
  return offer.offerStatus === 'countered' && offer.negotiationRound < MAX_NEGOTIATION_ROUNDS;
}

/**
 * Get the display text for the next action
 */
export function getNextActionText(offer: Offer): string {
  if (isOfferFinal(offer)) {
    return 'Deal completed';
  }
  
  const nextActionBy = determineNextActionBy(offer);
  if (nextActionBy === 'none') {
    return 'Waiting for response';
  }
  
  const userType = nextActionBy === 'initiator' ? 'Tenant' : 'Landlord';
  return `Waiting for ${userType} to respond`;
}

/**
 * Get the negotiation summary
 */
export function getNegotiationSummary(offer: Offer): string {
  const roundText = offer.negotiationRound === 0 ? 'Initial Offer' : `Round ${offer.negotiationRound}`;
  const statusText = offer.offerStatus === 'countered' ? 'Counter Offer' : offer.offerStatus;
  
  return `${roundText} - ${statusText}`;
}

// ========================================
// BULK OFFER OPERATIONS
// ========================================

/**
 * Check if a property has any accepted offers
 */
export function hasAcceptedOffers(offers: Offer[], propertyUuid: string): boolean {
  return offers.some(offer => 
    offer.propertyUuid === propertyUuid && 
    offer.offerStatus === 'accepted'
  );
}

/**
 * Get all pending offers for a specific property
 */
export function getPendingOffersForProperty(offers: Offer[], propertyUuid: string): Offer[] {
  return offers.filter(offer => 
    offer.propertyUuid === propertyUuid && 
    offer.offerStatus === 'pending' &&
    offer.isActive
  );
}

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
 * Get the negotiation summary for bulk operations
 */
export function getBulkOperationSummary(
  acceptedOffer: Offer,
  rejectedOffers: Offer[]
): string {
  const acceptedText = `Offer accepted by ${acceptedOffer.finalAcceptedBy === 'initiator' ? 'tenant' : 'landlord'}`;
  
  if (rejectedOffers.length === 0) {
    return acceptedText;
  }

  const rejectedText = `${rejectedOffers.length} other pending offer${rejectedOffers.length === 1 ? '' : 's'} automatically rejected`;
  
  return `${acceptedText}. ${rejectedText}.`;
}
