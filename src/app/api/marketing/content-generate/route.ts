/**
 * 自有 AI 营销内容生成 API
 * 替代 geoFlow 核心能力：直接用 DeepSeek/MiniMax 生成内容，写入 MarketingPost 表
 */

import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import { checkRateLimit } from "@/lib/health/rate-limit";
import { evaluateMarketingCompliance } from "@/lib/marketing/automation";
import { generateMarketingContent, type ContentGenerationRequest } from "@/lib/marketing/ai-content-generator";
import type { MarketingChannel } from "@/schemas/marketing";

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// 支持的渠道列表
const VALID_CHANNELS: MarketingChannel[] = [
  "seo_article",
  "wechat",
  "email",
  "xiaohongshu",
  "douyin",
];

export async function POST(request: NextRequest) {
  // 1. 管理员鉴权
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: "admin_required" }, { status: 401 });
  }

  // 2. 速率限制
  const rate = await checkRateLimit(
    `marketing-content-generate:${getClientIp(request)}`,
    12,
    10 * 60 * 1000,
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: "rate_limited", resetAt: rate.resetAt },
      { status: 429 },
    );
  }

  // 3. 解析请求体
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const { topicId, channel, tone, primaryCtaHref, secondaryHref, solutionSlug, dryRun } =
    body as {
      topicId?: string;
      channel?: MarketingChannel;
      tone?: "educational" | "conversational" | "professional";
      primaryCtaHref?: string;
      secondaryHref?: string;
      solutionSlug?: string;
      dryRun?: boolean;
    };

  // 4. 验证渠道
  if (!channel || !VALID_CHANNELS.includes(channel)) {
    return NextResponse.json(
      {
        success: false,
        error: "invalid_channel",
        validChannels: VALID_CHANNELS,
      },
      { status: 400 },
    );
  }

  // 5. 检查 AI 功能是否启用
  const aiEnabled = isFeatureEnabled("marketingContentAi");
  if (!aiEnabled) {
    return NextResponse.json(
      {
        success: false,
        error: "feature_disabled",
        message:
          "FEATURE_MARKETING_CONTENT_AI is not enabled. Set FEATURE_MARKETING_CONTENT_AI=true to activate AI content generation.",
        setupHints: [
          "Set FEATURE_MARKETING_CONTENT_AI=true in environment",
          "Configure DEEPSEEK_API_KEY or MINIMAX_API_KEY",
          "Restart the application",
        ],
      },
      { status: 503 },
    );
  }

  // 6. 获取选题
  const { contentTopics } = await import("@/lib/marketing/content-topics");
  const topic = topicId
    ? contentTopics.find((t) => t.id === topicId)
    : contentTopics[Math.floor(Math.random() * contentTopics.length)];

  if (!topic) {
    return NextResponse.json(
      { success: false, error: "topic_not_found", topicId },
      { status: 404 },
    );
  }

  // 7. 生成内容
  const generationRequest: ContentGenerationRequest = {
    topic,
    channel,
    tone,
    primaryCtaHref: primaryCtaHref ?? "https://rongwang.hk/ai-consult",
    secondaryHref: secondaryHref ?? "https://rongwang.hk/solutions",
    solutionSlug,
  };

  const result = await generateMarketingContent(generationRequest);

  // 8. Dry-run: 不写入数据库，直接返回
  if (dryRun) {
    return NextResponse.json({
      success: result.success,
      dryRun: true,
      topic: { id: topic.id, title: topic.title, category: topic.category },
      channel,
      generated: result.generated
        ? {
            title: result.generated.title,
            excerpt: result.generated.excerpt,
            wordCount: result.generated.wordCount,
            metaDescription: result.generated.metaDescription,
            provider: result.generated.provider,
            elapsedMs: result.generated.elapsedMs,
          }
        : null,
      complianceWarnings: result.complianceWarnings,
      skipped: result.skipped,
      skipReason: result.skipReason,
      error: result.error,
    });
  }

  // 9. 正式模式：写入 MarketingPost 表
  if (!result.generated) {
    return NextResponse.json(
      {
        success: false,
        error: result.error ?? "generation_failed",
        complianceWarnings: result.complianceWarnings,
        skipped: result.skipped,
        skipReason: result.skipReason,
      },
      { status: 500 },
    );
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json(
      { success: false, error: "database_not_configured" },
      { status: 503 },
    );
  }

  const post = await prisma.marketingPost.create({
    data: {
      platform: channel,
      title: result.generated.title,
      content: result.generated.content,
      mediaUrls: [],
      status: "draft",
      sourceArticleId: topic.id,
      seoScore: null,
      metadata: {
        topicId: topic.id,
        category: topic.category,
        keywords: result.generated.keywords,
        wordCount: result.generated.wordCount,
        metaDescription: result.generated.metaDescription,
        aiProvider: result.generated.provider,
        aiElapsedMs: result.generated.elapsedMs,
        complianceWarnings: result.complianceWarnings,
        complianceApproved: result.generated.compliance.approved,
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      dryRun: false,
      postId: post.id,
      topic: { id: topic.id, title: topic.title, category: topic.category },
      channel,
      generated: {
        title: result.generated.title,
        excerpt: result.generated.excerpt,
        wordCount: result.generated.wordCount,
        metaDescription: result.generated.metaDescription,
        provider: result.generated.provider,
        elapsedMs: result.generated.elapsedMs,
      },
      complianceWarnings: result.complianceWarnings,
    },
    { status: 201 },
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  const category = searchParams.get("category") as (typeof VALID_CHANNELS)[number] | null;

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  const where: Record<string, unknown> = {};
  if (postId) where.id = postId;
  if (category && VALID_CHANNELS.includes(category)) where.platform = category;

  const posts = await prisma.marketingPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      platform: p.platform,
      title: p.title,
      status: p.status,
      seoScore: p.seoScore,
      createdAt: p.createdAt,
      metadata: p.metadata,
    })),
  });
}
