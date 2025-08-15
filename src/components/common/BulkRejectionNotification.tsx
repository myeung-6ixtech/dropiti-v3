interface BulkRejectionNotificationProps {
  rejectedOffersCount: number;
  propertyTitle?: string;
  acceptedOfferKey?: string;
}

export default function BulkRejectionNotification({
  rejectedOffersCount,
  propertyTitle,
  acceptedOfferKey
}: BulkRejectionNotificationProps) {
  if (rejectedOffersCount === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-orange-600 text-lg">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-orange-800">
            Property Deal Finalized
          </h4>
          <div className="mt-2 text-sm text-orange-700">
            <p>
              {rejectedOffersCount} other pending offer{rejectedOffersCount === 1 ? '' : 's'} for{' '}
              {propertyTitle ? (
                <span className="font-medium">"{propertyTitle}"</span>
              ) : (
                'this property'
              )}{' '}
              {rejectedOffersCount === 1 ? 'was' : 'were'} automatically rejected when another offer was accepted.
            </p>
            {acceptedOfferKey && (
              <p className="mt-1 text-xs text-orange-600">
                Accepted offer: {acceptedOfferKey}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
