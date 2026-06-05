'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Offer, OfferUser } from '@/types/offer';
import { usersAPI } from '@/lib/api-client';
import { calculatePlatformDuration, getSafeProfileImage } from '@/lib/utils';
import { DEFAULT_AVATAR_URL } from '@/constants';

interface OfferUserDetailsProps {
  offer: Pick<Offer, 'createdAt' | 'initiator' | 'recipient' | 'initiatorUserId' | 'recipientUserId'>;
  isIncomingOffer: boolean;
  offerStatus: string;
}

function mapRealEstateUserToOfferUser(
  row: Record<string, unknown>,
  fallbackId: string,
): OfferUser {
  const displayName =
    (typeof row.display_name === 'string' && row.display_name.trim()) ||
    (typeof row.displayName === 'string' && row.displayName.trim()) ||
    (typeof row.email === 'string' ? row.email.split('@')[0] : '') ||
    'User';
  return {
    uuid: String(row.uuid ?? fallbackId),
    displayName,
    email: String(row.email ?? ''),
    photoUrl: (row.photo_url ?? row.photoUrl) as string | undefined,
  };
}

export default function OfferUserDetails({ offer, isIncomingOffer, offerStatus }: OfferUserDetailsProps) {
  const embeddedUser = isIncomingOffer ? offer.initiator : offer.recipient;
  const profileUserId = isIncomingOffer ? offer.initiatorUserId : offer.recipientUserId;
  const userLabel = isIncomingOffer ? 'Tenant' : 'Landlord';

  const [fallbackUser, setFallbackUser] = useState<OfferUser | null>(null);
  const userToShow = embeddedUser ?? fallbackUser;

  useEffect(() => {
    if (embeddedUser?.displayName || !profileUserId) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await usersAPI.getUserByNhostUserId(profileUserId);
        if (!cancelled && res.success && res.data) {
          setFallbackUser(
            mapRealEstateUserToOfferUser(res.data as unknown as Record<string, unknown>, profileUserId),
          );
        }
      } catch (error) {
        console.error('[OfferUserDetails] failed to load counterparty user', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [embeddedUser?.displayName, profileUserId]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      tentatively_accepted: { color: 'bg-yellow-100 text-yellow-800', text: 'Tentatively Accepted' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      countered: { color: 'bg-blue-100 text-blue-800', text: 'Countered' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', text: 'Withdrawn' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={getSafeProfileImage(userToShow?.photoUrl, DEFAULT_AVATAR_URL)}
            alt={userToShow?.displayName ?? userLabel}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_AVATAR_URL;
            }}
          />
        </div>
        <div>
          <h3 className="font-medium text-sm text-gray-900 mb-0">
            {profileUserId ? (
              <Link
                href={`/user/${profileUserId}`}
                className="hover:text-blue-600 hover:underline transition-colors"
              >
                {userToShow?.displayName || `Unknown ${userLabel}`}
              </Link>
            ) : (
              userToShow?.displayName || `Unknown ${userLabel}`
            )}
          </h3>
          <p className="text-sm text-gray-500 mb-0">
            dropiti user since {calculatePlatformDuration(offer.createdAt)}
          </p>
        </div>
      </div>
      {getStatusBadge(offerStatus)}
    </div>
  );
}
