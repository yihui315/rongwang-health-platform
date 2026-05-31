import type { MetadataRoute } from 'next';
import { healthScenarios } from '@/src/data/health-scenarios';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rongwang.hk';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...healthScenarios.map((scenario) => ({
      url: `${baseUrl}/solutions/${scenario.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
