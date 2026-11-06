import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alliberamelcercle.digital';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages = [
    { path: '', priority: 1 },
    { path: '/experiencia', priority: 0.8 },
    { path: '/aviso-legal', priority: 0.3 },
    { path: '/privacidad', priority: 0.3 },
    { path: '/cookies', priority: 0.3 },
    { path: '/condiciones', priority: 0.3 },
    { path: '/desistimiento', priority: 0.3 },
  ];

  return pages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: page.priority,
  }));
}
