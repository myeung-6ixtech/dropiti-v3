export const CLAIM_LISTING_SUPPORT_EMAIL = 'support@dropiti.com';

export function buildClaimListingMessage(params: {
  propertyTitle: string;
  propertyUuid: string;
  userEmail: string;
  userId: string;
}): { subject: string; body: string } {
  const subject = 'Listing ownership transfer request';
  const body = `Hi Dropiti,

I'd like to request a transfer of listing ownership for this property on Dropiti:

Listing: ${params.propertyTitle}
Listing ID: ${params.propertyUuid}
My account: ${params.userEmail} (user id: ${params.userId})

I am the legitimate landlord/agent for this property. Please let me know what verification you need.

Thank you.`;
  return { subject, body };
}

/** Digits only, no + prefix, for wa.me */
export function getWhatsAppBusinessDigits(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER?.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  return digits.length > 0 ? digits : null;
}

export function buildWhatsAppClaimUrl(messageBody: string): string | null {
  const digits = getWhatsAppBusinessDigits();
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(messageBody)}`;
}

export function buildMailtoClaimUrl(subject: string, body: string): string {
  return `mailto:${CLAIM_LISTING_SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
