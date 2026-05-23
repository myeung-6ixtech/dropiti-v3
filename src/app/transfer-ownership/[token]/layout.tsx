import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claim Your Property — Dropiti',
  description: 'You have been invited to register and claim ownership of a property listing on Dropiti.',
  robots: { index: false, follow: false },
};

/**
 * Minimal layout for the transfer-ownership page.
 * Intentionally does not include the dashboard nav or bottom bar —
 * this page is opened directly from a WhatsApp link by an external contact.
 */
export default function TransferOwnershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
