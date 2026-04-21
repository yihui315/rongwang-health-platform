import { NextResponse } from 'next/server';
import { getCMSClient } from '@/lib/cms';

/**
 * GET /api/cms/categories
 * 分类列表 — 桥接 GEOFlow catalog API
 */
export async function GET() {
  try {
    const client = getCMSClient();
    const catMap = await client.getCategories();

    return NextResponse.json({
      success: true,
      data: Object.values(catMap),
    });
  } catch (error) {
    // Fallback: return hardcoded categories
    const fallbackCategories = [
      { id: 1, name: '抗疲劳', slug: 'fatigue', article_count: 0 },
      { id: 2, name: '深度睡眠', slug: 'sleep', article_count: 0 },
      { id: 3, name: '免疫防护', slug: 'immune', article_count: 0 },
      { id: 4, name: '压力缓解', slug: 'stress', article_count: 0 },
      { id: 5, name: '营养科普', slug: 'nutrition', article_count: 0 },
    ];

    return NextResponse.json({
      success: true,
      data: fallbackCategories,
      source: 'static',
    });
  }
}
