'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GoogleAnalytics } from '@next/third-parties/google';

const STORAGE_KEY = 'dropiti_cookie_consent';

type ConsentState = 'unknown' | 'pending' | 'accepted' | 'declined';

/**
 * Cookie consent (floating card, Dropiti purple CTAs + gray text to match the marketing homepage)
 * and GA4 via `@next/third-parties/google`. Shown until the user chooses; choice is stored in
 * localStorage. Analytics loads only after Accept. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (e.g. G-…).
 */
export default function CookieConsentAndAnalytics() {
  const [consent, setConsent] = useState<ConsentState>('unknown');
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'accepted' || stored === 'declined') {
        setConsent(stored);
      } else {
        setConsent('pending');
      }
    } catch {
      setConsent('pending');
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      /* ignore */
    }
    setConsent('accepted');
  };

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined');
    } catch {
      /* ignore */
    }
    setConsent('declined');
  };

  return (
    <>
      {consent === 'accepted' && gaId ? <GoogleAnalytics gaId={gaId} /> : null}

      {consent === 'pending' ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[100] p-4 md:p-6 pointer-events-none"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
        >
          <div className="mx-auto max-w-3xl pointer-events-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-900/10 md:flex md:items-end md:justify-between md:gap-6 md:p-6">
            <div className="mb-4 md:mb-0">
              <h2
                id="cookie-consent-title"
                className="text-base font-semibold text-gray-900"
              >
                Cookies & analytics
              </h2>
              <p
                id="cookie-consent-desc"
                className="mt-2 text-sm leading-relaxed text-gray-600"
              >
                We use cookies to improve your experience and optional analytics to understand how
                Dropiti is used. By accepting, you allow us to load Google Analytics. You can change
                your mind anytime by clearing site data for this domain.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Read our{' '}
                <Link
                  href="/cookies"
                  className="font-medium text-purple-700 underline decoration-purple-300 underline-offset-2 hover:text-purple-800"
                >
                  cookie notice
                </Link>{' '}
                for details.
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={decline}
                className="btn-secondary btn-small order-2 sm:order-1"
              >
                Decline
              </button>
              <button type="button" onClick={accept} className="btn-primary btn-small order-1 sm:order-2">
                Accept
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
