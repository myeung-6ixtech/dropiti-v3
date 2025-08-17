import { Offer } from '@/types/offer';
import { offerStatusClasses } from '@/styles/offer-card-status';

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
      <div className={offerStatusClasses.statusContainer}>
        {/* Final Accepted Terms Display */}
        <div className={offerStatusClasses.finalTermsContainer}>
          <h4 className={offerStatusClasses.finalTermsHeader}>
            🎯 Final Accepted Terms
          </h4>
          
          <div className={offerStatusClasses.finalTermsGrid}>
            {/* Rent and Lease Duration */}
            <div className={offerStatusClasses.finalTermsColumn}>
              <div className={offerStatusClasses.finalTermsRow}>
                <span className={offerStatusClasses.finalTermsLabel}>Monthly Rent:</span>
                <span className={offerStatusClasses.finalTermsValue}>
                  {formatCurrency(
                    offer.finalRentPrice || offer.proposingRentPrice, 
                    offer.finalRentPriceCurrency || offer.proposingRentPriceCurrency || 'HKD'
                  )}
                </span>
              </div>
              
              <div className={offerStatusClasses.finalTermsRow}>
                <span className={offerStatusClasses.finalTermsLabel}>Lease Duration:</span>
                <span className={offerStatusClasses.finalTermsValue}>
                  {offer.finalNumLeasingMonths || offer.numLeasingMonths} month{(offer.finalNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {/* Payment Frequency and Move-in Date */}
            <div className={offerStatusClasses.finalTermsColumn}>
              <div className={offerStatusClasses.finalTermsRow}>
                <span className={offerStatusClasses.finalTermsLabel}>Payment Frequency:</span>
                <span className={offerStatusClasses.finalTermsValue}>
                  {offer.finalPaymentFrequency || offer.paymentFrequency}
                </span>
              </div>
              
              <div className={offerStatusClasses.finalTermsRow}>
                <span className={offerStatusClasses.finalTermsLabel}>Move-in Date:</span>
                <span className={offerStatusClasses.finalTermsValue}>
                  {formatDate(offer.finalMoveInDate || offer.moveInDate)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Deal Completion Status */}
          <div className={offerStatusClasses.finalTermsDivider}>
            <div className={offerStatusClasses.finalTermsStatus}>
              <span className={offerStatusClasses.finalTermsStatusLabel}>Deal Status:</span>
              <span className={offerStatusClasses.finalTermsStatusBadge}>
                ✅ Deal Completed
              </span>
            </div>
          </div>
          
          {/* Bulk Rejection Information */}
          {bulkRejectionInfo && bulkRejectionInfo.rejectedOffersCount > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <div className="flex items-center">
                <span className="text-orange-600 mr-2">⚠️</span>
                <span className="text-sm font-medium text-orange-800">
                  Property Deal Finalized
                </span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                {bulkRejectionInfo.rejectedOffersCount} other pending offer{bulkRejectionInfo.rejectedOffersCount === 1 ? '' : 's'} automatically rejected when you accepted this deal.
              </p>
            </div>
          )}
        </div>
        
        {/* Status Message */}
        <div className={offerStatusClasses.statusMessage}>
          <p className={offerStatusClasses.statusMessageText}>
            ✅ You accepted this tenant's offer
          </p>
          {offer.finalAcceptedAt && (
            <p className={offerStatusClasses.statusMessageSubtext}>
              Accepted on {formatDate(offer.finalAcceptedAt)}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (offer.offerStatus === 'rejected') {
    return (
      <div className={offerStatusClasses.rejected.container}>
        <p className={offerStatusClasses.rejected.text}>
          ❌ You rejected this tenant's offer
        </p>
      </div>
    );
  }

  if (offer.offerStatus === 'withdrawn') {
    return (
      <div className={offerStatusClasses.withdrawn.container}>
        <p className={offerStatusClasses.withdrawn.text}>
          📝 Tenant withdrew their offer
        </p>
      </div>
    );
  }

  if (offer.offerStatus === 'countered') {
    if (offer.lastActionType === 'RECIPIENT_COUNTERED') {
      if (offer.negotiationRound === 1) {
        return (
          <div className={offerStatusClasses.counterContainer}>
            <div className={offerStatusClasses.counterRecipient.container}>
              <p className={offerStatusClasses.counterRecipient.text}>
                💬 You sent a counter offer to the tenant
              </p>
              <p className={offerStatusClasses.counterRecipient.subtext}>
                Waiting for tenant's response...
              </p>
            </div>
          </div>
        );
      }
    } else if (offer.lastActionType === 'INITIATOR_COUNTERED') {
      if (offer.negotiationRound === 2) {
        return (
          <div className={offerStatusClasses.counterContainer}>
            <div className={offerStatusClasses.counterInitiator.container}>
              <p className={offerStatusClasses.counterInitiator.text}>
                🔄 Tenant sent you a final counter offer
              </p>
              <p className={offerStatusClasses.counterInitiator.subtext}>
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
      <div className={offerStatusClasses.pending.container}>
        <p className={offerStatusClasses.pending.text}>
          📋 New offer from tenant awaiting your response
        </p>
      </div>
    );
  }

  return null;
}
