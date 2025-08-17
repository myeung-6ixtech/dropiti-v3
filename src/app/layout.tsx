import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/design-system.css";
import Navigation from "@/components/Navigation";
import Providers from "@/components/Providers";
import ToastContainer from "@/components/ui/toast/ToastContainer";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Properties App - Find Your Perfect Home",
  description: "Search and discover properties for rent or sale",
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
            <main className="flex-1">
              {children}
            </main>
          </div>
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
