import { Offer } from '@/types/offer';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface IncomingOfferCardStatusProps {
  offer: Offer;
  bulkRejectionInfo?: {
    rejectedOffersCount: number;
    rejectedOffers: Array<{ id: string; offerKey: string }>;
  };
}

export default function IncomingOfferCardStatus({
  offer,
  bulkRejectionInfo
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
      <div className="space-y-4">
        {/* Final Accepted Terms Display */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800 mb-0">
                🎯 Final Accepted Terms
              </h3>
              <div className="mt-2 text-sm mb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rent and Lease Duration */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-purple-700">
                      <span className="font-medium">Monthly Rent: </span> {formatCurrency(
                        offer.finalRentPrice || offer.proposingRentPrice, 
                        offer.finalRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD'
                      )}
                    </div>
                    <div className="flex items-center text-sm text-purple-700">
                      <span className="font-medium">Lease Duration: </span> {offer.finalNumLeasingMonths || offer.numLeasingMonths} month{(offer.finalNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {/* Payment Frequency and Move-in Date */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-purple-700">
                      <span className="font-medium">Payment Frequency: </span> {offer.finalPaymentFrequency || offer.paymentFrequency}
                    </div>
                    <div className="flex items-center text-sm text-purple-700">
                      <span className="font-medium">Move-in Date: </span> {formatDate(offer.finalMoveInDate || offer.moveInDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Message */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800 mb-0">
                ✅ You accepted this tenant's offer
              </h3>
              <div className="mt-2 text-sm mb-0">
                {offer.finalAcceptedAt && (
                  <p className="text-sm text-gray-600 mb-0">
                    Accepted on {formatDate(offer.finalAcceptedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bulk Rejection Information */}
        {bulkRejectionInfo && bulkRejectionInfo.rejectedOffersCount > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800 mb-0">
                  ⚠️ Property Deal Finalized
                </h3>
                <div className="mt-2 text-sm mb-0">
                  <p className="text-sm text-gray-600 mb-0">
                    {bulkRejectionInfo.rejectedOffersCount} other pending offer{bulkRejectionInfo.rejectedOffersCount === 1 ? '' : 's'} automatically rejected when you accepted this deal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (offer.offerStatus === 'rejected') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800 mb-0">
              ❌ You rejected this tenant's offer
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (offer.offerStatus === 'withdrawn') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800 mb-0">
              📝 Tenant withdrew their offer
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (offer.offerStatus === 'countered') {
    if (offer.lastActionType === 'RECIPIENT_COUNTERED') {
      if (offer.negotiationRound === 1) {
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800 mb-0">
                  💬 You sent a counter offer to the tenant
                </h3>
                <div className="mt-2 text-sm mb-0">
                  <p className="text-sm text-gray-600 mb-0">
                    Waiting for tenant's response...
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else if (offer.lastActionType === 'INITIATOR_COUNTERED') {
      if (offer.negotiationRound === 2) {
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800 mb-0">
                  🔄 Tenant sent you a final counter offer
                </h3>
                <div className="mt-2 text-sm mb-0">
                  <p className="text-sm text-gray-600 mb-0">
                    This is your last chance to accept or reject
                  </p>
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
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800 mb-0">
              📋 New offer from tenant awaiting your response
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
