import { Metadata } from 'next';
import { propertiesAPI } from '@/lib/api-client';

interface PropertyMetadata {
  title: string;
  description: string;
  image: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
}

export async function generatePropertyMetadata(
  propertyId: string
): Promise<Metadata> {
  try {
    // Fetch property data
    const response = await propertiesAPI.getPropertyByUuid(propertyId);
    
    if (!response.success || !response.data?.property) {
      // Fallback metadata if property not found
      return {
        title: 'Property Not Found - dropiti',
        description: 'The property you are looking for could not be found on dropiti.',
        openGraph: {
          title: 'Property Not Found - dropiti',
          description: 'The property you are looking for could not be found on dropiti.',
          images: ['/images/dropiti_logo.png'],
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Property Not Found - dropiti',
          description: 'The property you are looking for could not be found on dropiti.',
          images: ['/images/dropiti_logo.png'],
        },
      };
    }

    const property = response.data.property;
    
    // Get the main property image
    const propertyImage = property.image_url || 
                         property.display_image || 
                         (property.uploaded_images && property.uploaded_images.length > 0 ? property.uploaded_images[0] : null) ||
                         '/images/dropiti_logo.png';

    // Create property-specific metadata
    const title = `${property.title} - dropiti`;
    const description = `${property.description || `Beautiful ${property.bedrooms} bedroom, ${property.bathrooms} bathroom property in ${property.location}. Available for $${property.price?.toLocaleString()}/month.`}`;
    
    const metadata: Metadata = {
      title,
      description,
      keywords: [
        'real estate',
        'property rental',
        'apartment',
        'house',
        'rent',
        property.location,
        `${property.bedrooms} bedroom`,
        `${property.bathrooms} bathroom`,
        'dropiti'
      ],
      authors: [{ name: "dropiti" }],
      creator: "dropiti",
      publisher: "dropiti",
      metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dropiti.com'),
      alternates: {
        canonical: `/property/${propertyId}`,
      },
      openGraph: {
        title,
        description,
        url: `/property/${propertyId}`,
        siteName: 'dropiti',
        images: [
          {
            url: propertyImage,
            width: 1200,
            height: 630,
            alt: `${property.title} - ${property.location}`,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [propertyImage],
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
    };

    return metadata;
  } catch (error) {
    console.error('Error generating property metadata:', error);
    
    // Fallback metadata on error
    return {
      title: 'Property - dropiti',
      description: 'Discover amazing properties on dropiti - the leading real estate platform.',
      openGraph: {
        title: 'Property - dropiti',
        description: 'Discover amazing properties on dropiti - the leading real estate platform.',
        images: ['/images/dropiti-og-image.png'],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Property - dropiti',
        description: 'Discover amazing properties on dropiti - the leading real estate platform.',
        images: ['/images/dropiti-og-image.png'],
      },
    };
  }
}
