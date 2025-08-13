'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getSafeProfileImage } from '@/lib/utils';
import CreateOfferModal from './CreateOfferModal';

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
  currentRentPrice?: number;
  currentRentPriceCurrency?: string;
  currentNumLeasingMonths?: number;
  currentMoveInDate?: string;
  currentPaymentFrequency?: string;
  negotiationRound?: number;
  lastActionBy?: 'initiator' | 'recipient';
  initiator?: {
    uuid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoUrl: string;
  } | null;
  recipient?: {
    uuid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoUrl: string;
  } | null;
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

interface OfferCardProps {
  offer: Offer;
  currentUserFirebaseUid: string;
  showPropertyInfo?: boolean;
  onAcceptOffer?: (offerId: string) => void;
  onRejectOffer?: (offerId: string) => void;
  onCounterOffer?: (offerId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
}

export default function OfferCard({ 
  offer, 
  currentUserFirebaseUid,
  showPropertyInfo = true,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  onWithdrawOffer
}: OfferCardProps) {
  const [isCounterOfferModalOpen, setIsCounterOfferModalOpen] = useState(false);

  const isInitiator = offer.initiatorFirebaseUid === currentUserFirebaseUid;
  const isRecipient = offer.recipientFirebaseUid === currentUserFirebaseUid;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      countered: { color: 'bg-blue-100 text-blue-800', text: 'Countered' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', text: 'Withdrawn' },
      expired: { color: 'bg-orange-100 text-orange-800', text: 'Expired' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const displayUser = isInitiator ? offer.recipient : offer.initiator;
  const displayUserLabel = isInitiator ? 'Landlord' : 'Tenant';

  const getActionButtons = () => {
    if (offer.offerStatus !== 'pending') return null;

    if (isRecipient) {
      return (
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
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
              onClick={() => setIsCounterOfferModalOpen(true)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Counter
            </button>
          )}
        </div>
      );
    } else if (isInitiator) {
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
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {displayUser?.photoUrl ? (
              <Image 
                src={getSafeProfileImage(displayUser.photoUrl, '/src/assets/img/Portrait_Placeholder.png')} 
                alt={displayUser.displayName}
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
              {displayUser?.displayName || `Unknown ${displayUserLabel}`}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(offer.createdAt)}
            </p>
          </div>
        </div>
        {getStatusBadge(offer.offerStatus)}
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>
              {isInitiator ? 'Your Offer' : 'Offered'}: {formatCurrency(offer.proposingRentPrice, offer.proposingRentPriceCurrency)}/month
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
            <span>{displayUser?.email || 'No email'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{displayUser?.phoneNumber || 'No phone'}</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Payment:</span> {offer.paymentFrequency}
          </div>
        </div>
      </div>

      {offer.offerStatus === 'countered' && offer.currentRentPrice && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Counter Offer Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-blue-700">
                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-blue-500" />
                <span>
                  Counter: {formatCurrency(offer.currentRentPrice, offer.currentRentPriceCurrency || 'HKD')}/month
                </span>
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                <span>{offer.currentNumLeasingMonths || offer.numLeasingMonths} month{(offer.currentNumLeasingMonths || offer.numLeasingMonths) !== 1 ? 's' : ''} lease</span>
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                <span>Move-in: {formatDate(offer.currentMoveInDate || offer.moveInDate)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-blue-700">
                <span className="font-medium">Payment Frequency:</span> {offer.currentPaymentFrequency || offer.paymentFrequency}
              </div>
              <div className="text-sm text-blue-700">
                <span className="font-medium">Negotiation Round:</span> {offer.negotiationRound || 1}
              </div>
              <div className="text-sm text-blue-700">
                <span className="font-medium">Last Action:</span> {offer.lastActionBy === 'recipient' ? 'Landlord' : 'Tenant'} countered
              </div>
            </div>
          </div>
        </div>
      )}

      {getActionButtons()}

      {isCounterOfferModalOpen && onCounterOffer && (
        <CreateOfferModal
          isOpen={isCounterOfferModalOpen}
          onClose={() => setIsCounterOfferModalOpen(false)}
          propertyId={offer.propertyUuid}
          currentPrice={offer.proposingRentPrice}
          mode="counter"
          offerId={offer.id}
          existingOffer={{
            rentalPrice: offer.proposingRentPrice,
            leaseDuration: offer.numLeasingMonths,
            paymentFrequency: offer.paymentFrequency as 'monthly' | 'quarterly' | 'yearly',
            moveInDate: offer.moveInDate
          }}
          onOfferSubmit={() => {
            onCounterOffer(offer.id);
            setIsCounterOfferModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
