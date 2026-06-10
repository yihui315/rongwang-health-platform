import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const GEOFLOW_API_URL = process.env.GEOFLOW_API_URL || "http://localhost:18080/api/v1";
const GEOFLOW_TOKEN = process.env.GEOFLOW_API_TOKEN || "";
const CACHE_FILE = "/tmp/_geoflow_cache_articles.json";

async function fetchPublishedArticles(): Promise<any[]> {
  const allArticles: any[] = [];
  let page = 1;

  while (true) {
    const url = `${GEOFLOW_API_URL}/articles?per_page=50&page=${page}&status=published`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${GEOFLOW_TOKEN}`, "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`GEOFlow API error: ${res.status}`);
    const json = await res.json();
    const items = json.data?.items || [];
    if (items.length === 0) break;
    allArticles.push(...items);
    const total = json.data?.pagination?.total || 0;
    if (allArticles.length >= total) break;
    page++;
  }
  return allArticles;
}

function formatArticle(article: any) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug || String(article.id),
    excerpt: article.excerpt || article.content?.substring(0, 200) || "",
    content: article.content || "",
    category: article.category_name || article.category?.name || "辅酶Q10科普",
    author: article.author_name || "运营官Darren",
    published_at: article.published_at,
    read_time: article.read_time || "5分钟",
    coverImage: article.featured_image || null,
    source: "geoflow",
  };
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();

  try {
    // 1. Fetch from GEOFlow
    const articles = await fetchPublishedArticles();

    // 2. Format
    const formatted = articles.map(formatArticle);

    // 3. Write cache file
    const cache = { updated_at: new Date().toISOString(), count: formatted.length, articles: formatted };
    const dir = join(CACHE_FILE, "..");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

    // 4. Log to DB
    if (prisma) {
      await prisma.geoFlowSyncLog.create({
        data: { articlesCount: formatted.length, status: "success", details: { cached: true, count: formatted.length } },
      });
    }

    // 5. Trigger ISR
    try {
      await fetch("https://rongwang.hk/api/cms/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "articles", count: formatted.length }),
      });
    } catch {}

    return NextResponse.json({ success: true, count: formatted.length, source: "geoflow" });
  } catch (err: any) {
    if (prisma) {
      await prisma.geoFlowSyncLog.create({
        data: { articlesCount: 0, status: "failed", details: { error: err.message } },
      });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const logs = await prisma.geoFlowSyncLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ logs });
}
