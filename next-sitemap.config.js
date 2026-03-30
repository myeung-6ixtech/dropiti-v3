/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dropiti.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 7000,
  outDir: './public',
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/auth',
    '/auth/*',
    '/onboarding',
    '/onboarding/*',
    '/api',
    '/api/*',
    '/admin',
    '/admin/*',
    '/_next',
    '/_next/*',
    '/404',
    '/500',
  ],
  additionalPaths: async (config) => {
    // Add dynamic property pages
    // Note: In production, you'd fetch these from your database
    const propertyPaths = [
      '/property/sample-property-1',
      '/property/sample-property-2',
      '/property/sample-property-3',
    ];

    return propertyPaths.map((path) => ({
      loc: path,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }));
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/auth/',
          '/onboarding/',
          '/api/',
          '/admin/',
          '/_next/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/auth/',
          '/onboarding/',
          '/api/',
          '/admin/',
          '/_next/',
        ],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dropiti.com'}/sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    // Customize priority and changefreq based on path
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/property/')) {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path.startsWith('/search')) {
      priority = 0.8;
      changefreq = 'daily';
    } else if (path.startsWith('/user/')) {
      priority = 0.6;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
