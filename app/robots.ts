import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

const BASE_URL = siteConfig.url.endsWith('/') ? siteConfig.url.slice(0, -1) : siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
