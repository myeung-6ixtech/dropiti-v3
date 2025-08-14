import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface OfferCardActionsProps {
  offer: {
    id: string;
    offerStatus: string;
    lastActionType?: string;
    negotiationRound?: number;
  };
  isIncomingOffer: boolean;
  onAcceptOffer?: (offerId: string) => void;
  onRejectOffer?: (offerId: string) => void;
  onCounterOffer?: (offerId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  onViewCounterOffer?: (offer: { id: string; offerStatus: string; lastActionType?: string; negotiationRound?: number }) => void;
  respondingToCounter?: boolean;
}

export default function OfferCardActions({
  offer,
  isIncomingOffer,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  onWithdrawOffer,
  onViewCounterOffer,
  respondingToCounter = false
}: OfferCardActionsProps) {
  // For incoming offers (landlord perspective)
  if (isIncomingOffer) {
    if (offer.offerStatus === 'pending') {
      if (offer.lastActionType === 'RECIPIENT_COUNTERED') {
        // Landlord has countered, waiting for tenant response
        return (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 font-medium">Pending Counter Offer</p>
              <p className="text-sm text-gray-500 mt-1">Waiting for tenant's response</p>
            </div>
          </div>
        );
      } else if (offer.negotiationRound && offer.negotiationRound >= 1) {
        // Landlord has already countered and cannot counter again
        return (
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 font-medium">Counter Offer Already Made</p>
                <p className="text-sm text-yellow-600 mt-1">You have already made a counter offer for this property</p>
              </div>
              <div className="flex space-x-3">
                {onAcceptOffer && (
                  <button
                    onClick={() => onAcceptOffer(offer.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                    disabled={respondingToCounter}
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Accept
                  </button>
                )}
                {onRejectOffer && (
                  <button
                    onClick={() => onRejectOffer(offer.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                    disabled={respondingToCounter}
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      } else {
        // First time - show Accept/Reject/Counter buttons
        return (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              {onAcceptOffer && (
                <button
                  onClick={() => onAcceptOffer(offer.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Accept
                </button>
              )}
              {onRejectOffer && (
                <button
                  onClick={() => onRejectOffer(offer.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Reject
                </button>
              )}
              {onCounterOffer && (
                <button
                  onClick={() => onCounterOffer(offer.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Counter
                </button>
              )}
            </div>
          </div>
        );
      }
    }

    if (offer.offerStatus === 'countered') {
      if (offer.lastActionType === 'RECIPIENT_COUNTERED') {
        // Show counter offer details and Accept/Reject buttons
        return (
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-4">
              {/* Counter Offer Details */}
              {offer.negotiationRound === 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-3 text-sm">Your Counter Offer Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-blue-700">
                        <span className="font-medium">Counter:</span> {/* Add currency icon and formatting here */}
                      </div>
                      <div className="flex items-center text-sm text-blue-700">
                        <span className="font-medium">Lease:</span> {/* Add lease info here */}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-blue-700">
                        <span className="font-medium">Move-in:</span> {/* Add move-in date here */}
                      </div>
                      <div className="text-sm text-blue-700">
                        <span className="font-medium">Payment:</span> {/* Add payment info here */}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-600">
                      <span className="font-medium">Note:</span> This is your counter offer. You cannot make another counter offer at this stage.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Accept/Reject Buttons */}
              <div className="flex space-x-3">
                {onAcceptOffer && (
                  <button
                    onClick={() => onAcceptOffer(offer.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Accept
                  </button>
                )}
                {onRejectOffer && (
                  <button
                    onClick={() => onRejectOffer(offer.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      } else {
        // Show Accept/Reject buttons and View Counter Offer button
        return (
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex space-x-3">
                {onAcceptOffer && (
                  <button
                    onClick={() => onAcceptOffer(offer.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Accept
                  </button>
                )}
                {onRejectOffer && (
                  <button
                    onClick={() => onRejectOffer(offer.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                )}
              </div>
              {onViewCounterOffer && (
                <button
                  onClick={() => onViewCounterOffer(offer)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
                >
                  View Counter Offer Details
                </button>
              )}
            </div>
          </div>
        );
      }
    }
  }

  // For outgoing offers (tenant perspective)
  if (offer.offerStatus === 'pending') {
    return (
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        {onWithdrawOffer && (
          <button
            onClick={() => onWithdrawOffer(offer.id)}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Withdraw
          </button>
        )}
      </div>
    );
  }

  // No actions for other statuses
  return null;
}
