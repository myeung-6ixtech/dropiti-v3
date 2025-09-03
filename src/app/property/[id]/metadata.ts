import { Metadata } from 'next';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_PROPERTY_BY_UUID_QUERY = `
  query GetPropertyByUuid($property_uuid: uuid!) {
    real_estate_property_listing(where: { property_uuid: { _eq: $property_uuid } }, limit: 1) {
      id
      property_uuid
      title
      description
      address
      property_type
      rental_space
      num_bedroom
      num_bathroom
      gross_area_size
      gross_area_size_unit
      furnished
      pets_allowed
      amenities
      display_image
      uploaded_images
      rental_price
      rental_price_currency
      availability_date
      is_public
      status
      created_at
      updated_at
      landlord_firebase_uid
    }
  }
`;

// Server-side function to fetch property data directly from database
async function fetchPropertyData(propertyId: string) {
  try {
    const data = await executeQuery(GET_PROPERTY_BY_UUID_QUERY, { property_uuid: propertyId });
    
    const typedData = data as {
      real_estate_property_listing?: Array<{
        id: string;
        property_uuid: string;
        title: string;
        description: string;
        address: string;
        property_type: string;
        rental_space: string;
        num_bedroom: number;
        num_bathroom: number;
        gross_area_size: number;
        gross_area_size_unit: string;
        furnished: boolean;
        pets_allowed: boolean;
        amenities: string[];
        display_image: string;
        uploaded_images: string[];
        rental_price: number;
        rental_price_currency: string;
        availability_date: string | null;
        is_public: boolean;
        status: string;
        created_at: string;
        updated_at: string;
        landlord_firebase_uid: string;
      }>;
    };

    if (!typedData.real_estate_property_listing || typedData.real_estate_property_listing.length === 0) {
      return null;
    }

    const property = typedData.real_estate_property_listing[0];
    
    return {
      success: true,
      data: {
        property: {
          id: property.id,
          property_uuid: property.property_uuid,
          title: property.title,
          description: property.description,
          address: property.address,
          property_type: property.property_type,
          rental_space: property.rental_space,
          bedrooms: property.num_bedroom,
          bathrooms: property.num_bathroom,
          gross_area_size: property.gross_area_size,
          gross_area_size_unit: property.gross_area_size_unit,
          furnished: property.furnished,
          pets_allowed: property.pets_allowed,
          amenities: property.amenities,
          display_image: property.display_image,
          uploaded_images: property.uploaded_images,
          price: property.rental_price,
          rental_price_currency: property.rental_price_currency,
          availability_date: property.availability_date,
          is_public: property.is_public,
          status: property.status,
          created_at: property.created_at,
          updated_at: property.updated_at,
          owner_id: property.landlord_firebase_uid,
          // Add location field for compatibility
          location: typeof property.address === 'string' ? property.address : 'Location not specified'
        }
      }
    };
  } catch (error) {
    console.error('Error fetching property data for metadata:', error);
    return null;
  }
}

export async function generatePropertyMetadata(
  propertyId: string
): Promise<Metadata> {
  try {
    // Fetch property data using server-side fetch
    const response = await fetchPropertyData(propertyId);
    
    if (!response || !response.success || !response.data?.property) {
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
    const propertyImage = property.display_image || 
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
