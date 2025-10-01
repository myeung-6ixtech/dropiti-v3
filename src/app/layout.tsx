import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/design-system.css";
import "@/styles/form-components.css";
import "@/styles/mobile-chat.css";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Providers from "@/components/Providers";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import MobileChatContainer from "@/components/chat/mobile/MobileChatContainer";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "dropiti - real estate platform",
  description: "Find your perfect home with dropiti - the leading real estate platform for property rentals and sales. Discover amazing properties with detailed listings, photos, and direct communication with landlords.",
  keywords: ["real estate", "property rental", "apartments", "houses", "rent", "property search", "real estate platform"],
  authors: [{ name: "dropiti" }],
  creator: "dropiti",
  publisher: "dropiti",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dropiti.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "dropiti - real estate platform",
    description: "Find your perfect home with dropiti - the leading real estate platform for property rentals and sales.",
    url: '/',
    siteName: 'dropiti',
    images: [
      {
        url: '/images/dropiti_logo.png',
        width: 1200,
        height: 630,
        alt: 'dropiti - real estate platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "dropiti - real estate platform",
    description: "Find your perfect home with dropiti - the leading real estate platform for property rentals and sales.",
    images: ['/images/dropiti_logo.png'],
    creator: '@dropiti',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-white">
            <Navigation />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <MobileBottomNav />
          </div>
          <ToastContainer />
          <MobileChatContainer />
        </Providers>
      </body>
    </html>
  );
}
