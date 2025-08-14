'use client';

import OfferCardDetails from './OfferCardDetails';
import OutgoingOfferCardActions from './OutgoingOfferCardActions';
import IncomingOfferCardActions from './IncomingOfferCardActions';
import IncomingOfferCardStatus from './IncomingOfferCardStatus';
import OutgoingOfferCardStatus from './OutgoingOfferCardStatus';
import OfferUserDetails from './OfferUserDetails';
import { Offer } from '@/types/offer';



interface OfferCardProps {
  offer: Offer;
  showPropertyInfo?: boolean;
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
}

export default function OfferCard({
  offer,
  showPropertyInfo = true,
  onWithdrawOffer,
  // New props for incoming offers
  isIncomingOffer = false,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  onViewCounterOfferDetails,
  respondingToCounter = false,
  currentUserId,
  onOfferStatusChange
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
          onViewCounterOffer={onViewCounterOfferDetails ? () => onViewCounterOfferDetails(offer) : undefined}
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
        />
      )}

      {/* Action Buttons for Outgoing Countered Offers */}
      {!isIncomingOffer && offer.offerStatus === 'countered' && (
        <OutgoingOfferCardActions
          offer={offer}
          onWithdrawOffer={onWithdrawOffer}
          currentUserId={currentUserId}
          onOfferStatusChange={onOfferStatusChange}
        />
      )}

      {/* Status-specific messages */}
      {isIncomingOffer ? (
        <IncomingOfferCardStatus
          offer={offer}
        />
      ) : (
        <OutgoingOfferCardStatus
          offer={offer}
          currentUserId={currentUserId}
          onOfferStatusChange={onOfferStatusChange}
        />
      )}
    </div>
  );
}
