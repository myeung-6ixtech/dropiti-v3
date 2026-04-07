import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dropiti — Real Estate Platform',
    short_name: 'Dropiti',
    description:
      'Find your perfect home with Dropiti. Search properties on a map, manage listings, and chat directly with landlords and tenants.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/images/dropiti_logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/dropiti_logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
