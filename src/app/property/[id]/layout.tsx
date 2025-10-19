import { Metadata } from 'next';

interface PropertyLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const { propertiesAPI } = await import('@/lib/api-client');
    const response = await propertiesAPI.getPropertyByUuid(id);
    
    if (!response.success || !response.data) {
      return {
        title: 'Property Not Found',
        description: 'The requested property could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const property = response.data;
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
            url: property.display_image || '/images/dropiti_logo.png',
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
        images: [property.display_image || '/images/dropiti_logo.png'],
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
