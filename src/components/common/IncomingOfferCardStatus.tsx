import { Offer } from '@/types/offer';
import Link from 'next/link';
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
      <div className="space-y-3">
        {/* Status Message */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              {offer.finalAcceptedAt && (
              <h3 className="text-sm font-medium text-purple-800 mb-0">
                ✅ You accepted this tenant's offer. Accepted on {formatDate(offer.finalAcceptedAt)}. Write a <Link href="/dashboard/reviews">Review</Link>.
              </h3> )}
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
                  You sent a counter offer to the tenant. Waiting for tenant's response...
                </h3>
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
