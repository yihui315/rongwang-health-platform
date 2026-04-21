import { NextRequest, NextResponse } from 'next/server';
import { getArticlesWithFallback } from '@/lib/cms';

/**
 * GET /api/cms/articles
 * 文章列表 — 桥接 GEOFlow API，自动回退静态数据
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '20', 10);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  try {
    const result = await getArticlesWithFallback({
      page,
      per_page: perPage,
      category,
      search,
    });

    return NextResponse.json({
      success: true,
      data: result.articles,
      pagination: result.pagination,
      source: result.source,
    });
  } catch (error) {
    console.error('[CMS Articles API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
