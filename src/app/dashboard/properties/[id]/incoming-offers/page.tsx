'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface Offer {
  id: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantAvatar?: string;
  offeredPrice: number;
  leaseDuration: number;
  paymentFrequency: 'full' | 'monthly';
  paymentInterval?: number;
  moveInDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  createdAt: string;
  message?: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  type: string;
}

export default function IncomingOffersPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProperty({
        id: propertyId || '1',
        name: 'Modern 2BR Apartment in Central',
        address: '123 Hennessy Road, Central, Hong Kong',
        price: 25000,
        type: 'Apartment'
      });

      setOffers([
        {
          id: '1',
          tenantName: 'Sarah Johnson',
          tenantEmail: 'sarah.johnson@email.com',
          tenantPhone: '+852 9123 4567',
          offeredPrice: 24000,
          leaseDuration: 12,
          paymentFrequency: 'monthly',
          paymentInterval: 1,
          moveInDate: '2024-03-01',
          status: 'pending',
          createdAt: '2024-02-15T10:30:00Z',
          message: 'I really love this apartment and would be a great tenant. I can move in immediately and pay the security deposit upfront.'
        },
        {
          id: '2',
          tenantName: 'Michael Chen',
          tenantEmail: 'michael.chen@email.com',
          tenantPhone: '+852 9876 5432',
          offeredPrice: 23500,
          leaseDuration: 24,
          paymentFrequency: 'monthly',
          paymentInterval: 3,
          moveInDate: '2024-03-15',
          status: 'pending',
          createdAt: '2024-02-14T14:20:00Z',
          message: 'Looking for a long-term rental. I have stable income and excellent rental history.'
        },
        {
          id: '3',
          tenantName: 'Emma Wilson',
          tenantEmail: 'emma.wilson@email.com',
          tenantPhone: '+852 8765 4321',
          offeredPrice: 25000,
          leaseDuration: 12,
          paymentFrequency: 'full',
          moveInDate: '2024-03-01',
          status: 'pending',
          createdAt: '2024-02-13T09:15:00Z',
          message: 'I can pay the full year upfront. This would be perfect for my work situation.'
        }
      ]);
      setLoading(false);
    }, 500);
  }, [propertyId]);

  const handleAcceptOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: 'accepted' as const }
          : offer
      )
    );
    // Here you would typically make an API call to accept the offer
  };

  const handleRejectOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: 'rejected' as const }
          : offer
      )
    );
    // Here you would typically make an API call to reject the offer
  };

  const handleCounterOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: 'countered' as const }
          : offer
      )
    );
    // Here you would typically open a counter offer modal
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Offer['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      countered: { color: 'bg-blue-100 text-blue-800', text: 'Countered' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Property not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Properties
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Incoming Offers</h1>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium">Property:</span>
              <span className="ml-2">{property.name}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Address:</span>
              <span className="ml-2">{property.address}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Listed Price:</span>
              <span className="ml-2 font-semibold text-gray-900">{formatCurrency(property.price)}/month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {offers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-400 mb-4">
              <CurrencyDollarIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
            <p className="text-gray-500">Offers from potential tenants will appear here.</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Offer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {offer.tenantAvatar ? (
                        <Image src={offer.tenantAvatar} alt={offer.tenantName} width={48} height={48} className="w-12 h-12 rounded-full" />
                      ) : (
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{offer.tenantName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {offer.tenantEmail}
                        </span>
                        <span className="flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {offer.tenantPhone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(offer.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(offer.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      Offered Price
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(offer.offeredPrice)}/month
                    </div>
                    <div className="text-xs text-gray-500">
                      {offer.offeredPrice < property.price ? 'Below asking' : 'At/Above asking'}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Lease Duration
                    </div>
                    <div className="font-semibold text-gray-900">
                      {offer.leaseDuration} months
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      Payment Frequency
                    </div>
                    <div className="font-semibold text-gray-900">
                      {offer.paymentFrequency === 'full' ? 'Full Payment' : 'Monthly'}
                    </div>
                    {offer.paymentFrequency === 'monthly' && offer.paymentInterval && (
                      <div className="text-xs text-gray-500">
                        Every {offer.paymentInterval} month(s)
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Move-in Date
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(offer.moveInDate)}
                    </div>
                  </div>
                </div>

                {/* Message */}
                {offer.message && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700">{offer.message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {offer.status === 'pending' && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Accept Offer
                    </button>
                    <button
                      onClick={() => handleCounterOffer(offer.id)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      Counter Offer
                    </button>
                    <button
                      onClick={() => handleRejectOffer(offer.id)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Reject Offer
                    </button>
                  </div>
                )}

                {/* Status-specific actions */}
                {offer.status === 'accepted' && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-green-600 font-medium">✓ Offer accepted</p>
                  </div>
                )}

                {offer.status === 'rejected' && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-red-600 font-medium">✗ Offer rejected</p>
                  </div>
                )}

                {offer.status === 'countered' && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-blue-600 font-medium">↻ Counter offer sent</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
