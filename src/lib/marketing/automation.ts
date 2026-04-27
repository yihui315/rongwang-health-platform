import {
  getAiConsultHrefForValue,
  getAssessmentHrefForValue,
  getSolutionHrefForValue,
} from "@/lib/health/consult-entry";
import { normalizeSolutionSlug, type SolutionSlug } from "@/lib/health/mappings";
import {
  buildGeoFlowTaskPayload,
  getGeoFlowAutomationStatus,
  type GeoFlowTaskDraft,
} from "@/lib/marketing/geoflow";
import {
  marketingCampaignRequestSchema,
  marketingChannelValues,
  type MarketingCampaignRequest,
  type MarketingCampaignRequestInput,
  type MarketingChannel,
} from "@/schemas/marketing";

export interface MarketingComplianceResult {
  approved: boolean;
  warnings: string[];
  safeDisclaimer: string;
}

export interface MarketingAsset {
  channel: MarketingChannel;
  title: string;
  brief: string;
  href: string;
  primaryCta: {
    label: string;
    href: string;
  };
  contentOutline: string[];
  compliance: MarketingComplianceResult;
}

export interface MarketingCampaignPlan {
  campaignSlug: string;
  name: string;
  objective: MarketingCampaignRequest["objective"];
  audience: string;
  keyword: string;
  solutionSlug: SolutionSlug | null;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  } | null;
  assets: MarketingAsset[];
  geoFlow: {
    configured: boolean;
    canPublish: boolean;
    autoPublishEnabled: boolean;
    tasks: GeoFlowTaskDraft[];
  };
  compliance: MarketingComplianceResult;
  metrics: string[];
  nextActions: string[];
}

const channelSpec: Record<MarketingChannel, { source: string; medium: string; label: string; geoflow: boolean }> = {
  seo_article: { source: "geoflow", medium: "organic", label: "SEO 文章", geoflow: true },
  landing_page: { source: "landing", medium: "paid", label: "转化落地页", geoflow: false },
  xiaohongshu: { source: "xiaohongshu", medium: "social", label: "小红书笔记", geoflow: false },
  wechat: { source: "wechat", medium: "owned", label: "微信文章", geoflow: false },
  douyin: { source: "douyin", medium: "short_video", label: "抖音脚本", geoflow: false },
  email: { source: "email", medium: "lifecycle", label: "生命周期邮件", geoflow: false },
};

const objectiveLabels: Record<MarketingCampaignRequest["objective"], string> = {
  assessment_conversion: "AI 评估转化",
  seo_growth: "SEO 增长",
  retention: "用户留存",
  reactivation: "沉睡用户唤醒",
  pdd_conversion: "PDD 跳转转化",
};

const riskyPatterns: Array<{ pattern: RegExp; warning: string }> = [
  { pattern: /治愈|根治|治疗|诊断|处方/, warning: "避免诊断、治疗或处方表达。" },
  { pattern: /100%|保证|一定|永久|彻底/, warning: "避免绝对化效果承诺。" },
  { pattern: /无副作用|没有.*副作用|零风险|最有效|唯一/, warning: "避免安全性或优越性绝对承诺。" },
  { pattern: /替代医生|不用就医|不需要医生/, warning: "不能暗示替代医生或延误就医。" },
];

function compact<T>(items: Array<T | null | undefined>): T[] {
  return items.filter((item): item is T => item !== null && item !== undefined);
}

function slugify(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "rongwang-campaign";
}

function uniqueChannels(channels: readonly MarketingChannel[]) {
  const allowed = new Set(marketingChannelValues);
  return [...new Set(channels)].filter((channel): channel is MarketingChannel => allowed.has(channel));
}

function trackedHref(href: string, input: {
  source: string;
  medium: string;
  campaign: string;
  ref?: string;
}) {
  const [path, existingQuery = ""] = href.split("?");
  const params = new URLSearchParams(existingQuery);
  params.set("utm_source", input.source);
  params.set("utm_medium", input.medium);
  params.set("utm_campaign", input.campaign);
  if (input.ref) {
    params.set("ref", input.ref);
  }

  return `${path}?${params.toString()}`;
}

export function evaluateMarketingCompliance(text: string): MarketingComplianceResult {
  const warnings = riskyPatterns.flatMap((rule) => (rule.pattern.test(text) ? [rule.warning] : []));
  return {
    approved: warnings.length === 0,
    warnings: [...new Set(warnings)],
    safeDisclaimer:
      "本内容仅供健康教育和一般参考，不构成医学诊断、治疗建议或处方；若症状严重、持续或正在服药，请咨询医生或药师。",
  };
}

function createAsset(input: {
  channel: MarketingChannel;
  keyword: string;
  audience: string;
  campaignSlug: string;
  primaryCtaHref: string;
  secondaryHref: string | null;
  offer?: string;
  ref?: string;
}): MarketingAsset {
  const spec = channelSpec[input.channel];
  const href = trackedHref(input.primaryCtaHref, {
    source: spec.source,
    medium: spec.medium,
    campaign: input.campaignSlug,
    ref: input.ref,
  });
  const title = `${input.keyword} | ${spec.label}`;
  const brief = [
    `面向：${input.audience}`,
    "主线：先完成 AI 健康评估，再查看教育方案和购买入口。",
    input.offer ? `运营钩子：${input.offer}` : null,
  ].filter(Boolean).join(" ");
  const contentOutline = compact([
    `问题识别：${input.keyword}相关的常见困扰`,
    "风险提示：严重、持续或高风险症状优先就医",
    "AI 自测入口：引导用户进入结构化评估",
    input.secondaryHref ? "方案教育：连接 assessment / solutions 主内容" : null,
    "转化归因：所有 CTA 使用统一 UTM 和 ref",
  ]);

  return {
    channel: input.channel,
    title,
    brief,
    href,
    primaryCta: {
      label: "立即开始 AI 评估",
      href,
    },
    contentOutline,
    compliance: evaluateMarketingCompliance(`${title}\n${brief}\n${contentOutline.join("\n")}`),
  };
}

function createGeoFlowDraft(asset: MarketingAsset, plan: {
  campaignSlug: string;
  keyword: string;
  solutionSlug: SolutionSlug | null;
}): GeoFlowTaskDraft {
  const title = `[Marketing] ${plan.keyword} - ${asset.channel}`;
  return {
    id: `${plan.campaignSlug}-${asset.channel}`,
    channel: asset.channel,
    title,
    endpoint: "POST /tasks",
    payload: buildGeoFlowTaskPayload(title),
    metadata: {
      campaignSlug: plan.campaignSlug,
      keyword: plan.keyword,
      solutionSlug: plan.solutionSlug ?? undefined,
      promptBrief: [
        asset.brief,
        ...asset.contentOutline,
        "生成内容必须健康教育优先，不做诊断，不承诺治疗效果，保留 AI 评估为主 CTA。",
      ].join("\n"),
    },
  };
}

export function buildMarketingCampaignPlan(input: MarketingCampaignRequestInput): MarketingCampaignPlan {
  const request = marketingCampaignRequestSchema.parse(input);
  const solutionSlug = normalizeSolutionSlug(request.solution);
  const keyword = request.keyword ?? (solutionSlug ? `${solutionSlug} support` : "AI 健康评估");
  const campaignSlug = request.campaignSlug ?? slugify(`${solutionSlug ?? request.objective}-${keyword}`);
  const primaryCtaHref = getAiConsultHrefForValue(solutionSlug);
  const secondaryHref = solutionSlug
    ? getSolutionHrefForValue(solutionSlug) ?? getAssessmentHrefForValue(solutionSlug)
    : "/articles";
  const secondaryCta = secondaryHref
    ? { label: solutionSlug ? "查看问题方案" : "查看健康百科", href: secondaryHref }
    : null;
  const assets = uniqueChannels(request.channels).map((channel) => createAsset({
    channel,
    keyword,
    audience: request.audience,
    campaignSlug,
    primaryCtaHref,
    secondaryHref,
    offer: request.offer,
    ref: request.ref,
  }));
  const taskAssets = assets.filter((asset) => channelSpec[asset.channel].geoflow);
  const geoFlowStatus = getGeoFlowAutomationStatus();
  const taskDrafts = taskAssets.map((asset) => createGeoFlowDraft(asset, {
    campaignSlug,
    keyword,
    solutionSlug,
  }));
  const compliance = evaluateMarketingCompliance([
    request.name,
    request.audience,
    keyword,
    request.offer,
    ...assets.flatMap((asset) => [asset.title, asset.brief, ...asset.contentOutline]),
  ].filter(Boolean).join("\n"));

  return {
    campaignSlug,
    name: request.name ?? `${objectiveLabels[request.objective]}：${keyword}`,
    objective: request.objective,
    audience: request.audience,
    keyword,
    solutionSlug,
    primaryCta: {
      label: "立即开始 AI 评估",
      href: trackedHref(primaryCtaHref, {
        source: "campaign",
        medium: "automation",
        campaign: campaignSlug,
        ref: request.ref,
      }),
    },
    secondaryCta,
    assets,
    geoFlow: {
      configured: geoFlowStatus.configured,
      canPublish: geoFlowStatus.canPublish,
      autoPublishEnabled: geoFlowStatus.autoPublishEnabled,
      tasks: taskDrafts,
    },
    compliance,
    metrics: [
      "marketing_campaign_planned",
      "assessment_started",
      "assessment_completed",
      "recommendation_clicked",
      "pdd_redirect_clicked",
    ],
    nextActions: compact([
      "在 GEOFlow 中审核 SEO 文章任务草稿",
      "把 landing/social/email 资产交给对应渠道排期",
      "上线后按 utm_campaign 查看评估开始率与 PDD 跳转率",
      compliance.approved ? null : "先修正文案合规警告，再允许发布",
    ]),
  };
}
