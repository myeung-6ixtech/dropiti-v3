import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from 'next/font/google';
import "./globals.css";
import "@/styles/design-system.css";
import "@/styles/form-components.css";
import "@/styles/mobile-chat.css";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Providers from "@/components/Providers";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import MobileChatContainer from "@/components/chat/mobile/MobileChatContainer";
import MobileNotificationsContainer from "@/components/notifications/mobile/MobileNotificationsContainer";
import ClientOnboardingGate from "@/components/ClientOnboardingGate";
import CookieConsentAndAnalytics from "@/components/analytics/CookieConsentAndAnalytics";
import PWAInstallBanner from "@/components/common/PWAInstallBanner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Dropiti - Real Estate Platform',
    template: '%s | Dropiti'
  },
  description: "Find your perfect home with Dropiti - the leading real estate platform for property rentals and sales. Discover amazing properties with detailed listings, photos, and direct communication with landlords.",
  keywords: [
    "real estate",
    "property rental", 
    "apartments",
    "houses",
    "rent",
    "property search",
    "real estate platform",
    "dropiti",
    "Hong Kong real estate",
    "property listings",
    "rental properties",
    "property management",
    "landlord",
    "tenant",
    "property search platform",
  ],
  authors: [{ name: "Dropiti Team" }],
  creator: "Dropiti",
  publisher: "Dropiti",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dropiti.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'zh-HK': '/zh-HK',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dropiti.com',
    siteName: 'Dropiti',
    title: 'Dropiti - Real Estate Platform',
    description: "Find your perfect home with Dropiti - the leading real estate platform for property rentals and sales.",
    images: [
      {
        url: '/images/dropiti-homepage-001.webp',
        width: 1200,
        height: 630,
        alt: 'Dropiti — property search and listings',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dropiti - Real Estate Platform',
    description: "Find your perfect home with Dropiti - the leading real estate platform for property rentals and sales.",
    images: ['/images/dropiti-homepage-001.webp'],
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
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-6301512886533217" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dropiti" />
        <link rel="apple-touch-icon" href="/images/dropiti_logo.png" />
      </head>
      <body className={`${plusJakartaSans.className} antialiased`}>
        <Providers>
          <ClientOnboardingGate>
            <PWAInstallBanner />
            <div className="min-h-screen flex flex-col bg-white">
              <Navigation />
              <main className="flex-1 pb-16 md:pb-0">
                {children}
              </main>
              <MobileBottomNav />
            </div>
            <ToastContainer />
            <MobileChatContainer />
            <MobileNotificationsContainer />
          </ClientOnboardingGate>
          <CookieConsentAndAnalytics />
        </Providers>
      </body>
    </html>
  );
}
