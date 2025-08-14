interface OfferCardStatusProps {
  offer: {
    id: string;
    offerStatus: string;
    lastActionType?: string;
    negotiationRound?: number;
    currentRentPrice?: number;
    currentRentPriceCurrency?: string;
    currentNumLeasingMonths?: number;
    currentPaymentFrequency?: string;
    currentMoveInDate?: string;
    proposingRentPrice: number;
    proposingRentPriceCurrency: string;
    numLeasingMonths: number;
    moveInDate: string;
    paymentFrequency: string;
    offerKey?: string;
    propertyUuid?: string;
    initiatorFirebaseUid?: string;
    recipientFirebaseUid?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    initiator?: { uuid: string; displayName: string; email: string; phoneNumber: string; photoUrl: string } | null;
    recipient?: { uuid: string; displayName: string; email: string; phoneNumber: string; photoUrl: string } | null;
    property?: { title: string; location: string; rentalPrice: number; rentalPriceCurrency: string; propertyType: string; bedrooms: number; bathrooms: number; imageUrl: string } | null;
    actionHistory?: Array<{ id: string; action: string; offerId: string; createdAt: string }>;
  };
  finalCounterSubmitted?: boolean;
  onViewCounterOffer?: (offer: { id: string; offerStatus: string; lastActionType?: string; negotiationRound?: number; currentRentPrice?: number; currentRentPriceCurrency?: string; currentNumLeasingMonths?: number; currentPaymentFrequency?: string; currentMoveInDate?: string; proposingRentPrice: number; proposingRentPriceCurrency: string; numLeasingMonths: number; moveInDate: string; paymentFrequency: string; }) => void;
}

export default function OfferCardStatus({
  offer,
  finalCounterSubmitted = false,
  onViewCounterOffer
}: OfferCardStatusProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'HKD') => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Status-specific messages
  if (offer.offerStatus === 'accepted') {
    return (
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-green-600 font-medium">✓ Your offer was accepted! Contact the landlord to proceed.</p>
      </div>
    );
  }

  if (offer.offerStatus === 'rejected') {
    return (
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-red-600 font-medium">✗ Your offer was not accepted</p>
      </div>
    );
  }

  if (offer.offerStatus === 'countered') {
    if (offer.lastActionType === 'INITIATOR_COUNTERED') {
      // Show pending message when user has already submitted a final counter
      return (
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <p className="text-sm text-blue-600 font-medium">↻ Pending Final Offer</p>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2 text-sm">Your Final Counter Offer</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                <div>
                  <span className="font-medium">Rent:</span> {formatCurrency(offer.proposingRentPrice, offer.proposingRentPriceCurrency)}/month
                </div>
                <div>
                  <span className="font-medium">Lease:</span> {offer.numLeasingMonths} months
                </div>
                <div>
                  <span className="font-medium">Move-in:</span> {formatDate(offer.moveInDate)}
                </div>
                <div>
                  <span className="font-medium">Payment:</span> <span className="capitalize">{offer.paymentFrequency}</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Waiting for landlord's response...
              </p>
            </div>
          </div>
        </div>
      );
    } else if (finalCounterSubmitted) {
      // Show counter offer details after final counter submitted (fallback)
      return (
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <p className="text-sm text-blue-600 font-medium">↻ Final Counter Offer Submitted</p>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2 text-sm">Your Final Counter Offer</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                <div>
                  <span className="font-medium">Rent:</span> {formatCurrency(offer.proposingRentPrice, offer.proposingRentPriceCurrency)}/month
                </div>
                <div>
                  <span className="font-medium">Lease:</span> {offer.numLeasingMonths} months
                </div>
                <div>
                  <span className="font-medium">Move-in:</span> {formatDate(offer.moveInDate)}
                </div>
                <div>
                  <span className="font-medium">Payment:</span> <span className="capitalize">{offer.paymentFrequency}</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Waiting for landlord's response...
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      // Show button to view counter offer
      return (
        <div className="pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-blue-600 font-medium">↻ The landlord sent you a counter offer</p>
            {onViewCounterOffer && (
              <button 
                onClick={() => onViewCounterOffer(offer)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View Counter Offer
              </button>
            )}
          </div>
        </div>
      );
    }
  }

  if (offer.offerStatus === 'withdrawn') {
    return (
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 font-medium">↺ You withdrew this offer</p>
      </div>
    );
  }

  // No status message for other statuses
  return null;
}
