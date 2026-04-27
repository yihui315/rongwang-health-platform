import type { AnalyticsSummary } from "@/lib/data/analytics-events";
import { getAnalyticsSummary } from "@/lib/data/analytics-events";
import type { PddClickSummary } from "@/lib/data/pdd-clicks";
import { getPddClickSummary } from "@/lib/data/pdd-clicks";
import { normalizeSolutionSlug, type SolutionSlug } from "@/lib/health/mappings";
import { buildMarketingCampaignPlan, type MarketingCampaignPlan } from "@/lib/marketing/automation";
import {
  getGeoFlowAutomationStatus,
  type GeoFlowAutomationStatus,
} from "@/lib/marketing/geoflow";
import {
  buildContentOpportunities,
  buildFreeToolIdeas,
  buildLifecycleFlowIdeas,
  selectGrowthPlaybooks,
  type ContentOpportunity,
  type FreeToolIdea,
  type GrowthPlaybookRecommendation,
  type LifecycleFlowIdea,
} from "@/lib/marketing/playbooks";
import {
  marketingAutopilotRequestSchema,
  type MarketingAutopilotRequest,
  type MarketingAutopilotRequestInput,
} from "@/schemas/marketing";

type AutopilotStatus = "ready" | "needs_setup" | "blocked";
type AutopilotMode = "dry_run" | "execute";
type ActionPriority = "critical" | "high" | "medium" | "low";

export type MarketingAutopilotActionKind =
  | "configure_geoflow"
  | "complete_geoflow_defaults"
  | "enable_geoflow_review"
  | "seed_first_campaign"
  | "improve_tool_to_assessment"
  | "improve_assessment_completion"
  | "improve_recommendation_click"
  | "improve_pdd_redirect"
  | "review_compliance";

export interface MarketingAutopilotAction {
  kind: MarketingAutopilotActionKind;
  priority: ActionPriority;
  title: string;
  rationale: string;
  owner: "growth" | "content" | "engineering" | "compliance";
  href?: string;
}

export interface MarketingAutopilotExperiment {
  id: string;
  title: string;
  hypothesis: string;
  metric: string;
  variants: string[];
}

export interface MarketingAutopilotRun {
  runId: string;
  generatedAt: string;
  status: AutopilotStatus;
  mode: AutopilotMode;
  focusSolution: SolutionSlug | null;
  signals: {
    lookbackDays: number;
    analytics: {
      assessmentStarted: number;
      assessmentCompleted: number;
      toolCompleted: number;
      recommendationClicked: number;
      pddRedirectClicked: number;
      toolToAssessmentRate: number;
      completionRate: number;
      recommendationClickRate: number;
      pddRedirectRate: number;
      topSources: Array<{ key: string; count: number }>;
    };
    pdd: {
      total: number;
      topSources: Array<{ key: string; count: number }>;
      topSolutions: Array<{ key: string; count: number }>;
    };
  };
  campaigns: MarketingCampaignPlan[];
  playbooks: GrowthPlaybookRecommendation[];
  freeToolIdeas: FreeToolIdea[];
  lifecycleFlows: LifecycleFlowIdea[];
  contentOpportunities: ContentOpportunity[];
  actions: MarketingAutopilotAction[];
  geoFlow: {
    status: GeoFlowAutomationStatus;
    actions: MarketingAutopilotAction[];
    taskDraftCount: number;
  };
  experiments: MarketingAutopilotExperiment[];
  execution: {
    requested: boolean;
    allowed: boolean;
    reason: string;
  };
  nextRun: {
    recommendedAfterHours: number;
    reason: string;
  };
}

interface BuildMarketingAutopilotRunInput {
  request: MarketingAutopilotRequestInput;
  analytics: AnalyticsSummary;
  pddClicks: PddClickSummary;
  geoFlow: GeoFlowAutomationStatus;
  executeRequested: boolean;
  adminAuthorized: boolean;
}

function parseBoolean(value: string | undefined) {
  return ["1", "true", "yes", "on", "enabled"].includes((value ?? "").trim().toLowerCase());
}

function safeCount(summary: AnalyticsSummary, key: keyof AnalyticsSummary["byName"]) {
  return summary.byName[key] ?? 0;
}

function makeRunId(request: MarketingAutopilotRequest) {
  const solution = normalizeSolutionSlug(request.solution) ?? "general";
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return `mauto-${solution}-${timestamp}`;
}

function geoFlowActions(geoFlow: GeoFlowAutomationStatus): MarketingAutopilotAction[] {
  if (!geoFlow.configured) {
    return [
      {
        kind: "configure_geoflow",
        priority: "critical",
        title: "配置 GEOFlow API 凭据",
        rationale: "当前只能生成站内营销草稿，无法把 SEO 内容任务同步到 GEOFlow。",
        owner: "engineering",
        href: "/admin/marketing",
      },
    ];
  }

  if (!geoFlow.canPublish) {
    return [
      {
        kind: "complete_geoflow_defaults",
        priority: "high",
        title: "补齐 GEOFlow 默认库和模型 ID",
        rationale: "已配置 API，但缺少标题库、Prompt 或模型默认值，自动任务仍会停在 dry-run。",
        owner: "content",
        href: "/admin/marketing",
      },
    ];
  }

  if (!geoFlow.autoPublishEnabled) {
    return [
      {
        kind: "enable_geoflow_review",
        priority: "low",
        title: "保持人工审核后再发布",
        rationale: "GEOFlow 已具备发稿条件，但自动发布开关关闭；上线前建议继续用审核流。",
        owner: "compliance",
        href: "/admin/marketing",
      },
    ];
  }

  return [];
}

function funnelActions(
  request: MarketingAutopilotRequest,
  analytics: AnalyticsSummary,
  pddClicks: PddClickSummary,
): MarketingAutopilotAction[] {
  const assessmentStarted = safeCount(analytics, "assessment_started");
  const assessmentCompleted = safeCount(analytics, "assessment_completed");
  const toolCompleted = safeCount(analytics, "tool_completed");
  const recommendationClicked = safeCount(analytics, "recommendation_clicked");
  const actions: MarketingAutopilotAction[] = [];

  if (assessmentStarted === 0 && analytics.total === 0) {
    actions.push({
      kind: "seed_first_campaign",
      priority: "high",
      title: "先投放一组 AI 评估种子活动",
      rationale: "最近没有可用转化数据，先用 SEO + 小红书 + 邮件组合建立第一批评估开始数据。",
      owner: "growth",
      href: "/api/marketing/autopilot",
    });
  }

  if (toolCompleted >= 10 && analytics.toolToAssessmentRate < 0.25) {
    actions.push({
      kind: "improve_tool_to_assessment",
      priority: "high",
      title: "优化免费工具到 AI 评估的交接",
      rationale: `免费工具到评估启动率 ${Math.round(analytics.toolToAssessmentRate * 100)}%，说明结果页 CTA、信任说明或下一步路径需要更清晰。`,
      owner: "growth",
      href: "/tools/sleep-score",
    });
  }

  if (assessmentStarted >= 10 && analytics.completionRate < request.minCompletionRate) {
    actions.push({
      kind: "improve_assessment_completion",
      priority: "high",
      title: "优化评估完成率",
      rationale: `评估完成率 ${Math.round(analytics.completionRate * 100)}%，低于目标 ${Math.round(request.minCompletionRate * 100)}%。`,
      owner: "growth",
      href: "/ai-consult",
    });
  }

  if (assessmentCompleted > 0 && analytics.recommendationClickRate < request.minRecommendationClickRate) {
    actions.push({
      kind: "improve_recommendation_click",
      priority: "medium",
      title: "增强推荐卡片的解释和信任感",
      rationale: `推荐点击率 ${Math.round(analytics.recommendationClickRate * 100)}%，说明报告到方案的衔接还可以更清晰。`,
      owner: "content",
      href: "/admin/marketing",
    });
  }

  if (recommendationClicked > 0 && analytics.pddRedirectRate < request.minPddRedirectRate) {
    actions.push({
      kind: "improve_pdd_redirect",
      priority: "medium",
      title: "优化 PDD 中转页信任桥",
      rationale: `PDD 跳转率 ${Math.round(analytics.pddRedirectRate * 100)}%，建议补充购买前确认和售后提示。`,
      owner: "growth",
      href: "/product-map/msr-nadh-tipsynox",
    });
  }

  if (pddClicks.total === 0 && assessmentCompleted >= 5) {
    actions.push({
      kind: "improve_pdd_redirect",
      priority: "low",
      title: "检查推荐点击到 PDD 归因链路",
      rationale: "已有评估完成但没有 PDD 点击记录，需要确认按钮展示、埋点和中转页是否贯通。",
      owner: "engineering",
      href: "/admin/analytics",
    });
  }

  return actions;
}

function buildExperiments(actions: MarketingAutopilotAction[]): MarketingAutopilotExperiment[] {
  const experiments: MarketingAutopilotExperiment[] = [];

  if (actions.some((action) => action.kind === "improve_assessment_completion")) {
    experiments.push({
      id: "consult-form-friction",
      title: "评估表单摩擦度 A/B 测试",
      hypothesis: "减少首屏字段压力并强化隐私说明，可以提升评估完成率。",
      metric: "assessment_completed / assessment_started",
      variants: ["当前完整表单", "分步问题 + 进度提示"],
    });
  }

  if (actions.some((action) => action.kind === "improve_tool_to_assessment")) {
    experiments.push({
      id: "free-tool-handoff",
      title: "免费工具结果页到 AI 评估交接测试",
      hypothesis: "在结果页加入更明确的风险分层解释、隐私说明和一键带 focus 进入评估，可以提升工具完成后的评估启动率。",
      metric: "assessment_started / tool_completed",
      variants: ["当前结果页 CTA", "结果解释 + 隐私承诺 + 强 AI 评估 CTA"],
    });
  }

  if (actions.some((action) => action.kind === "improve_recommendation_click")) {
    experiments.push({
      id: "recommendation-trust-copy",
      title: "推荐卡片信任文案测试",
      hypothesis: "解释推荐依据、适用边界和不适合人群，可以提升推荐点击率。",
      metric: "recommendation_clicked / assessment_completed",
      variants: ["简短推荐理由", "推荐理由 + 风险边界 + 下一步"],
    });
  }

  if (actions.some((action) => action.kind === "improve_pdd_redirect")) {
    experiments.push({
      id: "pdd-bridge-confirmation",
      title: "PDD 中转页确认层测试",
      hypothesis: "在跳转前明确商品来源、保税仓和免责声明，可以提升有效跳转率。",
      metric: "pdd_redirect_clicked / recommendation_clicked",
      variants: ["直接跳转提示", "购买前确认 + 售后提示"],
    });
  }

  return experiments;
}

function resolveExecution(input: {
  executeRequested: boolean;
  adminAuthorized: boolean;
  geoFlow: GeoFlowAutomationStatus;
}) {
  if (!input.executeRequested) {
    return {
      mode: "dry_run" as const,
      execution: {
        requested: false,
        allowed: false,
        reason: "默认 dry-run，只生成计划和 GEOFlow 草稿。",
      },
    };
  }

  if (!input.adminAuthorized) {
    return {
      mode: "dry_run" as const,
      execution: {
        requested: true,
        allowed: false,
        reason: "execute=true 需要管理员授权。",
      },
    };
  }

  if (!parseBoolean(process.env.MARKETING_AUTOPILOT_EXECUTE)) {
    return {
      mode: "dry_run" as const,
      execution: {
        requested: true,
        allowed: false,
        reason: "MARKETING_AUTOPILOT_EXECUTE 未开启，自动驾驶仅允许 dry-run。",
      },
    };
  }

  if (!input.geoFlow.canPublish || !input.geoFlow.autoPublishEnabled) {
    return {
      mode: "dry_run" as const,
      execution: {
        requested: true,
        allowed: false,
        reason: "GEOFlow 未达到可发布状态，不能执行外部写入。",
      },
    };
  }

  return {
    mode: "execute" as const,
    execution: {
      requested: true,
      allowed: true,
      reason: "管理员授权、自动驾驶执行开关和 GEOFlow 发布条件均已满足。",
    },
  };
}

export function buildMarketingAutopilotRun(input: BuildMarketingAutopilotRunInput): MarketingAutopilotRun {
  const request = marketingAutopilotRequestSchema.parse(input.request);
  const focusSolution = normalizeSolutionSlug(request.solution);
  const geoActions = geoFlowActions(input.geoFlow);
  const conversionActions = funnelActions(request, input.analytics, input.pddClicks);
  const campaign = buildMarketingCampaignPlan({
    ...request,
    campaignSlug: request.campaignSlug ?? undefined,
    solution: focusSolution ?? request.solution,
    ref: request.ref ?? "marketing-autopilot",
  });
  const complianceActions: MarketingAutopilotAction[] = campaign.compliance.approved
    ? []
    : [{
        kind: "review_compliance",
        priority: "critical",
        title: "先处理营销合规警告",
        rationale: "自动驾驶不会发布包含诊断、疗效承诺或绝对化表达的内容。",
        owner: "compliance",
        href: "/admin/marketing",
      }];
  const actions = [...geoActions, ...conversionActions, ...complianceActions];
  const playbooks = selectGrowthPlaybooks({
    solution: focusSolution ?? request.solution,
    analytics: input.analytics,
    pddClicks: input.pddClicks,
    geoFlowConfigured: input.geoFlow.configured,
    minCompletionRate: request.minCompletionRate,
    minRecommendationClickRate: request.minRecommendationClickRate,
    minPddRedirectRate: request.minPddRedirectRate,
  });
  const freeToolIdeas = playbooks.some((entry) => entry.playbook.id === "free_tool")
    ? buildFreeToolIdeas(focusSolution ?? request.solution)
    : [];
  const lifecycleFlows = buildLifecycleFlowIdeas(playbooks);
  const contentOpportunities = buildContentOpportunities(playbooks, focusSolution ?? request.solution);
  const { mode, execution } = resolveExecution({
    executeRequested: input.executeRequested,
    adminAuthorized: input.adminAuthorized,
    geoFlow: input.geoFlow,
  });
  const status: AutopilotStatus = complianceActions.length > 0
    ? "blocked"
    : input.geoFlow.configured
      ? "ready"
      : "needs_setup";

  return {
    runId: makeRunId(request),
    generatedAt: new Date().toISOString(),
    status,
    mode,
    focusSolution,
    signals: {
      lookbackDays: request.lookbackDays,
      analytics: {
        assessmentStarted: safeCount(input.analytics, "assessment_started"),
        assessmentCompleted: safeCount(input.analytics, "assessment_completed"),
        toolCompleted: safeCount(input.analytics, "tool_completed"),
        recommendationClicked: safeCount(input.analytics, "recommendation_clicked"),
        pddRedirectClicked: safeCount(input.analytics, "pdd_redirect_clicked"),
        toolToAssessmentRate: input.analytics.toolToAssessmentRate,
        completionRate: input.analytics.completionRate,
        recommendationClickRate: input.analytics.recommendationClickRate,
        pddRedirectRate: input.analytics.pddRedirectRate,
        topSources: input.analytics.bySource.slice(0, 5),
      },
      pdd: {
        total: input.pddClicks.total,
        topSources: input.pddClicks.bySource.slice(0, 5),
        topSolutions: input.pddClicks.bySolution.slice(0, 5),
      },
    },
    campaigns: [campaign],
    playbooks,
    freeToolIdeas,
    lifecycleFlows,
    contentOpportunities,
    actions,
    geoFlow: {
      status: input.geoFlow,
      actions: geoActions,
      taskDraftCount: campaign.geoFlow.tasks.length,
    },
    experiments: buildExperiments(actions),
    execution,
    nextRun: {
      recommendedAfterHours: status === "needs_setup" ? 24 : 6,
      reason: status === "needs_setup"
        ? "先补齐 GEOFlow 配置，再重新生成自动驾驶计划。"
        : "建议按半日节奏复盘评估开始、完成和跳转指标。",
    },
  };
}

export async function createMarketingAutopilotRun(
  request: MarketingAutopilotRequestInput,
  options: { executeRequested: boolean; adminAuthorized: boolean },
) {
  const [analytics, pddClicks] = await Promise.all([
    getAnalyticsSummary(),
    getPddClickSummary(),
  ]);

  return buildMarketingAutopilotRun({
    request,
    analytics,
    pddClicks,
    geoFlow: getGeoFlowAutomationStatus(),
    executeRequested: options.executeRequested,
    adminAuthorized: options.adminAuthorized,
  });
}
