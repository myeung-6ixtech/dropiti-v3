import { Metadata } from 'next';
import Footer from '@/components/common/Footer';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - Dropiti',
  description: 'Learn about Dropiti — Hong Kong\'s property rental platform connecting landlords and tenants. Backed by Cyberport Hong Kong as a Creative Micro Fund project.',
  keywords: ['about dropiti', 'dropiti team', 'hong kong real estate', 'cyberport', 'property platform'],
  openGraph: {
    title: 'About Us - Dropiti',
    description: 'Learn about Dropiti — Hong Kong\'s property rental platform connecting landlords and tenants.',
    images: ['/images/dropiti_logo.png'],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Dropiti</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We&apos;re building Hong Kong&apos;s most transparent property rental platform — connecting
            tenants and landlords through a fair, efficient, and technology-driven experience.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                Renting a property in Hong Kong has historically been a complex, opaque process. Dropiti
                was founded to change that — giving tenants and landlords the tools to communicate
                directly, negotiate fairly, and complete transactions with confidence.
              </p>
              <p className="text-gray-600">
                From browsing verified listings to submitting rental offers and reading honest reviews,
                every feature on Dropiti is designed to save time and build trust.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: '🏠', title: 'Verified Listings', desc: 'Every property goes through our listing guidelines to ensure accuracy and quality.' },
                { icon: '💬', title: 'Direct Communication', desc: 'Tenants and landlords communicate in real time — no middlemen, no hidden fees.' },
                { icon: '📋', title: 'Transparent Offers', desc: 'Submit, counter, and accept rental offers with a clear paper trail for both parties.' },
                { icon: '⭐', title: 'Honest Reviews', desc: 'Post-tenancy reviews build a trustworthy community for everyone on the platform.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cyberport */}
      <section className="bg-gray-50 border-y border-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Government-Backed Innovation</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            Dropiti is a proud recipient of the <strong>Cyberport Creative Micro Fund (CCMF)</strong> — a
            programme by Cyberport Hong Kong that supports early-stage technology start-ups with
            innovative and impactful ideas. This recognition reflects our commitment to advancing
            Hong Kong&apos;s property technology ecosystem.
          </p>
          <div className="flex items-center justify-center space-x-10">
            <Image
              src="/images/6ixtechlogo_full_white.png"
              alt="6ixTech"
              width={120}
              height={40}
              className="h-10 w-auto object-contain opacity-70"
            />
            <Image
              src="/images/cyberport_logo.png"
              alt="Cyberport Hong Kong"
              width={140}
              height={48}
              className="h-12 w-auto object-contain opacity-70"
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Have questions, feedback, or partnership enquiries? We&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:support@dropiti.com"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
            >
              support@dropiti.com
            </a>
            <Link
              href="/faq"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:border-gray-500 transition-colors"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
