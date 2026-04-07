import { Metadata } from 'next';
import { Suspense } from 'react';
import TenantMarketplaceContent from './TenantMarketplaceContent';

export const metadata: Metadata = {
  title: 'Tenant Marketplace - dropiti',
  description: 'Discover qualified tenants looking for rental properties. Browse tenant profiles and find the perfect match for your property.',
  keywords: ['tenant marketplace', 'tenant profiles', 'rental tenants', 'property tenants', 'dropiti'],
  openGraph: {
    title: 'Tenant Marketplace - dropiti',
    description: 'Discover qualified tenants looking for rental properties. Browse tenant profiles and find the perfect match for your property.',
    images: ['/images/dropiti-homepage-001.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tenant Marketplace - dropiti',
    description: 'Discover qualified tenants looking for rental properties. Browse tenant profiles and find the perfect match for your property.',
    images: ['/images/dropiti-homepage-001.webp'],
  },
};

export default function TenantMarketplacePage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <TenantMarketplaceContent />
      </Suspense>
    </div>
  );
}
