import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

const BASE_URL = siteConfig.url.endsWith('/') ? siteConfig.url.slice(0, -1) : siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  // Public routes only
  const publicRoutes = [
    '',
    '/about',
    '/pricing',
    '/contact',
    '/pdf-tools',
    '/pdf-lab',
    '/kra-solutions',
    '/kra-solutions/nil-return',
    '/kra-solutions/audit-core',
  ];

  // We only support 'en' and 'sw' (if sw exists, otherwise just en)
  // For now, let's keep it simple and just do 'en' as in original
  // But removing private routes is the priority
  
  return publicRoutes.map((route) => ({
    url: `${BASE_URL}/en${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly' as any,
    priority: route === '' ? 1 : route.startsWith('/kra-solutions') || route === '/pdf-tools' ? 0.9 : 0.7,
  }));
}
