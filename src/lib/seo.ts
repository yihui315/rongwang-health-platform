/**
 * SEO 工具库
 * JSON-LD 结构化数据、Open Graph、Sitemap 生成
 */

import type { CMSArticle } from './cms';
import { getSiteUrl } from "@/lib/site";

const SITE_URL = getSiteUrl();
const SITE_NAME = '香港荣旺健康';

// ========================
// JSON-LD 结构化数据
// ========================

export function generateArticleJsonLd(article: CMSArticle): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    author: {
      '@type': 'Organization',
      name: article.author_name || SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: article.published_at,
    dateModified: article.updated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/articles/${article.slug}`,
    },
    articleSection: article.category_name,
    keywords: article.keywords,
  };
}

export function generateProductJsonLd(product: {
  name: string;
  description: string;
  price: number;
  memberPrice: number;
  brand: string;
  slug: string;
  origin: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: product.memberPrice,
      highPrice: product.price,
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/products/${product.slug}`,
    },
    countryOfOrigin: {
      '@type': 'Country',
      name: product.origin,
    },
  };
}

export function generateFAQJsonLd(
  faqs: Array<{ question: string; answer: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateOrganizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'AI驱动的跨境健康保健品电商平台，科学配方，品质直达。',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Chinese', 'English'],
    },
  };
}

// ========================
// Open Graph Metadata
// ========================

export function generateArticleMetadata(article: CMSArticle) {
  return {
    title: article.meta_title || `${article.title} | ${SITE_NAME}`,
    description: article.meta_description || article.excerpt,
    keywords: article.keywords?.split(',').map((k: string) => k.trim()),
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt,
      type: 'article' as const,
      url: `${SITE_URL}/articles/${article.slug}`,
      siteName: SITE_NAME,
      locale: 'zh_CN',
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at,
      authors: [article.author_name || SITE_NAME],
      section: article.category_name,
      tags: article.keywords?.split(',').map((k: string) => k.trim()),
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt,
    },
    alternates: {
      canonical: `${SITE_URL}/articles/${article.slug}`,
    },
  };
}

// ========================
// Sitemap Helpers
// ========================

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function generateSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    let xml = `  <url>\n    <loc>${escapeXml(entry.url)}</loc>`;
    if (entry.lastmod) xml += `\n    <lastmod>${entry.lastmod}</lastmod>`;
    if (entry.changefreq) xml += `\n    <changefreq>${entry.changefreq}</changefreq>`;
    if (entry.priority !== undefined) xml += `\n    <priority>${entry.priority}</priority>`;
    xml += '\n  </url>';
    return xml;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
