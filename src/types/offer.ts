// ========================================
// OFFER TYPES
// ========================================

// ========================================
// CORE OFFER INTERFACE
// ========================================

export interface Offer {
  id: string;
  offerKey: string;
  propertyUuid: string;
  initiatorFirebaseUid: string;
  recipientFirebaseUid: string;
  proposingRentPrice: number;
  proposingRentPriceCurrency: string;
  numLeasingMonths: number;
  paymentFrequency: string;
  moveInDate: string;
  offerStatus: OfferStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // New fields for negotiation
  currentRentPrice?: number;
  currentRentPriceCurrency?: string;
  currentNumLeasingMonths?: number;
  currentPaymentFrequency?: string;
  currentMoveInDate?: string;
  negotiationRound: number; // 0 = initial, 1 = first counter, 2 = final counter
  lastActionBy: 'initiator' | 'recipient';
  lastActionAt: string;
  lastActionType: OfferActionType;
  // New fields for final accepted terms
  finalRentPrice?: number;
  finalRentPriceCurrency?: string;
  finalNumLeasingMonths?: number;
  finalPaymentFrequency?: string;
  finalMoveInDate?: string;
  finalAcceptedAt?: string;
  finalAcceptedBy?: 'initiator' | 'recipient';
  // Related data
  initiator?: OfferUser;
  recipient?: OfferUser;
  property?: OfferProperty;
  actionHistory?: OfferAction[];
}

// ========================================
// OFFER STATUS ENUM
// ========================================

export type OfferStatus = 
  | 'pending'           // Initial offer created
  | 'accepted'          // Offer accepted by either party
  | 'rejected'          // Offer rejected by either party
  | 'countered'         // Offer countered (waiting for response)
  | 'withdrawn'         // Offer withdrawn by initiator
  | 'expired'           // Offer expired
  | 'completed';        // Deal completed

// ========================================
// OFFER ACTION TYPES
// ========================================

export type OfferActionType = 
  | 'INITIATOR_CREATED'
  | 'INITIATOR_EDITED'
  | 'INITIATOR_CANCELLED'
  | 'INITIATOR_ACCEPTED'
  | 'INITIATOR_COUNTERED'
  | 'INITIATOR_REJECTED'
  | 'RECIPIENT_CREATED'
  | 'RECIPIENT_EDITED'
  | 'RECIPIENT_CANCELLED'
  | 'RECIPIENT_ACCEPTED'
  | 'RECIPIENT_COUNTERED'
  | 'RECIPIENT_REJECTED'
  | 'SYSTEM_REJECTED';

// ========================================
// OFFER ACTION INTERFACE
// ========================================

export interface OfferAction {
  id: string;
  action: OfferActionType;
  offerId: string;
  offerKey: string;
  propertyUuid: string;
  createdAt: string;
  // Action-specific data
  actionData?: {
    previousRentPrice?: number;
    newRentPrice?: number;
    previousLeasingMonths?: number;
    newLeasingMonths?: number;
    previousPaymentFrequency?: string;
    newPaymentFrequency?: string;
    previousMoveInDate?: string;
    newMoveInDate?: string;
    reason?: string;
    message?: string;
  };
}

// ========================================
// OFFER USER INTERFACE
// ========================================

export interface OfferUser {
  uuid: string;
  displayName: string;
  email: string;
  photoUrl?: string;
}

// ========================================
// OFFER PROPERTY INTERFACE
// ========================================

export interface OfferProperty {
  propertyUuid: string;
  title: string;
  location: string;
  rentalPrice: number;
  rentalPriceCurrency: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
}

// ========================================
// OFFER CREATION & UPDATE
// ========================================

export interface CreateOfferInput {
  propertyId: string;
  initiatorFirebaseUid: string;
  recipientFirebaseUid: string;
  proposingRentPrice: number;
  numLeasingMonths: number;
  paymentFrequency: string;
  moveInDate: string;
  currency?: string;
  message?: string;
}

export interface UpdateOfferInput {
  rentPrice?: number;
  numLeasingMonths?: number;
  paymentFrequency?: string;
  moveInDate?: string;
  message?: string;
}

export interface CounterOfferInput {
  rentPrice: number;
  numLeasingMonths: number;
  paymentFrequency: string;
  moveInDate: string;
  message?: string;
  reason?: string;
}

// ========================================
// OFFER RESPONSES
// ========================================

export interface OfferResponse {
  success: boolean;
  data: Offer | Offer[];
  total?: number;
  message: string;
}

export interface OfferListResponse {
  success: boolean;
  data: Offer[];
  total: number;
  message: string;
}

// ========================================
// OFFER FILTERS
// ========================================

export interface OfferFilters {
  status?: OfferStatus;
  initiatorFirebaseUid?: string;
  recipientFirebaseUid?: string;
  propertyUuid?: string;
  limit?: number;
  offset?: number;
}

// ========================================
// OFFER NEGOTIATION WORKFLOW
// ========================================

export interface OfferNegotiationState {
  canInitiatorAct: boolean;
  canRecipientAct: boolean;
  availableActions: OfferActionType[];
  nextActionBy: 'initiator' | 'recipient' | 'none';
  isFinalRound: boolean;
  canCounter: boolean;
  canAccept: boolean;
  canReject: boolean;
  canWithdraw: boolean;
}

// ========================================
// OFFER UTILITY TYPES
// ========================================

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  pending: 'Pending Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  countered: 'Counter Offer',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
  completed: 'Completed'
};

export const OFFER_STATUS_COLORS: Record<OfferStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  countered: 'bg-blue-100 text-blue-800',
  withdrawn: 'bg-gray-100 text-gray-800',
  expired: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800'
};

export const OFFER_ACTION_LABELS: Record<OfferActionType, string> = {
  INITIATOR_CREATED: 'Offer Created',
  INITIATOR_EDITED: 'Offer Edited',
  INITIATOR_CANCELLED: 'Offer Cancelled',
  INITIATOR_ACCEPTED: 'Offer Accepted',
  INITIATOR_COUNTERED: 'Counter Offer Sent',
  INITIATOR_REJECTED: 'Offer Rejected',
  RECIPIENT_CREATED: 'Offer Created',
  RECIPIENT_EDITED: 'Offer Edited',
  RECIPIENT_CANCELLED: 'Offer Cancelled',
  RECIPIENT_ACCEPTED: 'Offer Accepted',
  RECIPIENT_COUNTERED: 'Counter Offer Sent',
  RECIPIENT_REJECTED: 'Offer Rejected',
  SYSTEM_REJECTED: 'Automatically Rejected'
};

// ========================================
// OFFER VALIDATION
// ========================================

export interface OfferValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ========================================
// OFFER NOTIFICATIONS
// ========================================

export interface OfferNotification {
  type: 'offer_created' | 'offer_countered' | 'offer_accepted' | 'offer_rejected' | 'offer_withdrawn';
  offerId: string;
  offerKey: string;
  propertyUuid: string;
  message: string;
  recipientFirebaseUid: string;
  createdAt: string;
}
