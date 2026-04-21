import { MetadataRoute } from 'next';
import { getArticlesWithFallback } from '@/lib/cms';
import { products } from '@/data/products';
import { plans } from '@/data/plans';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rongwang.health';

/**
 * 动态站点地图
 * 自动包含 GEOFlow CMS 文章 + 产品页 + 方案页
 * GEOFlow 不可用时自动回退静态数据
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: SITE_URL, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${SITE_URL}/quiz`, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${SITE_URL}/products`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${SITE_URL}/articles`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_URL}/family`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${SITE_URL}/subscription`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${SITE_URL}/dashboard`, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${SITE_URL}/shipping`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly' as const, priority: 0.2 },
  ];

  const planPages = plans.map((plan) => ({
    url: `${SITE_URL}/plans/${plan.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const productPages = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 文章页面 — 从 GEOFlow CMS 动态获取，回退静态数据
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const { articles } = await getArticlesWithFallback({ per_page: 500 });
    articlePages = articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('[Sitemap] Failed to fetch CMS articles:', error);
  }

  return [...staticPages, ...planPages, ...articlePages, ...productPages];
}
