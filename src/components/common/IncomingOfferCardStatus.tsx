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
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-800 text-sm font-medium">
          ✅ You accepted this tenant's offer
        </p>
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
      if (offer.negotiationRound === 1) {
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
            
            {/* Final Counter Offer Details */}
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tenant's Final Counter Offer</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">Rent:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {offer.proposingRentPrice ? formatCurrency(offer.proposingRentPrice, offer.proposingRentPriceCurrency || 'USD') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Lease Duration:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {offer.numLeasingMonths ? `${offer.numLeasingMonths} months` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Move-in Date:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {offer.moveInDate ? formatDate(offer.moveInDate) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Payment Frequency:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {offer.paymentFrequency ? offer.paymentFrequency : 'N/A'}
                  </span>
                </div>
              </div>
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
