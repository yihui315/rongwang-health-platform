import { MetadataRoute } from "next";
import { getArticlesWithFallback } from "@/lib/cms";
import { listProducts } from "@/lib/data/products";
import { canonicalSolutionSlugs } from "@/lib/health/solutions";
import { freeToolSlugs } from "@/lib/marketing/free-tools";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = getSiteUrl();
  const products = await listProducts();
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/ai-consult`, changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE_URL}/products`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/articles`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/family`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/subscription`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const assessmentPages: MetadataRoute.Sitemap = canonicalSolutionSlugs.map((slug) => ({
    url: `${SITE_URL}/assessment/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const solutionPages: MetadataRoute.Sitemap = canonicalSolutionSlugs.map((slug) => ({
    url: `${SITE_URL}/solutions/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const toolPages: MetadataRoute.Sitemap = freeToolSlugs.map((slug) => ({
    url: `${SITE_URL}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.82,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const { articles } = await getArticlesWithFallback({ per_page: 500 });
    articlePages = articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    }));
  } catch (error) {
    console.error("[Sitemap] Failed to fetch CMS articles:", error);
  }

  return [...staticPages, ...assessmentPages, ...solutionPages, ...toolPages, ...articlePages, ...productPages];
}
