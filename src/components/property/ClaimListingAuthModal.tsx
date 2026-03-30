'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useResponsiveModal } from '@/hooks/useResponsiveModal';

interface ClaimListingAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClaimListingAuthModal({ isOpen, onClose }: ClaimListingAuthModalProps) {
  const router = useRouter();
  const { ModalComponent } = useResponsiveModal({
    isOpen,
    onClose,
    mobileTitle: 'Sign up to Claim Listing',
    mobileHeight: 'medium',
    modalClassName: 'max-w-md w-full mx-4',
    showCloseButton: false,
  });

  const goToSignup = () => {
    onClose();
    router.push('/auth/signup');
  };

  const goToLogin = () => {
    onClose();
    router.push('/auth/signin');
  };

  return (
    <ModalComponent>
      <div className="bg-white overflow-hidden">
        {/* Desktop only: mobile bottom sheet already shows title + close */}
        <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 pr-2 mb-0">Sign up to Claim Listing</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 shrink-0 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed mb-0">
            Log in or sign up with your Dropiti account to claim this listing.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed mb-0">
            By continuing, you agree to Dropiti&apos;s{' '}
            <Link
              href="/terms"
              className="font-medium text-purple-700 underline decoration-purple-300 underline-offset-2 hover:text-purple-800"
              onClick={onClose}
            >
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="font-medium text-purple-700 underline decoration-purple-300 underline-offset-2 hover:text-purple-800"
              onClick={onClose}
            >
              Privacy Policy
            </Link>
            .
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <button type="button" onClick={goToSignup} className="w-full btn-primary btn-small py-3">
              Continue with Dropiti
            </button>
            <button type="button" onClick={goToLogin} className="w-full btn-secondary btn-small py-3">
              Login
            </button>
          </div>
        </div>
      </div>
    </ModalComponent>
  );
}
