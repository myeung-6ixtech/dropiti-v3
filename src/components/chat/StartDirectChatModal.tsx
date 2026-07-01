'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useResponsiveModal } from '@/hooks/useResponsiveModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { chatAPI } from '@/lib/chat-api';
import { getSafeProfileImage } from '@/lib/utils';
import { DEFAULT_AVATAR_URL } from '@/constants';
import { OFFER_ERRORS } from '@/types/error-messages';

const MAX_MESSAGE_LENGTH = 2000;

function buildDefaultMessage(recipientName: string): string {
  const firstName = recipientName.trim().split(/\s+/)[0] || 'there';
  return `Hi ${firstName}, I saw your tenant profile on Dropiti and would like to connect.`;
}

export interface StartDirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientUserId: string;
  recipientName: string;
  recipientAvatar?: string;
  callerRole?: 'landlord' | 'tenant';
  recipientRole?: 'landlord' | 'tenant';
}

export default function StartDirectChatModal({
  isOpen,
  onClose,
  recipientUserId,
  recipientName,
  recipientAvatar,
  callerRole = 'landlord',
  recipientRole = 'tenant',
}: StartDirectChatModalProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { ModalComponent } = useResponsiveModal({
    isOpen,
    onClose,
    mobileTitle: 'Send a message',
    mobileHeight: 'medium',
    modalClassName: 'max-w-md w-full mx-4',
    showCloseButton: false,
  });

  useEffect(() => {
    if (isOpen) {
      setMessage(buildDefaultMessage(recipientName));
      setIsSending(false);
    }
  }, [isOpen, recipientName]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || !authUser?.id) return;

    if (authUser.id === recipientUserId) {
      showToast('error', OFFER_ERRORS.CANNOT_CHAT_SELF);
      return;
    }

    setIsSending(true);
    try {
      const { roomId } = await chatAPI.getOrCreateRoom(
        authUser.id,
        recipientUserId,
        callerRole,
        recipientRole,
      );

      if (!roomId) {
        showToast('error', OFFER_ERRORS.FAILED_TO_CREATE_CHAT);
        return;
      }

      await chatAPI.sendMessage(roomId, authUser.id, trimmed);

      onClose();
      const params = new URLSearchParams({
        roomId,
        name: recipientName,
      });
      router.push(`/dashboard/chat?${params.toString()}`);
    } catch (error) {
      console.error('[StartDirectChatModal] failed to start chat', error);
      showToast('error', OFFER_ERRORS.FAILED_TO_START_CHAT);
    } finally {
      setIsSending(false);
    }
  };

  const canSend = Boolean(message.trim()) && !isSending;

  return (
    <ModalComponent>
      <div className="bg-white overflow-hidden">
        <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 pr-2 mb-0">Send a message</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="p-2 shrink-0 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src={getSafeProfileImage(recipientAvatar, DEFAULT_AVATAR_URL)}
              alt={recipientName}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-0 truncate">{recipientName}</p>
              <p className="text-xs text-gray-500 mb-0">Your message starts a direct chat</p>
            </div>
          </div>

          <div>
            <label htmlFor="start-chat-message" className="sr-only">
              Message
            </label>
            <textarea
              id="start-chat-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              rows={4}
              disabled={isSending}
              className="form-input w-full resize-none text-sm"
              placeholder="Write your message..."
            />
            <p className="text-xs text-gray-400 mt-1 mb-0 text-right">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="btn-secondary btn-small py-2.5 flex-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="form-button py-2.5 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </div>
      </div>
    </ModalComponent>
  );
}
