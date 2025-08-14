import { Offer } from '@/types/offer';

interface IncomingOfferCardStatusProps {
  offer: Offer;
}

export default function IncomingOfferCardStatus({
  offer
}: IncomingOfferCardStatusProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // For incoming offers (landlord perspective)
  if (offer.offerStatus === 'accepted') {
    return (
      <div>
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <h4 className="text-green-900 text-sm font-semibold mb-3">
            Final Accepted Terms
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-sm font-semibold">Monthly Rent:</span>
                <span className="text-green-800 text-sm font-medium">
                  {formatCurrency(
                    offer.finalRentPrice || offer.proposingRentPrice, 
                    offer.finalRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-sm font-semibold">Lease Duration:</span>
                <span className="text-green-800 text-sm font-medium">
                  {offer.finalNumLeasingMonths || offer.numLeasingMonths} month{(offer.finalNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-sm font-semibold">Payment Frequency:</span>
                <span className="text-green-800 text-sm font-medium">
                  {offer.finalPaymentFrequency || offer.paymentFrequency}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-800 text-sm font-semibold">Move-in Date:</span>
                <span className="text-green-800 text-sm font-medium">
                  {formatDate(offer.finalMoveInDate || offer.moveInDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm font-medium">
            ✅ You accepted this tenant's offer
          </p>
        </div>
      </div>

    );
  }

  if (offer.offerStatus === 'rejected') {
    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800 text-sm font-medium">
          ❌ You rejected this tenant's offer
        </p>
      </div>
    );
  }

  if (offer.offerStatus === 'withdrawn') {
    return (
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-gray-800 text-sm font-medium">
          📝 Tenant withdrew their offer
        </p>
      </div>
    );
  }

  if (offer.offerStatus === 'countered') {
    if (offer.lastActionType === 'RECIPIENT_COUNTERED') {
      if (offer.negotiationRound === 1) {
        return (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm font-medium">
                💬 You sent a counter offer to the tenant
              </p>
              <p className="text-blue-700 text-xs mt-1">
                Waiting for tenant's response...
              </p>
            </div>
          </div>
        );
      }
    } else if (offer.lastActionType === 'INITIATOR_COUNTERED') {
      if (offer.negotiationRound === 2) {
        return (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm font-medium">
                🔄 Tenant sent you a final counter offer
              </p>
              <p className="text-yellow-700 text-xs mt-1">
                This is your last chance to accept or reject
              </p>
            </div>
          </div>
        );
      }
    }
  }

  // Default case for pending offers
  if (offer.offerStatus === 'pending') {
    return (
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-800 text-sm font-medium">
          📋 New offer from tenant awaiting your response
        </p>
      </div>
    );
  }

  return null;
}
