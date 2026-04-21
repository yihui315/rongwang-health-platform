/**
 * GEOFlow CMS Service Layer
 *
 * 荣旺健康 ↔ GEOFlow API 桥接
 * 负责从 GEOFlow 获取文章内容、分类信息等
 */

// ========================
// Types
// ========================

export interface CMSArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'review' | 'published';
  review_status: 'pending' | 'approved' | 'rejected';
  category_id: number | null;
  category_name: string;
  category_slug: string;
  author_id: number | null;
  author_name: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  read_time?: string;
  featured_image?: string;
  // 荣旺扩展 (静态回退用)
  coverColor?: string;
  relatedPlan?: string;
  sections?: ArticleSection[];
}

export interface ArticleSection {
  heading: string;
  content: string;
  highlight?: {
    icon: string;
    title: string;
    text: string;
  };
}

export interface CMSCategory {
  id: number;
  name: string;
  slug: string;
}

export interface CMSPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface CMSArticleListResponse {
  items: CMSArticle[];
  pagination: CMSPagination;
}

// ========================
// Config
// ========================

const GEOFLOW_API_URL = process.env.GEOFLOW_API_URL || 'http://localhost:18080/api/v1';
const GEOFLOW_API_TOKEN = process.env.GEOFLOW_API_TOKEN || '';

// ========================
// Category Cache
// ========================

let _categoryCache: Record<number, CMSCategory> | null = null;
let _categoryCacheTime = 0;
const CATEGORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ========================
// HTTP Client
// ========================

class GEOFlowClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers,
    };

    const res = await fetch(url, {
      ...options,
      headers,
      next: { revalidate: 60 }, // ISR: revalidate every 60s
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'Unknown error');
      throw new GEOFlowError(
        `GEOFlow API error: ${res.status} ${res.statusText}`,
        res.status,
        errorBody
      );
    }

    const json = await res.json();
    return json.data ?? json;
  }

  // ---- Categories ----

  async getCategories(): Promise<Record<number, CMSCategory>> {
    const now = Date.now();
    if (_categoryCache && now - _categoryCacheTime < CATEGORY_CACHE_TTL) {
      return _categoryCache;
    }

    const data = await this.request<{
      categories: CMSCategory[];
    }>('/catalog');

    const map: Record<number, CMSCategory> = {};
    for (const cat of data.categories) {
      map[cat.id] = cat;
    }
    _categoryCache = map;
    _categoryCacheTime = now;
    return map;
  }

  // ---- Articles ----

  async listArticles(params: {
    page?: number;
    per_page?: number;
    status?: string;
    category?: string;
    search?: string;
  } = {}): Promise<CMSArticleListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    const raw = await this.request<{
      items: Record<string, unknown>[];
      pagination: CMSPagination;
    }>(`/articles${query ? `?${query}` : ''}`);

    // Enrich with category names
    const catMap = await this.getCategories();

    const items: CMSArticle[] = raw.items.map((item) => {
      const catId = item.category_id as number;
      const cat = catMap[catId];
      return {
        id: item.id as number,
        title: item.title as string,
        slug: item.slug as string,
        content: (item.content as string) || '',
        excerpt: (item.excerpt as string) || (item.meta_description as string) || '',
        status: (item.status as CMSArticle['status']) || 'published',
        review_status: (item.review_status as CMSArticle['review_status']) || 'approved',
        category_id: catId,
        category_name: cat?.name || '',
        category_slug: cat?.slug || '',
        author_id: (item.author_id as number) || null,
        author_name: (item.author_name as string) || 'AI编辑',
        published_at: (item.published_at as string) || null,
        created_at: (item.created_at as string) || '',
        updated_at: (item.updated_at as string) || '',
        meta_title: item.meta_title as string,
        meta_description: item.meta_description as string,
        keywords: item.keywords as string,
        featured_image: item.featured_image as string,
      };
    });

    return { items, pagination: raw.pagination };
  }

  async getArticle(id: number): Promise<CMSArticle> {
    const raw = await this.request<Record<string, unknown>>(`/articles/${id}`);
    const catMap = await this.getCategories();
    const catId = raw.category_id as number;
    const cat = catMap[catId];

    return {
      id: raw.id as number,
      title: raw.title as string,
      slug: raw.slug as string,
      content: (raw.content as string) || '',
      excerpt: (raw.excerpt as string) || (raw.meta_description as string) || '',
      status: (raw.status as CMSArticle['status']) || 'published',
      review_status: (raw.review_status as CMSArticle['review_status']) || 'approved',
      category_id: catId,
      category_name: cat?.name || '',
      category_slug: cat?.slug || '',
      author_id: (raw.author_id as number) || null,
      author_name: (raw.author_name as string) || 'AI编辑',
      published_at: (raw.published_at as string) || null,
      created_at: (raw.created_at as string) || '',
      updated_at: (raw.updated_at as string) || '',
      meta_title: raw.meta_title as string,
      meta_description: raw.meta_description as string,
      keywords: raw.keywords as string,
      featured_image: raw.featured_image as string,
    };
  }

  async getArticleBySlug(slug: string): Promise<CMSArticle | null> {
    try {
      // Step 1: 列出所有已发布文章，按 slug 匹配
      const result = await this.listArticles({ status: 'published', per_page: 100 });
      const match = result.items.find(a => a.slug === slug);
      if (!match) return null;

      // Step 2: 用 ID 获取完整内容（列表不含 content）
      const full = await this.getArticle(match.id);
      return full;
    } catch {
      return null;
    }
  }

  // ---- Health Check ----

  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/catalog');
      return true;
    } catch {
      return false;
    }
  }
}

// ========================
// Error Class
// ========================

export class GEOFlowError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public body: string
  ) {
    super(message);
    this.name = 'GEOFlowError';
  }
}

// ========================
// Singleton Client
// ========================

let _client: GEOFlowClient | null = null;

export function getCMSClient(): GEOFlowClient {
  if (!_client) {
    _client = new GEOFlowClient(GEOFLOW_API_URL, GEOFLOW_API_TOKEN);
  }
  return _client;
}

// ========================
// Helper: Fallback to static data
// ========================

export async function getArticlesWithFallback(params: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
}): Promise<{
  articles: CMSArticle[];
  pagination: CMSPagination;
  source: 'cms' | 'static';
}> {
  try {
    const client = getCMSClient();
    const result = await client.listArticles({
      ...params,
      status: 'published',
    });
    return {
      articles: result.items,
      pagination: result.pagination,
      source: 'cms',
    };
  } catch (error) {
    console.warn('[CMS] GEOFlow unavailable, using static fallback:', error instanceof Error ? error.message : error);
    // Fallback to static articles
    const { articles: staticArticles } = await import('@/data/articles');

    let filtered = [...staticArticles];
    if (params.category && params.category !== '全部') {
      filtered = filtered.filter(a => a.category === params.category);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q)
      );
    }

    const page = params.page || 1;
    const perPage = params.per_page || 20;
    const start = (page - 1) * perPage;
    const paged = filtered.slice(start, start + perPage);

    return {
      articles: paged.map((a, i) => ({
        id: i + 1,
        title: a.title,
        slug: a.slug,
        content: a.sections.map(s => s.content).join('\n\n'),
        excerpt: a.excerpt,
        status: 'published' as const,
        review_status: 'approved' as const,
        category_id: null,
        category_name: a.category,
        category_slug: '',
        author_id: null,
        author_name: a.author,
        published_at: a.publishedAt,
        created_at: a.publishedAt,
        updated_at: a.publishedAt,
        coverColor: a.coverColor,
        read_time: a.readTime,
        relatedPlan: a.relatedPlan,
        sections: a.sections,
      })),
      pagination: {
        page,
        per_page: perPage,
        total: filtered.length,
        total_pages: Math.ceil(filtered.length / perPage),
      },
      source: 'static',
    };
  }
}

export async function getArticleBySlugWithFallback(
  slug: string
): Promise<{ article: CMSArticle | null; source: 'cms' | 'static' }> {
  try {
    const client = getCMSClient();
    const article = await client.getArticleBySlug(slug);
    if (article) return { article, source: 'cms' };
  } catch {
    // fall through to static
  }

  const { getArticleBySlug } = await import('@/data/articles');
  const staticArticle = getArticleBySlug(slug);
  if (!staticArticle) return { article: null, source: 'static' };

  return {
    article: {
      id: 0,
      title: staticArticle.title,
      slug: staticArticle.slug,
      content: staticArticle.sections.map(s => s.content).join('\n\n'),
      excerpt: staticArticle.excerpt,
      status: 'published',
      review_status: 'approved',
      category_id: null,
      category_name: staticArticle.category,
      category_slug: '',
      author_id: null,
      author_name: staticArticle.author,
      published_at: staticArticle.publishedAt,
      created_at: staticArticle.publishedAt,
      updated_at: staticArticle.publishedAt,
      coverColor: staticArticle.coverColor,
      read_time: staticArticle.readTime,
      relatedPlan: staticArticle.relatedPlan,
      sections: staticArticle.sections,
    },
    source: 'static',
  };
}
