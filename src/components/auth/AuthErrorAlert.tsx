'use client';

import Link from 'next/link';
import type { AuthErrorPresentation } from '@/types/auth-errors';
import { nhostAuthService } from '@/services/auth/nhostAuthService';
import { getCallbackUrlFromSearch } from '@/lib/oauthCallback';
import { useToast } from '@/context/ToastContext';

interface AuthErrorAlertProps {
  presentation: AuthErrorPresentation;
  onDismiss?: () => void;
}

export default function AuthErrorAlert({ presentation, onDismiss }: AuthErrorAlertProps) {
  const { showToast } = useToast();
  const showDevCode =
    process.env.NODE_ENV === 'development' && presentation.code !== 'unknown';

  const handleRetryGoogle = () => {
    const result = nhostAuthService.signInWithGoogle(getCallbackUrlFromSearch());
    if (!result.ok) {
      showToast('error', result.error);
    }
  };

  return (
    <div className="auth-error rounded-lg border border-red-200 bg-red-50 p-4 mb-4" role="alert">
      <div className="flex justify-between gap-2">
        <h3 className="text-sm font-semibold text-red-900">{presentation.title}</h3>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 text-lg leading-none shrink-0"
            aria-label="Dismiss"
          >
            &times;
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-red-800 leading-relaxed">{presentation.message}</p>

      {showDevCode && (
        <p className="mt-2 text-xs text-red-600/80 font-mono">Error code: {presentation.code}</p>
      )}

      {presentation.actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {presentation.actions.map((action, index) => {
            if (action.type === 'link') {
              return (
                <Link
                  key={`${action.type}-${index}`}
                  href={action.href}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-red-200 text-red-800 hover:bg-red-100 transition-colors"
                >
                  {action.label}
                </Link>
              );
            }
            if (action.type === 'retry_google') {
              return (
                <button
                  key={`${action.type}-${index}`}
                  type="button"
                  onClick={handleRetryGoogle}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-red-200 text-red-800 hover:bg-red-100 transition-colors"
                >
                  Try Google again
                </button>
              );
            }
            if (action.type === 'contact_support') {
              const email = action.email ?? 'support@dropiti.com';
              return (
                <a
                  key={`${action.type}-${index}`}
                  href={`mailto:${email}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-red-200 text-red-800 hover:bg-red-100 transition-colors"
                >
                  Contact support
                </a>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
