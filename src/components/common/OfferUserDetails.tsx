import { UserIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Offer } from '@/types/offer';

interface OfferUserDetailsProps {
  offer: Pick<Offer, 'createdAt' | 'initiator' | 'recipient'>;
  isIncomingOffer: boolean;
  offerStatus: string;
}

export default function OfferUserDetails({ offer, isIncomingOffer, offerStatus }: OfferUserDetailsProps) {
  // For incoming offers (landlord perspective), show initiator (tenant) details
  // For outgoing offers (tenant perspective), show recipient (landlord) details
  const userToShow = isIncomingOffer ? offer.initiator : offer.recipient;
  
  if (!userToShow) {
    return null;
  }

  const userLabel = isIncomingOffer ? 'Tenant' : 'Landlord';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      countered: { color: 'bg-blue-100 text-blue-800', text: 'Countered' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', text: 'Withdrawn' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <>
      {/* Offer Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {userToShow.photoUrl ? (
              <Image 
                src={userToShow.photoUrl} 
                alt={userToShow.displayName}
                width={20}
                height={20}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {userToShow.displayName || `Unknown ${userLabel}`}
            </h3>
            <p className="text-sm text-gray-500">
              dropiti user since {formatDate(offer.createdAt)}
            </p>
          </div>
        </div>
        {getStatusBadge(offerStatus)}
      </div>
    </>
  );
}
