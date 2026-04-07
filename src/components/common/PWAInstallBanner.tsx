'use client';

import { FiX, FiDownload, FiShare } from 'react-icons/fi';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useHaptic } from '@/hooks/useHaptic';
import Image from 'next/image';

export default function PWAInstallBanner() {
  const { showBanner, canPrompt, isIOS, install, dismiss } = usePWAInstall();
  const { tap } = useHaptic();

  if (!showBanner) return null;

  const handleInstall = () => {
    tap('medium');
    install();
  };

  const handleDismiss = () => {
    tap('light');
    dismiss();
  };

  return (
    <div
      className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-200 shadow-sm animate-slide-down"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* App icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-purple-50 flex items-center justify-center">
          <Image
            src="/images/dropiti_logo.png"
            alt="Dropiti"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight mb-0">
            Get the Dropiti app
          </p>
          <p className="text-xs text-gray-500 leading-tight mt-0.5">
            {isIOS
              ? 'Tap Share then "Add to Home Screen"'
              : 'Install for faster access and offline use'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {canPrompt && (
            <button
              onClick={handleInstall}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 active:scale-95 transition-all"
            >
              <FiDownload className="w-3.5 h-3.5" />
              Install
            </button>
          )}
          {isIOS && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-full">
              <FiShare className="w-3.5 h-3.5" />
              Share
            </span>
          )}
          <button
            onClick={handleDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Dismiss install banner"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
