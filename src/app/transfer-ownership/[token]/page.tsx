'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { authClasses } from '@/styles/auth';
import { parseFunctionsEnvelope, resolveApiPath } from '@/lib/nhost-functions';

// ── Types ─────────────────────────────────────────────────────────────────────

type PageStatus =
  | 'loading'
  | 'invalid'
  | 'expired'
  | 'used'
  | 'cancelled'
  | 'unauthenticated'
  | 'ready_to_claim'
  | 'claiming'
  | 'claimed'
  | 'error';

interface PropertyInfo {
  propertyUuid: string;
  title: string;
  location: string;
  rentalPrice: number;
  rentalPriceCurrency: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string | null;
}

interface ValidateResponse {
  success: boolean;
  status: 'valid' | 'expired' | 'used' | 'cancelled' | 'invalid';
  property: PropertyInfo | null;
  expiresAt: string | null;
  tokenUuid: string;
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

function daysUntil(isoDate: string): number {
  return Math.max(
    0,
    Math.ceil((new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
}

function formatExpiry(isoDate: string): string {
  const days = daysUntil(isoDate);
  const dateStr = new Date(isoDate).toLocaleDateString('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  if (days === 0) return `Expires today (${dateStr})`;
  if (days === 1) return `Expires tomorrow (${dateStr})`;
  return `Expires in ${days} days — ${dateStr}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PageFooter() {
  return (
    <footer className="text-center text-xs text-gray-400 py-6 mt-4">
      <Link href="/privacy-policy" className="hover:text-gray-600 transition-colors">
        Privacy Policy
      </Link>
      {' · '}
      <Link href="/terms-of-service" className="hover:text-gray-600 transition-colors">
        Terms of Service
      </Link>
    </footer>
  );
}

function PropertyCard({ property }: { property: PropertyInfo }) {
  return (
    <div className="dashboard-card overflow-hidden p-0 mb-0">
      {property.imageUrl && (
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 500px"
          />
        </div>
      )}
      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 leading-tight">{property.title}</h2>
        {property.location && (
          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="bg-gray-50 rounded-lg px-3 py-1 font-medium">
            {formatPrice(property.rentalPrice, property.rentalPriceCurrency)}/mo
          </span>
          <span className="bg-gray-50 rounded-lg px-3 py-1">{property.propertyType}</span>
          {property.bedrooms > 0 && (
            <span className="bg-gray-50 rounded-lg px-3 py-1">{property.bedrooms} bed</span>
          )}
          {property.bathrooms > 0 && (
            <span className="bg-gray-50 rounded-lg px-3 py-1">{property.bathrooms} bath</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center py-10 px-6">
      <div className="flex justify-center mb-4">{icon}</div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{description}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function InviteBanner({
  title,
  body,
  expiresAt,
}: {
  title: string;
  body: React.ReactNode;
  expiresAt?: string | null;
}) {
  return (
    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
      <p className="text-purple-800 text-sm font-medium mb-1">{title}</p>
      <p className="text-purple-700 text-sm leading-relaxed">{body}</p>
      {expiresAt && (
        <p className="mt-2 text-purple-600 text-xs">{formatExpiry(expiresAt)}</p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TransferOwnershipPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  const [status, setStatus] = useState<PageStatus>('loading');
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const callbackUrl = `/transfer-ownership/${token}`;
  const signUpUrl = `/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const signInUrl = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  // ── Validate token ──────────────────────────────────────────────────────
  const validate = useCallback(async () => {
    try {
      const validateUrl = resolveApiPath(
        `/api/v1/transfer-ownership/validate?token=${encodeURIComponent(token ?? '')}`,
        `client/transfer-ownership/validate?token=${encodeURIComponent(token ?? '')}`
      );
      const res = await fetch(validateUrl, { credentials: 'include' });
      const raw = await res.json();
      const parsed = parseFunctionsEnvelope<{
        status: ValidateResponse['status'];
        property: PropertyInfo | null;
        expiresAt: string | null;
        tokenUuid?: string;
      }>(raw);

      const data: ValidateResponse = parsed.success && parsed.data
        ? {
            success: true,
            status: parsed.data.status,
            property: parsed.data.property,
            expiresAt: parsed.data.expiresAt,
            tokenUuid: parsed.data.tokenUuid ?? token ?? '',
          }
        : (raw as ValidateResponse);

      if (!parsed.success && !data.success) {
        setStatus('error');
        return;
      }

      if (!data.status) {
        setStatus('error');
        return;
      }

      setProperty(data.property);
      setExpiresAt(data.expiresAt);

      if (data.status !== 'valid') {
        setStatus(data.status as PageStatus);
        return;
      }

      // authLoading is guaranteed false here — effect waits for auth to settle
      setStatus(isAuthenticated ? 'ready_to_claim' : 'unauthenticated');
    } catch {
      setStatus('error');
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (token && !authLoading) {
      validate();
    }
  }, [token, authLoading, validate]);

  // ── Claim handler ───────────────────────────────────────────────────────
  const handleClaim = async () => {
    if (!user?.id) return;
    setStatus('claiming');
    setClaimError(null);

    try {
      const claimUrl = resolveApiPath(
        '/api/v1/transfer-ownership/claim',
        'client/transfer-ownership/claim'
      );
      const res = await fetch(claimUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, userId: user.id }),
      });
      const raw = await res.json();
      const parsed = parseFunctionsEnvelope(raw);
      const data = parsed.success
        ? { success: true, ...(typeof parsed.data === 'object' && parsed.data ? parsed.data : {}) }
        : (raw as { success?: boolean; error?: string; code?: string });

      if (data.success) {
        setStatus('claimed');
        setTimeout(() => router.push('/dashboard/properties'), 3000);
      } else {
        setClaimError(data.error ?? 'Something went wrong. Please try again.');
        setStatus('ready_to_claim');
      }
    } catch {
      setClaimError('Network error. Please check your connection and try again.');
      setStatus('ready_to_claim');
    }
  };

  const mainClass = 'max-w-lg mx-auto px-4 pt-4 pb-16';

  // ── Render states ───────────────────────────────────────────────────────

  if (status === 'loading' || (status === 'unauthenticated' && authLoading)) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Verifying invitation&hellip;</p>
          </div>
        </div>
        <PageFooter />
      </>
    );
  }

  if (status === 'invalid' || status === 'error') {
    return (
      <>
        <main className={mainClass}>
          <StatusCard
            icon={
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </div>
            }
            title="This link is not valid"
            description="The invitation link you followed is not recognised. It may have been copied incorrectly. Please check the original WhatsApp message."
          />
        </main>
        <PageFooter />
      </>
    );
  }

  if (status === 'expired') {
    return (
      <>
        <main className={mainClass}>
          {property && <PropertyCard property={property} />}
          <StatusCard
            icon={
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
            title="Invitation has expired"
            description="This invitation link is no longer valid. Please contact the property manager or Dropiti support to request a new invitation link."
          >
            <a
              href="https://wa.me/60123456789"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Support
            </a>
          </StatusCard>
        </main>
        <PageFooter />
      </>
    );
  }

  if (status === 'used' || status === 'cancelled') {
    return (
      <>
        <main className={mainClass}>
          {property && <PropertyCard property={property} />}
          <StatusCard
            icon={
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
            title="Already claimed"
            description="This property has already been claimed by its owner. If you believe this is an error, please contact Dropiti support."
          >
            <Link href={signInUrl} className={`${authClasses.button} inline-flex items-center justify-center !w-auto px-5`}>
              Sign in to Dropiti
            </Link>
          </StatusCard>
        </main>
        <PageFooter />
      </>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <main className={`${mainClass} space-y-5`}>
          <InviteBanner
            title="You have been invited"
            expiresAt={expiresAt}
            body={
              <>
                Dropiti has received a rental enquiry for your property. Register or log in to
                claim ownership and manage this lead.
              </>
            }
          />

          {property && <PropertyCard property={property} />}

          <div className="space-y-3">
            <Link href={signUpUrl} className={`${authClasses.button} flex items-center justify-center !mb-0`}>
              Create a Free Account
            </Link>
            <Link href={signInUrl} className={`${authClasses.buttonSecondary} flex items-center justify-center`}>
              I already have an account — Sign in
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400">
            By continuing you agree to Dropiti&apos;s Terms of Service and Privacy Policy.
          </p>
        </main>
        <PageFooter />
      </>
    );
  }

  if (status === 'claimed') {
    return (
      <>
        <main className={mainClass}>
          <StatusCard
            icon={
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
            title="Property claimed!"
            description="You are now the owner of this listing on Dropiti. Redirecting you to your properties..."
          >
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto" />
          </StatusCard>
        </main>
        <PageFooter />
      </>
    );
  }

  // ── ready_to_claim / claiming ────────────────────────────────────────────
  return (
    <>
      <main className={`${mainClass} space-y-5`}>
        <InviteBanner
          title="Ready to claim your listing"
          expiresAt={expiresAt}
          body={
            <>
              You are signed in as{' '}
              <span className="font-semibold">{user?.email}</span>. Click below to
              transfer this listing into your Dropiti account.
            </>
          }
        />

        {property && <PropertyCard property={property} />}

        {claimError && (
          <div className={authClasses.error} role="alert">
            {claimError}
          </div>
        )}

        <button
          type="button"
          onClick={handleClaim}
          disabled={status === 'claiming'}
          className={`${authClasses.button} flex items-center justify-center !mb-0 disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {status === 'claiming' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Claiming&hellip;
            </>
          ) : (
            'Claim This Property'
          )}
        </button>

        <Link
          href={signInUrl}
          className="flex items-center justify-center w-full px-5 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          Sign in with a different account
        </Link>
      </main>
      <PageFooter />
    </>
  );
}
