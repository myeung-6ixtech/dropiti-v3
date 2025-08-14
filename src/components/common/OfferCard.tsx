'use client';

import OfferCardDetails from './OfferCardDetails';
import OutgoingOfferCardActions from './OutgoingOfferCardActions';
import IncomingOfferCardActions from './IncomingOfferCardActions';
import IncomingOfferCardStatus from './IncomingOfferCardStatus';
import OutgoingOfferCardStatus from './OutgoingOfferCardStatus';
import OfferUserDetails from './OfferUserDetails';

interface Offer {
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
  offerStatus: string;
  isActive: boolean;
  createdAt: string;
  // Recipient (landlord) details
  recipient?: {
    uuid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoUrl: string;
  } | null;
  // Property details
  property?: {
    title: string;
    location: string;
    rentalPrice: number;
    rentalPriceCurrency: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    imageUrl: string;
  } | null;
  // For counter offer details
  currentRentPrice?: number;
  currentRentPriceCurrency?: string;
  currentNumLeasingMonths?: number;
  currentPaymentFrequency?: string;
  currentMoveInDate?: string;
  // Negotiation fields
  negotiationRound?: number;
  lastActionBy?: 'initiator' | 'recipient';
  lastActionType?: string;
  lastActionAt?: string;
}

interface OfferCardProps {
  offer: Offer;
  showPropertyInfo?: boolean;
  finalCounterSubmitted?: boolean;
  onViewCounterOffer?: (offer: Offer) => void;
  onWithdrawOffer?: (offerId: string) => void;
  // New props for incoming offers
  isIncomingOffer?: boolean;
  onAcceptOffer?: (offerId: string) => void;
  onRejectOffer?: (offerId: string) => void;
  onCounterOffer?: (offerId: string) => void;
  onViewCounterOfferDetails?: (offer: Offer) => void;
  respondingToCounter?: boolean;
  currentUserId: string;
  onOfferStatusChange?: () => void;
  onFinalCounterOffer?: (offer: Offer) => void;
}

export default function OfferCard({
  offer,
  showPropertyInfo = true,
  finalCounterSubmitted = false,
  onViewCounterOffer,
  onWithdrawOffer,
  // New props for incoming offers
  isIncomingOffer = false,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  onViewCounterOfferDetails,
  respondingToCounter = false,
  currentUserId,
  onOfferStatusChange,
  onFinalCounterOffer
}: OfferCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Offer Header */}
      <OfferUserDetails
        offer={offer}
        isIncomingOffer={isIncomingOffer}
        offerStatus={offer.offerStatus}
      />

      {/* Offer Details */}
      <OfferCardDetails
        offer={offer}
        showPropertyInfo={showPropertyInfo}
        isIncomingOffer={isIncomingOffer}
      />

      {/* Action Buttons for Incoming Offers */}
      {isIncomingOffer && offer.offerStatus === 'pending' && (
        <IncomingOfferCardActions
          offer={offer}
          onAcceptOffer={onAcceptOffer}
          onRejectOffer={onRejectOffer}
          onCounterOffer={onCounterOffer}
          respondingToCounter={respondingToCounter}
          currentUserId={currentUserId}
          onOfferStatusChange={onOfferStatusChange}
        />
      )}

      {/* Action Buttons for Incoming Countered Offers */}
      {isIncomingOffer && offer.offerStatus === 'countered' && (
        <IncomingOfferCardActions
          offer={offer}
          onAcceptOffer={onAcceptOffer}
          onRejectOffer={onRejectOffer}
          onViewCounterOffer={onViewCounterOfferDetails}
          respondingToCounter={respondingToCounter}
          currentUserId={currentUserId}
          onOfferStatusChange={onOfferStatusChange}
        />
      )}

      {/* Action Buttons for Outgoing Offers */}
      {!isIncomingOffer && offer.offerStatus === 'pending' && (
        <OutgoingOfferCardActions
          offer={offer}
          onWithdrawOffer={onWithdrawOffer}
          currentUserId={currentUserId}
          onOfferStatusChange={onOfferStatusChange}
          finalCounterSubmitted={finalCounterSubmitted}
        />
      )}

      {/* Action Buttons for Outgoing Countered Offers */}
      {!isIncomingOffer && offer.offerStatus === 'countered' && (
        <OutgoingOfferCardActions
          offer={offer}
          onWithdrawOffer={onWithdrawOffer}
          currentUserId={currentUserId}
          onOfferStatusChange={onOfferStatusChange}
          finalCounterSubmitted={finalCounterSubmitted}
        />
      )}

      {/* Status-specific messages */}
      {isIncomingOffer ? (
        <IncomingOfferCardStatus
          offer={offer}
          finalCounterSubmitted={finalCounterSubmitted}
          onViewCounterOffer={onViewCounterOffer}
        />
      ) : (
        <OutgoingOfferCardStatus
          offer={offer}
          finalCounterSubmitted={finalCounterSubmitted}
          onViewCounterOffer={onViewCounterOffer}
          onFinalCounterOffer={onFinalCounterOffer}
          onAcceptOffer={onAcceptOffer}
          onRejectOffer={onRejectOffer}
          currentUserId={currentUserId}
          onOfferStatusChange={onOfferStatusChange}
          onCounterOffer={onCounterOffer}
        />
      )}
    </div>
  );
}
