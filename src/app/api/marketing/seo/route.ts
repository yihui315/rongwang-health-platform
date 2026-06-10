import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  const where = postId ? { postId } : {};
  const reports = await prisma.seoReport.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const body = await req.json();
  const { postId } = body;
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  const post = await prisma.marketingPost.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // Generate SEO score based on title/content analysis
  const title = post.title;
  const content = post.content;
  const issues: Array<{ severity: string; message: string; field: string }> = [];
  let score = 70;

  if (title.length < 15) { issues.push({ severity: "error", message: "标题过短（建议≥15字）", field: "title" }); score -= 20; }
  else if (title.length > 60) { issues.push({ severity: "warning", message: "标题过长（建议≤60字）", field: "title" }); score -= 10; }

  if (!content.includes(post.title)) { issues.push({ severity: "warning", message: "Meta描述未包含关键词", field: "metaDescription" }); score -= 10; }
  if (content.length < 300) { issues.push({ severity: "error", message: "内容过短（建议≥300字）", field: "content" }); score -= 15; }

  const hasKeywords = ["辅酶Q10", "CoQ10", "心脏健康", "营养补充"].some(k => content.includes(k));
  if (!hasKeywords) { issues.push({ severity: "warning", message: "内容缺少核心关键词", field: "keywords" }); score -= 10; }

  const suggestions = [
    "在文章开头自然嵌入关键词",
    "添加内部链接到产品页",
    "补充JSON-LD结构化数据",
    "添加FAQ结构化数据",
  ];

  const report = await prisma.seoReport.create({
    data: {
      postId,
      title: title.substring(0, 60),
      keywords: ["辅酶Q10", "心脏健康", "营养补充"],
      score: Math.max(0, Math.min(100, score)),
      issues,
      suggestions,
      jsonLdStatus: "missing",
      wikipediaStatus: "not_started",
    },
  });

  // Update post seoScore
  await prisma.marketingPost.update({ where: { id: postId }, data: { seoScore: score } });

  return NextResponse.json({ report }, { status: 201 });
}