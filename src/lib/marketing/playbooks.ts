import type { AnalyticsSummary } from "@/lib/data/analytics-events";
import type { PddClickSummary } from "@/lib/data/pdd-clicks";
import { getAiConsultHrefForValue } from "@/lib/health/consult-entry";
import { normalizeSolutionSlug, type SolutionSlug } from "@/lib/health/mappings";
import { listFreeTools } from "@/lib/marketing/free-tools";
import type { MarketingChannel } from "@/schemas/marketing";

export const growthPlaybookIds = [
  "aeo_geo_cluster",
  "free_tool",
  "lifecycle_email",
  "social_listening",
  "cro_experiment",
  "launch_directory",
  "content_distribution",
  "referral_affiliate",
] as const;

export type GrowthPlaybookId = (typeof growthPlaybookIds)[number];
export type GrowthFunnelStage = "traffic" | "assessment" | "recommendation" | "pdd" | "retention";
export type GrowthPlaybookPriority = "critical" | "high" | "medium" | "low";
export type GrowthPlaybookGuardrail =
  | "assessment_first"
  | "medical_compliance"
  | "no_auto_external_publish"
  | "rule_based_products"
  | "utm_required";

export interface GrowthPlaybookAsset {
  type: "geo_task" | "tool_page" | "email_flow" | "social_brief" | "experiment" | "launch_item" | "distribution_item";
  title: string;
  href: string;
  status: "draft" | "review_required";
}

export interface GrowthPlaybook {
  id: GrowthPlaybookId;
  name: string;
  sourcePrinciple: string;
  funnelStage: GrowthFunnelStage;
  description: string;
  defaultMode: "draft";
  primaryCta: {
    label: string;
    href: string;
  };
  channels: MarketingChannel[];
  assets: GrowthPlaybookAsset[];
  metrics: string[];
  guardrails: GrowthPlaybookGuardrail[];
}

export interface GrowthPlaybookRecommendation {
  playbook: GrowthPlaybook;
  priority: GrowthPlaybookPriority;
  reason: string;
  assets: GrowthPlaybookAsset[];
}

export interface FreeToolIdea {
  slug: string;
  title: string;
  href: string;
  solutionSlug: SolutionSlug | null;
  primaryCta: string;
}

export interface LifecycleFlowIdea {
  slug: string;
  trigger: string;
  title: string;
  primaryCta: string;
  metric: string;
}

export interface ContentOpportunity {
  slug: string;
  title: string;
  intent: "aeo_geo" | "social_listening" | "distribution";
  solutionSlug: SolutionSlug | null;
  primaryCta: string;
}

interface SelectGrowthPlaybooksInput {
  solution?: string | null;
  analytics: AnalyticsSummary;
  pddClicks: PddClickSummary;
  geoFlowConfigured: boolean;
  minCompletionRate?: number;
  minRecommendationClickRate?: number;
  minPddRedirectRate?: number;
}

const baseGuardrails: GrowthPlaybookGuardrail[] = [
  "assessment_first",
  "medical_compliance",
  "no_auto_external_publish",
  "rule_based_products",
  "utm_required",
];

function solutionLabel(solution: SolutionSlug | null) {
  const labels: Record<SolutionSlug, string> = {
    sleep: "睡眠支持",
    fatigue: "疲劳恢复",
    liver: "肝脏支持",
    immune: "免疫支持",
    "male-health": "男性健康支持",
    "female-health": "女性健康支持",
  };

  return solution ? labels[solution] : "AI 健康评估";
}

function toolHref(solution: SolutionSlug | null) {
  const matchedTool = listFreeTools().find((item) => item.solutionSlug === solution);
  return matchedTool ? `/tools/${matchedTool.slug}` : "/tools/health-check";
}

function playbookAsset(input: GrowthPlaybookAsset): GrowthPlaybookAsset {
  return input;
}

function createPlaybook(id: GrowthPlaybookId, solution: SolutionSlug | null): GrowthPlaybook {
  const primaryCta = {
    label: "立即开始 AI 评估",
    href: getAiConsultHrefForValue(solution),
  };
  const label = solutionLabel(solution);
  const href = toolHref(solution);

  const specs: Record<GrowthPlaybookId, Omit<GrowthPlaybook, "id" | "primaryCta">> = {
    aeo_geo_cluster: {
      name: "AEO/GEO 内容集群",
      sourcePrinciple: "LLM SEO, AEO, GEO",
      funnelStage: "traffic",
      description: "把 assessment、solutions、FAQ、JSON-LD、llms.txt 和 GEOFlow 草稿组合成 AI 搜索可引用内容集群。",
      defaultMode: "draft",
      channels: ["seo_article", "wechat"],
      assets: [
        playbookAsset({ type: "geo_task", title: `${label} FAQ 与 AI 搜索摘要`, href: "/api/marketing/automation", status: "draft" }),
        playbookAsset({ type: "distribution_item", title: `${label} llms.txt 摘要`, href: "/llms.txt", status: "draft" }),
      ],
      metrics: ["organic_sessions", "assessment_started", "marketing_geoflow_task_created"],
      guardrails: baseGuardrails,
    },
    free_tool: {
      name: "免费工具获客",
      sourcePrinciple: "Free-Tool Marketing / Engineering as Marketing",
      funnelStage: "traffic",
      description: "用轻量自测工具承接高意图关键词，再把用户引导到完整 AI 健康评估。",
      defaultMode: "draft",
      channels: ["landing_page", "xiaohongshu", "wechat"],
      assets: [
        playbookAsset({ type: "tool_page", title: `${label}免费自测工具`, href, status: "draft" }),
      ],
      metrics: ["tool_completed", "assessment_started", "assessment_completed"],
      guardrails: baseGuardrails,
    },
    lifecycle_email: {
      name: "生命周期邮件",
      sourcePrinciple: "Email Marketing / Behavior-based lifecycle",
      funnelStage: "retention",
      description: "根据评估、推荐、PDD 跳转等行为生成教育型邮件草稿，推动用户回到下一步。",
      defaultMode: "draft",
      channels: ["email"],
      assets: [
        playbookAsset({ type: "email_flow", title: "评估开始未完成提醒", href: "/api/marketing/email?slug=assessment_followup", status: "draft" }),
        playbookAsset({ type: "email_flow", title: "推荐未点击教育跟进", href: "/api/marketing/email?slug=education_nurture", status: "draft" }),
      ],
      metrics: ["email_opened", "email_clicked", "assessment_completed"],
      guardrails: baseGuardrails,
    },
    social_listening: {
      name: "社媒监听与选题",
      sourcePrinciple: "Social Listening / Reddit marketing adapted for Chinese channels",
      funnelStage: "traffic",
      description: "把用户真实问题转成小红书、知乎、抖音、公众号草稿，不做自动评论或伪装推广。",
      defaultMode: "draft",
      channels: ["xiaohongshu", "douyin", "wechat"],
      assets: [
        playbookAsset({ type: "social_brief", title: `${label}高意图问题选题清单`, href: "/api/marketing/content", status: "draft" }),
      ],
      metrics: ["content_idea_created", "assessment_started"],
      guardrails: baseGuardrails,
    },
    cro_experiment: {
      name: "CRO 实验引擎",
      sourcePrinciple: "Conversion Rate Optimization",
      funnelStage: "assessment",
      description: "针对表单完成率、推荐点击率和 PDD 跳转率生成可回滚实验方案。",
      defaultMode: "draft",
      channels: ["landing_page"],
      assets: [
        playbookAsset({ type: "experiment", title: "评估表单分步与信任文案实验", href: "/admin/marketing", status: "draft" }),
      ],
      metrics: ["assessment_completed", "recommendation_clicked", "pdd_redirect_clicked"],
      guardrails: baseGuardrails,
    },
    launch_directory: {
      name: "目录与首发清单",
      sourcePrinciple: "Places To Launch Your Startup",
      funnelStage: "traffic",
      description: "生成 AI 工具目录、健康工具目录、社区首发和渠道提交清单，人工审核后发布。",
      defaultMode: "draft",
      channels: ["landing_page", "wechat"],
      assets: [
        playbookAsset({ type: "launch_item", title: "AI 健康评估工具目录提交包", href: "/admin/marketing", status: "draft" }),
      ],
      metrics: ["referral_sessions", "assessment_started"],
      guardrails: baseGuardrails,
    },
    content_distribution: {
      name: "内容分发清单",
      sourcePrinciple: "Content Marketing / Distribution checklist",
      funnelStage: "recommendation",
      description: "把一篇健康教育内容拆成多渠道摘要、短视频脚本、FAQ 和邮件，不让内容停留在单页。",
      defaultMode: "draft",
      channels: ["wechat", "xiaohongshu", "douyin", "email"],
      assets: [
        playbookAsset({ type: "distribution_item", title: `${label}内容再分发清单`, href: "/api/marketing/content", status: "draft" }),
      ],
      metrics: ["content_distributed", "recommendation_clicked"],
      guardrails: baseGuardrails,
    },
    referral_affiliate: {
      name: "推荐与联盟后备策略",
      sourcePrinciple: "Affiliates and Referrals",
      funnelStage: "retention",
      description: "先沉淀可审计的推荐素材和分享链路，真实联盟计划等合规和结算体系完善后再启用。",
      defaultMode: "draft",
      channels: ["email", "wechat"],
      assets: [
        playbookAsset({ type: "distribution_item", title: "用户分享与合作伙伴素材包", href: "/admin/marketing", status: "review_required" }),
      ],
      metrics: ["referral_sessions", "assessment_started"],
      guardrails: baseGuardrails,
    },
  };

  return {
    id,
    primaryCta,
    ...specs[id],
  };
}

function getStartedCount(analytics: AnalyticsSummary) {
  return analytics.byName.assessment_started ?? 0;
}

function getCompletedCount(analytics: AnalyticsSummary) {
  return analytics.byName.assessment_completed ?? 0;
}

function getRecommendationClickedCount(analytics: AnalyticsSummary) {
  return analytics.byName.recommendation_clicked ?? 0;
}

function recommendation(
  id: GrowthPlaybookId,
  solution: SolutionSlug | null,
  priority: GrowthPlaybookPriority,
  reason: string,
): GrowthPlaybookRecommendation {
  const playbook = createPlaybook(id, solution);
  return {
    playbook,
    priority,
    reason,
    assets: playbook.assets,
  };
}

export function getGrowthPlaybooks(solution?: string | null): GrowthPlaybook[] {
  const normalizedSolution = normalizeSolutionSlug(solution);
  return growthPlaybookIds.map((id) => createPlaybook(id, normalizedSolution));
}

export function selectGrowthPlaybooks(input: SelectGrowthPlaybooksInput): GrowthPlaybookRecommendation[] {
  const solution = normalizeSolutionSlug(input.solution);
  const minCompletionRate = input.minCompletionRate ?? 0.35;
  const minRecommendationClickRate = input.minRecommendationClickRate ?? 0.18;
  const minPddRedirectRate = input.minPddRedirectRate ?? 0.12;
  const started = getStartedCount(input.analytics);
  const completed = getCompletedCount(input.analytics);
  const recommendationClicked = getRecommendationClickedCount(input.analytics);
  const selected = new Map<GrowthPlaybookId, GrowthPlaybookRecommendation>();

  function add(id: GrowthPlaybookId, priority: GrowthPlaybookPriority, reason: string) {
    const existing = selected.get(id);
    if (existing) {
      existing.reason = `${existing.reason} ${reason}`;
      return;
    }
    selected.set(id, recommendation(id, solution, priority, reason));
  }

  if (input.analytics.total === 0 || started === 0) {
    add("aeo_geo_cluster", "high", input.geoFlowConfigured
      ? "缺少评估开始数据，先用 AEO/GEO 内容集群获取高意图流量。"
      : "缺少评估开始数据，且 GEOFlow 未配置；先生成 AEO/GEO 草稿并补齐 GEOFlow。");
    add("free_tool", "high", "免费工具可以承接搜索和社媒意图，再引导到完整 AI 评估。");
    add("launch_directory", "medium", "目录和社区首发适合建立第一批可归因流量。");
  }

  if (started >= 10 && input.analytics.completionRate < minCompletionRate) {
    add("cro_experiment", "high", `评估完成率低于 ${Math.round(minCompletionRate * 100)}%，优先优化表单和信任文案。`);
    add("lifecycle_email", "medium", "对开始未完成用户生成教育型提醒草稿。");
  }

  if (completed > 0 && input.analytics.recommendationClickRate < minRecommendationClickRate) {
    add("content_distribution", "medium", "报告到推荐之间的信任衔接偏弱，需要更多解释型内容分发。");
    add("lifecycle_email", "medium", "对完成评估但未点击推荐用户生成后续教育邮件。");
    add("cro_experiment", "medium", "推荐卡片需要测试更清晰的依据、边界和下一步。");
  }

  if (recommendationClicked > 0 && input.analytics.pddRedirectRate < minPddRedirectRate) {
    add("cro_experiment", "medium", "PDD 跳转率偏低，建议测试中转页信任桥。");
    add("content_distribution", "low", "用购买前教育内容降低用户跳转犹豫。");
  }

  if (input.pddClicks.total > 0) {
    add("referral_affiliate", "low", "已有 PDD 点击数据，可开始沉淀分享和合作素材，但仍保持人工审核。");
  }

  if (selected.size === 0) {
    add("social_listening", "low", "核心漏斗暂无明显短板，可以持续积累用户问题和内容选题。");
    add("content_distribution", "low", "把现有内容拆分到多渠道，提升复用效率。");
  }

  const priorityOrder: Record<GrowthPlaybookPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...selected.values()].sort((left, right) =>
    priorityOrder[left.priority] - priorityOrder[right.priority],
  );
}

export function buildFreeToolIdeas(solution?: string | null): FreeToolIdea[] {
  const normalizedSolution = normalizeSolutionSlug(solution);
  const tools = listFreeTools();
  const selectedTools = normalizedSolution
    ? tools.filter((item) => item.solutionSlug === normalizedSolution)
    : [tools.find((item) => item.slug === "health-check"), ...tools.filter((item) => item.solutionSlug).slice(0, 3)];

  return selectedTools.flatMap((item) => {
    if (!item) {
      return [];
    }

    return [{
      slug: item.slug,
      title: item.title,
      href: `/tools/${item.slug}`,
      solutionSlug: item.solutionSlug,
      primaryCta: item.primaryCta.href,
    }];
  });
}

export function buildLifecycleFlowIdeas(playbooks: GrowthPlaybookRecommendation[]): LifecycleFlowIdea[] {
  const hasLifecycle = playbooks.some((entry) => entry.playbook.id === "lifecycle_email");
  if (!hasLifecycle) {
    return [];
  }

  return [
    {
      slug: "assessment-started-not-completed",
      trigger: "assessment_started_not_completed",
      title: "开始评估但未完成的温和提醒",
      primaryCta: "/ai-consult",
      metric: "assessment_completed / assessment_started",
    },
    {
      slug: "completed-no-recommendation-click",
      trigger: "assessment_completed_no_recommendation_click",
      title: "完成评估但未点击推荐的教育跟进",
      primaryCta: "/ai-consult",
      metric: "recommendation_clicked / assessment_completed",
    },
  ];
}

export function buildContentOpportunities(
  playbooks: GrowthPlaybookRecommendation[],
  solution?: string | null,
): ContentOpportunity[] {
  const normalizedSolution = normalizeSolutionSlug(solution);
  const primaryCta = getAiConsultHrefForValue(normalizedSolution);
  const ids = new Set(playbooks.map((entry) => entry.playbook.id));
  const opportunities: ContentOpportunity[] = [];

  if (ids.has("aeo_geo_cluster")) {
    opportunities.push({
      slug: "aeo-faq-cluster",
      title: `${solutionLabel(normalizedSolution)} FAQ 与 AI 搜索答案页`,
      intent: "aeo_geo",
      solutionSlug: normalizedSolution,
      primaryCta,
    });
  }

  if (ids.has("social_listening")) {
    opportunities.push({
      slug: "social-listening-questions",
      title: "小红书/知乎/抖音高意图问题清单",
      intent: "social_listening",
      solutionSlug: normalizedSolution,
      primaryCta,
    });
  }

  if (ids.has("content_distribution")) {
    opportunities.push({
      slug: "solution-content-repurposing",
      title: `${solutionLabel(normalizedSolution)}内容再分发包`,
      intent: "distribution",
      solutionSlug: normalizedSolution,
      primaryCta,
    });
  }

  return opportunities;
}
