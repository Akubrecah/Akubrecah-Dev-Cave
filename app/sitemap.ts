import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

const BASE_URL = siteConfig.url.endsWith('/') ? siteConfig.url.slice(0, -1) : siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/pricing',
    '/contact',
    '/pdf-tools',
    '/pdf-lab',
    '/kra-solutions',
    '/kra-solutions/nil-return',
    '/kra-solutions/audit-core',
    '/checkout',
    '/dashboard',
    '/sign-up',
    '/sign-in',
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}/en${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
