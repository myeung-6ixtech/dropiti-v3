'use client';

import Head from 'next/head';
import { WithContext, Person } from 'schema-dts';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  structuredData?: Record<string, unknown>;
  keywords?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

export default function SEO({
  title,
  description,
  canonical,
  image = '/images/dropiti_logo.png',
  type = 'website',
  structuredData,
  keywords = [],
  noindex = false,
  nofollow = false,
}: SEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dropiti.com';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  const defaultKeywords = [
    'real estate',
    'property rental',
    'apartments',
    'houses',
    'rent',
    'property search',
    'real estate platform',
    'dropiti',
    'Hong Kong real estate',
    'property listings',
    'rental properties',
    'property management',
    'landlord',
    'tenant',
    'property search platform',
  ];

  const allKeywords = [...new Set([...defaultKeywords, ...keywords])];

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Robots Meta */}
      {noindex && <meta name="robots" content="noindex" />}
      {nofollow && <meta name="robots" content="nofollow" />}
      {!noindex && !nofollow && <meta name="robots" content="index, follow" />}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Dropiti" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@dropiti" />

      {/* Bing-specific Meta Tags */}
      <meta name="msvalidate.01" content={process.env.BING_VERIFICATION_ID || ''} />
      <meta name="msapplication-TileColor" content="#7c3aed" />
      <meta name="theme-color" content="#7c3aed" />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}

// Predefined structured data schemas for common pages
export const createPropertySchema = (property: {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  landlord: {
    name: string;
    email: string;
  };
}): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Place',
  '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/property/${property.id}`,
  name: property.title,
  description: property.description,
  address: {
    '@type': 'PostalAddress',
    streetAddress: property.address,
    addressCountry: 'HK',
  },
  numberOfRooms: property.bedrooms,
  amenityFeature: [
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Bedrooms',
      value: property.bedrooms,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Bathrooms',
      value: property.bathrooms,
    },
  ],
  image: property.images.map(img => ({
    '@type': 'ImageObject',
    url: img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_SITE_URL}${img}`,
  })),
});

export const createPersonSchema = (user: {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
}): WithContext<Person> => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/user/${user.id}`,
  name: user.name,
  email: user.email,
  description: user.bio,
  image: user.avatar ? {
    '@type': 'ImageObject',
    url: user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_SITE_URL}${user.avatar}`,
  } : undefined,
});

export const createWebsiteSchema = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/#website`,
  url: process.env.NEXT_PUBLIC_SITE_URL,
  name: 'Dropiti',
  description: 'Find your perfect home with Dropiti - the leading real estate platform for property rentals and sales.',
  publisher: {
    '@type': 'Organization',
    name: 'Dropiti',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/dropiti_logo.png`,
    },
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});
