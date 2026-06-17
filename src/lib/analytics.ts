import { z } from "zod";
import {
  ASSESSMENT_RULE_VERSION,
  ASSESSMENT_VERSION,
} from "@/schemas/assessment-router";

export const analyticsEventNames = [
  "home_protocol_viewed",
  "home_protocol_cta_clicked",
  "protocol_hero_view",
  "protocol_hero_primary_click",
  "protocol_hero_report_sample_click",
  "protocol_hero_unknown_click",
  "medical_review_strip_view",
  "health_review_standard_click",
  "chief_complaint_selector_view",
  "chief_complaint_unknown_click",
  "chief_complaint_sleep_click",
  "chief_complaint_fatigue_click",
  "chief_complaint_alcohol_click",
  "chief_complaint_immunity_click",
  "chief_complaint_female_click",
  "chief_complaint_male_click",
  "assessment_router_loaded",
  "assessment_scenario_preselected",
  "assessment_scenario_changed",
  "assessment_privacy_view",
  "assessment_report_consent_checked",
  "assessment_marketing_opt_in_checked",
  "assessment_consent_continue_click",
  "chief_complaint_selector_viewed",
  "chief_complaint_selected",
  "assessment_started",
  "assessment_completed",
  "result_low_view",
  "result_medium_view",
  "result_high_view",
  "result_solution_click",
  "result_report_save_click",
  "high_risk_summary_email_click",
  "high_risk_care_guide_download",
  "reassessment_reminder_requested",
  "product_passport_preview_view",
  "product_passport_assessment_cta_click",
  "fulfillment_map_view",
  "shipping_policy_click",
  "faq_view",
  "faq_item_expand",
  "protocol_basis_view",
  "final_cta_click",
  "product_suitability_cta_click",
  "product_evidence_click",
  "product_cta_hidden_high_risk",
  "product_purchase_ready_click",
  "recommendation_clicked",
  "pdd_redirect_clicked",
  "tool_completed",
  "marketing_campaign_planned",
  "marketing_asset_generated",
  "marketing_geoflow_task_created",
  "marketing_autopilot_run",
  "miniprogram_product_viewed",
  "miniprogram_pdd_clicked",
  "wechat_article_published",
  "wechat_article_cta_clicked",
] as const;

const forbiddenAnalyticsMetadataKeys = [
  "address",
  "allergies",
  "allergy",
  "answer",
  "answers",
  "comment",
  "contact",
  "contactName",
  "customerName",
  "displayName",
  "email",
  "firstName",
  "freeText",
  "free_text",
  "fullName",
  "healthNote",
  "healthNotes",
  "healthProfile",
  "health_profile",
  "healthAnswers",
  "lastName",
  "medication",
  "medications",
  "mobile",
  "mobilePhone",
  "name",
  "nickname",
  "notes",
  "openid",
  "orderComment",
  "orderComments",
  "patientName",
  "phone",
  "phoneNumber",
  "profile",
  "profileJson",
  "raw",
  "rawAnswer",
  "rawAnswers",
  "rawHealthAnswers",
  "symptom",
  "symptoms",
  "wechat",
  "wechatId",
  "wechatOpenId",
  "weixin",
  "whatsapp",
  "whatsappNumber",
  "wxid",
] as const;

function normalizeMetadataKey(key: string) {
  return key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

const forbiddenAnalyticsMetadataKeySet = new Set(
  forbiddenAnalyticsMetadataKeys.map(normalizeMetadataKey),
);

function findForbiddenMetadataPath(
  value: unknown,
  path: string[] = [],
): string[] | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const nestedPath = findForbiddenMetadataPath(value[index], [
        ...path,
        String(index),
      ]);
      if (nestedPath) {
        return nestedPath;
      }
    }
    return null;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (forbiddenAnalyticsMetadataKeySet.has(normalizeMetadataKey(key))) {
      return [...path, key];
    }

    if (
      typeof nestedValue === "string" &&
      /[^\s@]+@[^\s@]+\.[^\s@]+/.test(nestedValue)
    ) {
      return [...path, key];
    }

    const nestedPath = findForbiddenMetadataPath(nestedValue, [...path, key]);
    if (nestedPath) {
      return nestedPath;
    }
  }

  return null;
}

const analyticsMetadataSchema = z
  .record(z.string(), z.unknown())
  .superRefine((metadata, context) => {
    const forbiddenPath = findForbiddenMetadataPath(metadata);
    if (!forbiddenPath) {
      return;
    }

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Analytics metadata contains forbidden sensitive field: ${forbiddenPath.join(".")}`,
      path: forbiddenPath,
    });
  });

const analyticsEventInputSchema = z.object({
  name: z.enum(analyticsEventNames),
  sessionId: z.string().optional(),
  consultationId: z.string().optional(),
  source: z.string().optional(),
  solutionSlug: z.string().optional(),
  productId: z.string().optional(),
  metadata: analyticsMetadataSchema.optional(),
}).strict();

function withDefinedCommonMetadata(
  metadata: Record<string, unknown>,
  common: Record<string, unknown>,
) {
  const next = { ...metadata };

  for (const [key, value] of Object.entries(common)) {
    if (value !== undefined && value !== null && value !== "") {
      next[key] = value;
    }
  }

  return next;
}

export function withCommonAnalyticsMetadata(
  event: z.infer<typeof analyticsEventInputSchema>,
) {
  const metadata = event.metadata ?? {};

  return {
    ...event,
    metadata: withDefinedCommonMetadata(metadata, {
      session_id: metadata.session_id ?? event.sessionId,
      assessment_id: metadata.assessment_id,
      assessment_version: metadata.assessment_version ?? ASSESSMENT_VERSION,
      rule_version: metadata.rule_version ?? ASSESSMENT_RULE_VERSION,
      entry_scenario: metadata.entry_scenario,
      selected_scenario: metadata.selected_scenario,
      risk_level: metadata.risk_level ?? metadata.riskLevel,
      entry_source: metadata.entry_source ?? event.source,
      timestamp:
        typeof metadata.timestamp === "string"
          ? metadata.timestamp
          : new Date().toISOString(),
    }),
  };
}

export const analyticsEventSchema = analyticsEventInputSchema.transform(
  withCommonAnalyticsMetadata,
);

export type AnalyticsEvent = z.input<typeof analyticsEventSchema>;

export function createAnalyticsEvent(event: AnalyticsEvent): AnalyticsEvent {
  return analyticsEventSchema.parse(event);
}

export function trackAnalyticsEvent(event: AnalyticsEvent) {
  const parsed = analyticsEventSchema.safeParse(event);
  if (!parsed.success || typeof window === "undefined") {
    return;
  }

  const body = JSON.stringify(parsed.data);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    return;
  }

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics must never block the user path.
  });
}
