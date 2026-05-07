import { Metadata } from 'next';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_PROPERTY_META = `
  query GetPropertyMeta($property_uuid: uuid!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $property_uuid } }, limit: 1) {
      title
      description
      rental_price
      num_bedroom
      num_bathroom
      display_image
    }
  }
`;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface PropertyLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  if (!UUID_RE.test(id.trim())) {
    return {
      title: 'Property | Dropiti',
      description: 'Find your perfect home with Dropiti - the leading real estate platform.',
      robots: { index: false, follow: false },
    };
  }

  try {
    const data = await executeQuery(GET_PROPERTY_META, { property_uuid: id.trim() }) as {
      real_estate_property_listing?: Array<{
        title: string;
        description: string;
        rental_price: number;
        num_bedroom: number;
        num_bathroom: number;
        display_image: string;
      }>;
    };

    const property = data.real_estate_property_listing?.[0];

    if (!property) {
      return {
        title: 'Property Not Found',
        description: 'The requested property could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dropiti.com';
    
    // Format price for display
    const formattedPrice = new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
    }).format(property.rental_price || 0);

    // Create property-specific title and description
    const title = `${property.title} - ${formattedPrice} | Dropiti`;
    const description = `${property.title} - ${formattedPrice}. ${property.description?.substring(0, 150)}... Find this and more properties on Dropiti.`;

    return {
      title,
      description,
      keywords: [
        'property rental',
        'apartment',
        'house',
        'rent',
        'Hong Kong',
        'real estate',
        property.title,
        `${property.num_bedroom} bedroom`,
        `${property.num_bathroom} bathroom`,
        formattedPrice,
      ],
      openGraph: {
        title,
        description,
        url: `${siteUrl}/property/${id}`,
        siteName: 'Dropiti',
        images: [
          {
            url: property.display_image || '/images/dropiti-homepage-001.webp',
            width: 1200,
            height: 630,
            alt: property.title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [property.display_image || '/images/dropiti-homepage-001.webp'],
      },
      alternates: {
        canonical: `${siteUrl}/property/${id}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for property:', error);
    return {
      title: 'Property | Dropiti',
      description: 'Find your perfect home with Dropiti - the leading real estate platform.',
    };
  }
}

export default function PropertyLayout({ children }: PropertyLayoutProps) {
  return <>{children}</>;
}
