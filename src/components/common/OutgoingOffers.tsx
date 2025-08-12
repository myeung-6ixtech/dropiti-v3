'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { offersAPI } from '@/lib/api-client';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';

interface Offer {
  id: string;
  offerKey: string;
  propertyUuid: string;
  initiatorFirebaseUid: string;
  recipientFirebaseUid: string;
  proposingRentPrice: number;
  proposingRentPriceCurrency: string;
  numLeasingMonths: number;
  paymentFrequency: string;
  moveInDate: string;
  offerStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Recipient (landlord) details
  recipient?: {
    uuid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoUrl: string;
  } | null;
  // Property details
  property?: {
    title: string;
    location: string;
    rentalPrice: number;
    rentalPriceCurrency: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    imageUrl: string;
  } | null;
}

interface OutgoingOffersProps {
  initiatorFirebaseUid: string;
  title?: string;
  showPropertyInfo?: boolean;
}

export default function OutgoingOffers({ 
  initiatorFirebaseUid, 
  title = "Your Applications",
  showPropertyInfo = true 
}: OutgoingOffersProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch offers created by the initiator (logged-in user)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching offers by initiator:', initiatorFirebaseUid);
        
        const response = await offersAPI.getOffersByInitiator({
          initiatorFirebaseUid
        });

        if (response.success && response.data) {
          setOffers(response.data);
          console.log('Outgoing offers fetched successfully:', response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch offers');
        }
      } catch (err) {
        console.error('Error fetching outgoing offers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      } finally {
        setLoading(false);
      }
    };

    if (initiatorFirebaseUid) {
      fetchOffers();
    }
  }, [initiatorFirebaseUid]);

  const handleWithdrawOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, offerStatus: 'withdrawn' }
          : offer
      )
    );
    // TODO: Make API call to withdraw the offer
    console.log('Withdrawing offer:', offerId);
  };

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

  if (loading) {
    return <CenteredLoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Applications</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <CurrencyDollarIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-4">
            You haven't submitted any rental applications yet.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">
          {offers.length} application{offers.length !== 1 ? 's' : ''} submitted
        </p>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            {/* Offer Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {offer.recipient?.photoUrl ? (
                    <Image 
                      src={offer.recipient.photoUrl} 
                      alt={offer.recipient.displayName}
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
                    {offer.recipient?.displayName || 'Unknown Landlord'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(offer.createdAt)}
                  </p>
                </div>
              </div>
              {getStatusBadge(offer.offerStatus)}
            </div>

            {/* Property Info (if enabled) */}
            {showPropertyInfo && offer.property && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-900 mb-1">{offer.property.title}</h4>
                <p className="text-sm text-gray-600">{offer.property.location}</p>
                <p className="text-sm text-gray-600">
                  Listed at {formatCurrency(offer.property.rentalPrice, offer.property.rentalPriceCurrency)}/month
                </p>
                <p className="text-sm text-gray-500">
                  {offer.property.bedrooms} bed{offer.property.bedrooms !== 1 ? 's' : ''} • {offer.property.bathrooms} bath{offer.property.bathrooms !== 1 ? 's' : ''} • {offer.property.propertyType}
                </p>
              </div>
            )}

            {/* Offer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    Your Offer: {formatCurrency(offer.proposingRentPrice, offer.proposingRentPriceCurrency)}/month
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{offer.numLeasingMonths} month{offer.numLeasingMonths !== 1 ? 's' : ''} lease</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Move-in: {formatDate(offer.moveInDate)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{offer.recipient?.email || 'No email'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{offer.recipient?.phoneNumber || 'No phone'}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Payment:</span> {offer.paymentFrequency}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {offer.offerStatus === 'pending' && (
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleWithdrawOffer(offer.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Withdraw
                </button>
                {offer.property && (
                  <Link
                    href={`/property/${offer.propertyUuid}`}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center justify-center"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                    View Property
                  </Link>
                )}
              </div>
            )}

            {/* Status-specific messages */}
            {offer.offerStatus === 'accepted' && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-green-600 font-medium">✓ Your offer was accepted! Contact the landlord to proceed.</p>
              </div>
            )}

            {offer.offerStatus === 'rejected' && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-red-600 font-medium">✗ Your offer was not accepted</p>
              </div>
            )}

            {offer.offerStatus === 'countered' && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-blue-600 font-medium">↻ The landlord sent you a counter offer</p>
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  View Counter Offer
                </button>
              </div>
            )}

            {offer.offerStatus === 'withdrawn' && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium">↺ You withdrew this offer</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
