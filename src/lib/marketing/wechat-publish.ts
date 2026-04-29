import type { AnalyticsEvent } from "@/lib/analytics";
import type { WeChatArticleDraft } from "@/lib/marketing/wechat";

export type WeChatPublicationStatus =
  | "draft_only"
  | "draft_ready"
  | "blocked"
  | "publish_ready";

export interface WeChatPublicationDecision {
  status: WeChatPublicationStatus;
  publishAllowed: boolean;
  campaignSlug: string;
  title: string;
  fileName: string;
  reason: string;
  complianceApproved: boolean;
  md2wechatOutput?: Record<string, unknown>;
}

const riskyPublishPatterns = [
  /治愈/,
  /保证/,
  /100%/,
  /立即购买/,
];

function hasRiskyPublishClaim(markdown: string) {
  return riskyPublishPatterns.some((pattern) => pattern.test(markdown));
}

export function createWeChatPublicationDecision(input: {
  draft: WeChatArticleDraft;
  campaignSlug: string;
  requestPublish: boolean;
  adminAuthorized: boolean;
  nodeEnv?: string;
  md2wechatOutput?: Record<string, unknown>;
}): WeChatPublicationDecision {
  const draftUploadEnabled = process.env.WECHAT_DRAFT_UPLOAD_ENABLED === "true";
  const autoPublishEnabled = process.env.WECHAT_AUTO_PUBLISH === "true";
  const isProduction = (input.nodeEnv ?? process.env.NODE_ENV) === "production";
  const complianceApproved = input.draft.compliance.approved && !hasRiskyPublishClaim(input.draft.markdown);
  const base = {
    campaignSlug: input.campaignSlug,
    title: input.draft.title,
    fileName: input.draft.fileName,
    complianceApproved,
    md2wechatOutput: input.md2wechatOutput,
  };

  if (!complianceApproved) {
    return {
      ...base,
      status: "blocked",
      publishAllowed: false,
      reason: "blocked_by_compliance_guardrail",
    };
  }

  if (!draftUploadEnabled) {
    return {
      ...base,
      status: "draft_only",
      publishAllowed: false,
      reason: "WECHAT_DRAFT_UPLOAD_ENABLED is not true; generate Markdown and preview only.",
    };
  }

  if (!input.requestPublish || !autoPublishEnabled) {
    return {
      ...base,
      status: "draft_ready",
      publishAllowed: false,
      reason: "WECHAT_AUTO_PUBLISH is not true; upload draft only after human review.",
    };
  }

  if (!isProduction) {
    return {
      ...base,
      status: "blocked",
      publishAllowed: false,
      reason: "auto_publish_requires_production",
    };
  }

  if (!input.adminAuthorized) {
    return {
      ...base,
      status: "blocked",
      publishAllowed: false,
      reason: "auto_publish_requires_admin",
    };
  }

  return {
    ...base,
    status: "publish_ready",
    publishAllowed: true,
    reason: "auto_publish_gate_passed",
  };
}

export function createWeChatPublicationAuditEvent(decision: WeChatPublicationDecision): AnalyticsEvent {
  return {
    name: "wechat_article_published",
    source: "wechat-official-account",
    metadata: {
      campaignSlug: decision.campaignSlug,
      title: decision.title,
      fileName: decision.fileName,
      status: decision.status,
      publishAllowed: decision.publishAllowed,
      reason: decision.reason,
      complianceApproved: decision.complianceApproved,
      md2wechatOutput: decision.md2wechatOutput ?? null,
      rollbackHint: "Use WeChat Official Account backend to unpublish/delete if a draft or publish action was created.",
    },
  };
}
