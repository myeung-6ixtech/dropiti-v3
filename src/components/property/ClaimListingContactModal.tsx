'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useResponsiveModal } from '@/hooks/useResponsiveModal';
import {
  buildClaimListingMessage,
  buildMailtoClaimUrl,
  buildWhatsAppClaimUrl,
} from '@/lib/claimListingContact';

interface ClaimListingContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  propertyUuid: string;
  userEmail: string;
  userId: string;
}

export default function ClaimListingContactModal({
  isOpen,
  onClose,
  propertyTitle,
  propertyUuid,
  userEmail,
  userId,
}: ClaimListingContactModalProps) {
  const { ModalComponent } = useResponsiveModal({
    isOpen,
    onClose,
    mobileTitle: 'Claim this listing',
    mobileHeight: 'medium',
    modalClassName: 'max-w-md w-full mx-4',
    showCloseButton: false,
  });

  const { subject, body } = buildClaimListingMessage({
    propertyTitle,
    propertyUuid,
    userEmail,
    userId,
  });

  const whatsappUrl = buildWhatsAppClaimUrl(body);
  const mailtoUrl = buildMailtoClaimUrl(subject, body);

  return (
    <ModalComponent>
      <div className="bg-white overflow-hidden">
        <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 pr-2 mb-0">Claim this listing</h2>
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
            Choose how to reach our team. We&apos;ll use your message to verify ownership and transfer this
            listing to your account when approved.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full btn-primary btn-small py-3 text-center bg-[#25D366] hover:bg-[#20BD5A] border-transparent text-white"
              >
                Message on WhatsApp
              </a>
            ) : null}
            <a
              href={mailtoUrl}
              onClick={onClose}
              className={
                whatsappUrl
                  ? 'w-full btn-secondary btn-small py-3 text-center'
                  : 'w-full btn-primary btn-small py-3 text-center bg-black text-white hover:bg-gray-800 border-transparent'
              }
            >
              Email support
            </a>
          </div>

          {!whatsappUrl ? (
            <p className="text-xs text-gray-500 mb-0">You can reach our team by email using the button above.</p>
          ) : null}
        </div>
      </div>
    </ModalComponent>
  );
}
