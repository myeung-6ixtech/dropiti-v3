'use client';

import { useState, useEffect } from 'react';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminOfferCard, AdminOffer } from '@/components/admin/AdminOfferCard';
import { OfferStatus } from '@/types/offer';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminIncomingOffersProps {
  /** Scope to a single listing. Omit to show all admin-listing offers. */
  propertyUuid?: string;
  statusFilter?: OfferStatus;
  title?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminIncomingOffers({
  propertyUuid,
  statusFilter,
  title = 'Incoming Offers',
}: AdminIncomingOffersProps) {
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (propertyUuid) params.set('propertyUuid', propertyUuid);
        if (statusFilter)  params.set('status', statusFilter);

        const res = await fetch(`/api/v1/admin/offers/incoming?${params.toString()}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          setOffers(data.data);
        } else {
          throw new Error(data.error ?? 'Failed to fetch offers');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [propertyUuid, statusFilter]);

  if (loading) return <CenteredLoadingSpinner />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto">
        <h3 className="text-base font-medium text-red-800 mb-2">Error Loading Offers</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <EmptyState
        icon="📬"
        title="No Incoming Offers"
        description={
          propertyUuid
            ? 'This listing has no offers yet. When a tenant submits an offer it will appear here.'
            : 'No offers have been submitted on admin-managed listings yet.'
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {offers.length} offer{offers.length !== 1 ? 's' : ''} received
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <AdminOfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
