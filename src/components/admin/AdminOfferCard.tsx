'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Offer } from '@/types/offer';
import { parseFunctionsEnvelope, resolveApiPath } from '@/lib/nhost-functions';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminOffer extends Offer {
  /** E.164 digits (no + prefix) for the external agent / landlord contact */
  externalContact?: string;
}

type InvitationStatus = 'none' | 'pending_fresh' | 'pending_stale' | 'expired' | 'claimed' | 'loading';

interface InvitationState {
  status: InvitationStatus;
  daysRemaining: number;
  resendCount: number;
  canResend: boolean;
  invitationId?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function offerStatusLabel(status: string): { label: string; className: string } {
  const map: Record<string, { label: string; className: string }> = {
    pending:              { label: 'Pending',              className: 'bg-yellow-100 text-yellow-800' },
    tentatively_accepted: { label: 'Tentatively Accepted', className: 'bg-orange-100 text-orange-800' },
    accepted:             { label: 'Accepted',             className: 'bg-green-100 text-green-800' },
    rejected:             { label: 'Rejected',             className: 'bg-red-100 text-red-800' },
    countered:            { label: 'Counter Offer',        className: 'bg-blue-100 text-blue-800' },
    withdrawn:            { label: 'Withdrawn',            className: 'bg-gray-100 text-gray-800' },
    expired:              { label: 'Expired',              className: 'bg-orange-100 text-orange-800' },
    completed:            { label: 'Completed',            className: 'bg-green-100 text-green-800' },
  };
  return map[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ── OutreachActions ───────────────────────────────────────────────────────────

function OutreachActions({ offer, invitation, onAction }: {
  offer: AdminOffer;
  invitation: InvitationState;
  onAction: (action: 'send' | 'resend') => void;
}) {
  return (
    <div className="pt-3 border-t border-gray-100 mt-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Admin Outreach</p>
      <div className="flex flex-wrap gap-2">

        {/* ── WhatsApp Ownership Invitation ─────────────────────────────── */}
        {invitation.status === 'loading' && (
          <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400" />
            Checking invitation status&hellip;
          </div>
        )}

        {invitation.status === 'none' && (
          <button
            onClick={() => onAction('send')}
            disabled={!offer.externalContact}
            title={!offer.externalContact ? 'No external contact set for this listing' : 'Send WhatsApp ownership invitation'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <WhatsAppIcon />
            Send Ownership Invitation
          </button>
        )}

        {(invitation.status === 'pending_fresh' || invitation.status === 'pending_stale') && (
          <div className="flex items-center flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Invitation Sent &mdash; {invitation.daysRemaining} day{invitation.daysRemaining !== 1 ? 's' : ''} remaining
            </span>
            {invitation.canResend && (
              <button
                onClick={() => onAction('resend')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <WhatsAppIcon className="text-green-500" />
                Resend
              </button>
            )}
          </div>
        )}

        {invitation.status === 'expired' && (
          <button
            onClick={() => onAction('resend')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <WhatsAppIcon />
            Resend Invitation (Expired)
          </button>
        )}

        {invitation.status === 'claimed' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Listing Claimed
          </span>
        )}

        {/* ── Facebook DM (Phase 2) ─────────────────────────────────────── */}
        <button
          disabled
          title="Facebook DM outreach — coming soon"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
        >
          <FacebookIcon />
          Facebook DM
          <span className="ml-1 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full leading-none">Soon</span>
        </button>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function WhatsAppIcon({ className = 'text-white' }: { className?: string }) {
  return (
    <svg className={`w-3.5 h-3.5 ${className}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ── AdminOfferCard ────────────────────────────────────────────────────────────

interface AdminOfferCardProps {
  offer: AdminOffer;
}

export function AdminOfferCard({ offer }: AdminOfferCardProps) {
  const [invitation, setInvitation] = useState<InvitationState>({
    status: 'loading',
    daysRemaining: 0,
    resendCount: 0,
    canResend: false,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const propertyUuid = offer.propertyUuid;

  // ── Fetch invitation status ───────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const statusUrl = resolveApiPath(
        `/api/v1/admin/transfer-ownership/status?propertyUuid=${encodeURIComponent(propertyUuid)}`,
        `admin/transfer-ownership/status?propertyUuid=${encodeURIComponent(propertyUuid)}`
      );
      const res = await fetch(statusUrl, { credentials: 'include' });
      const raw = await res.json();
      const parsed = parseFunctionsEnvelope<{
        hasInvitation: boolean;
        data: {
          status: string;
          daysRemaining?: number;
          resendCount?: number;
          canResend?: boolean;
          hoursSinceSent?: number;
          invitationId?: number;
        } | null;
      }>(raw);
      const data = parsed.success && parsed.data
        ? { success: true, hasInvitation: parsed.data.hasInvitation, data: parsed.data.data }
        : (raw as {
            success: boolean;
            hasInvitation: boolean;
            data: {
              status: string;
              daysRemaining?: number;
              resendCount?: number;
              canResend?: boolean;
              hoursSinceSent?: number;
              invitationId?: number;
            };
          });

      if (!data.success || !data.hasInvitation) {
        setInvitation({ status: 'none', daysRemaining: 0, resendCount: 0, canResend: false });
        return;
      }

      const d = data.data;
      let uiStatus: InvitationStatus = 'none';

      if (d.status === 'used') {
        uiStatus = 'claimed';
      } else if (d.status === 'expired') {
        uiStatus = 'expired';
      } else if (d.status === 'pending') {
        uiStatus = d.hoursSinceSent < 24 ? 'pending_fresh' : 'pending_stale';
      }

      setInvitation({
        status: uiStatus,
        daysRemaining: d.daysRemaining ?? 0,
        resendCount: d.resendCount ?? 0,
        canResend: d.canResend ?? false,
        invitationId: d.invitationId,
      });
    } catch {
      setInvitation({ status: 'none', daysRemaining: 0, resendCount: 0, canResend: false });
    }
  }, [propertyUuid]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ── Action handler ────────────────────────────────────────────────────
  const handleAction = async (action: 'send' | 'resend') => {
    setActionLoading(true);
    setActionMessage(null);

    try {
      const legacyEndpoint =
        action === 'send'
          ? '/api/v1/admin/transfer-ownership/invite'
          : '/api/v1/admin/transfer-ownership/resend';
      const functionsEndpoint =
        action === 'send'
          ? 'admin/transfer-ownership/invite'
          : 'admin/transfer-ownership/resend';

      const res = await fetch(resolveApiPath(legacyEndpoint, functionsEndpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          propertyUuid,
          externalContact: offer.externalContact,
        }),
      });

      const raw = await res.json();
      const parsed = parseFunctionsEnvelope(raw);
      const data = parsed.success
        ? {
            success: true,
            message: 'Invitation sent',
            data: parsed.data,
          }
        : (raw as { success: boolean; message?: string; error?: string });

      if (data.success) {
        setActionMessage({
          type: 'success',
          text: data.message ?? 'Invitation sent successfully',
        });
        await fetchStatus();
      } else {
        setActionMessage({ type: 'error', text: data.error ?? 'Action failed' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = offerStatusLabel(offer.offerStatus);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* ── Property info ─────────────────────────────────────────────── */}
      {offer.property && (
        <div className="flex gap-3">
          {offer.property.imageUrl && (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={offer.property.imageUrl}
                alt={offer.property.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{offer.property.title}</p>
            <p className="text-xs text-gray-500 truncate">{offer.property.location}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {offer.property.propertyType} &middot; {offer.property.bedrooms}bd &middot; {offer.property.bathrooms}ba
            </p>
          </div>
        </div>
      )}

      {/* ── Offer details ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Proposed Rent</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(offer.proposingRentPrice, offer.proposingRentPriceCurrency)}/mo
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Duration</p>
          <p className="text-sm font-semibold text-gray-900">{offer.numLeasingMonths} months</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Move-in</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(offer.moveInDate)}</p>
        </div>
      </div>

      {/* ── Offer status + tenant ─────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
        {offer.initiator && (
          <p className="text-xs text-gray-500">
            From <span className="font-medium text-gray-700">{offer.initiator.displayName}</span>
            {' '}({offer.initiator.email})
          </p>
        )}
      </div>

      {/* ── External contact ──────────────────────────────────────────── */}
      {offer.externalContact && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          External contact: +{offer.externalContact}
        </p>
      )}

      {/* ── Action feedback ───────────────────────────────────────────── */}
      {actionLoading && (
        <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400" />
          Sending invitation&hellip;
        </div>
      )}
      {actionMessage && !actionLoading && (
        <p className={`text-xs rounded-lg px-3 py-2 ${actionMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {actionMessage.text}
        </p>
      )}

      {/* ── Outreach actions strip ────────────────────────────────────── */}
      {!actionLoading && (
        <OutreachActions offer={offer} invitation={invitation} onAction={handleAction} />
      )}
    </div>
  );
}
