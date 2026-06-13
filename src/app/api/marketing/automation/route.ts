import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import { saveAnalyticsEvent } from "@/lib/data/analytics-events";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { enforceMarketingAdminGuard } from "@/lib/marketing/api-guard";
import { buildMarketingCampaignPlan } from "@/lib/marketing/automation";
import { saveMarketingPlanDraft } from "@/lib/marketing/plan-store";
import {
  getGeoFlowAutomationStatus,
  publishGeoFlowTaskDraft,
} from "@/lib/marketing/geoflow";
import {
  createWeChatPublicationAuditEvent,
  createWeChatPublicationDecision,
} from "@/lib/marketing/wechat-publish";
import {
  generateMarketingContent,
  type ContentGenerationRequest,
} from "@/lib/marketing/ai-content-generator";
import {
  marketingCampaignRequestSchema,
  marketingChannelValues,
  marketingObjectiveValues,
} from "@/schemas/marketing";

export async function GET() {
  return NextResponse.json({
    success: true,
    capabilities: {
      assessmentFirst: true,
      ruleBasedProductRecommendations: true,
      channels: marketingChannelValues,
      objectives: marketingObjectiveValues,
      geoFlowTaskDrafts: true,
      autoPublishRequiresAdmin: true,
    },
    geoFlow: getGeoFlowAutomationStatus(),
  });
}

export async function POST(request: Request) {
  if (!isFeatureEnabled("marketingAutomation")) {
    return NextResponse.json({ success: false, error: "feature_disabled" }, { status: 404 });
  }

  const guard = await enforceMarketingAdminGuard(request, {
    bucket: "marketing-automation",
    eventPrefix: "api.marketing_automation",
    defaultLimit: 12,
    defaultWindowMs: 10 * 60 * 1000,
    limitEnv: "MARKETING_AUTOMATION_RATE_LIMIT",
    windowEnv: "MARKETING_AUTOMATION_RATE_WINDOW_MS",
  });
  if (guard) {
    return guard;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = marketingCampaignRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "validation_failed",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const plan = buildMarketingCampaignPlan(parsed.data);
  const storedPlan = await saveMarketingPlanDraft({ plan });
  const execute = parsed.data.execute === true;
  if (execute && !isAdminRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: "admin_required" }, { status: 401 });
  }

  const mode = execute ? "publish" : "dry_run";
  const geoFlowResults = execute
    ? await Promise.all(plan.geoFlow.tasks.map((task) => publishGeoFlowTaskDraft(task)))
    : [];

  // ── AI 内容生成：当 marketingContentAi 启用时，直接生成内容写入 MarketingPost ──
  const aiGeneratedPosts: { channel: string; postId?: string; topicId: string; error?: string }[] = [];
  const aiEnabled = isFeatureEnabled("marketingContentAi");
  if (execute && aiEnabled) {
    const { getPrisma } = await import("@/lib/prisma");
    const prisma = getPrisma();
    const { contentTopics } = await import("@/lib/marketing/content-topics");

    await Promise.allSettled(
      plan.assets.map(async (asset) => {
        // 尝试从 contentOutline[0] 匹配 topic
        const topicIdKey = asset.contentOutline[0] ?? asset.title;
        const topic = contentTopics.find((t) =>
          t.id === topicIdKey || t.title.toLowerCase().includes(asset.title.toLowerCase().slice(0, 20)),
        );
        if (!topic) return; // 找不到匹配选题，跳过

        const request: ContentGenerationRequest = {
          topic,
          channel: asset.channel,
          tone: "educational",
          primaryCtaHref: asset.href,
          secondaryHref: "https://rongwang.hk/solutions",
          solutionSlug: plan.solutionSlug ?? undefined,
        };
        const result = await generateMarketingContent(request);
        if (result.generated && prisma) {
          const post = await prisma.marketingPost.create({
            data: {
              platform: asset.channel,
              title: result.generated.title,
              content: result.generated.content,
              mediaUrls: [],
              status: "scheduled",
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
                campaignSlug: plan.campaignSlug,
                assetChannel: asset.channel,
              },
            },
          });
          aiGeneratedPosts.push({ channel: asset.channel, postId: post.id, topicId: topic.id });
        } else {
          aiGeneratedPosts.push({
            channel: asset.channel,
            topicId: topic.id,
            error: result.error ?? result.skipReason ?? "no_content",
          });
        }
      }),
    );
  }
  const adminAuthorized = isAdminRequestAuthorized(request);
  const wechatPublication = plan.assets
    .flatMap((asset) => asset.wechatArticle ? [asset.wechatArticle] : [])
    .map((draft) => createWeChatPublicationDecision({
      draft,
      campaignSlug: plan.campaignSlug,
      requestPublish: execute,
      adminAuthorized,
    }));

  await saveAnalyticsEvent({
    name: "marketing_campaign_planned",
    source: "marketing-automation",
    solutionSlug: plan.solutionSlug ?? undefined,
    metadata: {
      campaignSlug: plan.campaignSlug,
      objective: plan.objective,
      channels: plan.assets.map((asset) => asset.channel),
      mode,
      geoFlowTasks: plan.geoFlow.tasks.length,
      wechatArticles: wechatPublication.length,
      marketingPlanId: storedPlan.id,
      outboundQueueEntries: storedPlan.outboundQueue.length,
    },
  });
  await Promise.all(
    wechatPublication.map((decision) => saveAnalyticsEvent(createWeChatPublicationAuditEvent(decision))),
  );

  return NextResponse.json({
    success: true,
    mode,
    plan,
    storedPlan: {
      id: storedPlan.id,
      status: storedPlan.status,
      outboundQueue: storedPlan.outboundQueue,
    },
    geoFlowResults,
    wechatPublication,
    aiGeneratedPosts,
    aiContentGeneration: aiEnabled
      ? { enabled: true, postsGenerated: aiGeneratedPosts.filter((p) => p.postId).length, postsFailed: aiGeneratedPosts.filter((p) => p.error).length }
      : { enabled: false },
  });
}
