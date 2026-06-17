import { z } from "zod";
import {
  ASSESSMENT_RULE_VERSION,
  ASSESSMENT_VERSION,
  createAssessmentId,
  type AssessmentRouterContext,
} from "@/schemas/assessment-router";

export const ASSESSMENT_CONSENT_SOURCE = "assessment_start";

export const assessmentConsentSchema = z.object({
  report_consent: z.literal(true),
  marketing_opt_in: z.boolean(),
  consent_timestamp: z.string().datetime(),
  consent_source: z.literal(ASSESSMENT_CONSENT_SOURCE),
  assessment_id: z.string().trim().min(1).max(80),
  assessment_version: z.literal(ASSESSMENT_VERSION),
  rule_version: z.literal(ASSESSMENT_RULE_VERSION),
});

export type AssessmentConsent = z.infer<typeof assessmentConsentSchema>;

export function createAssessmentConsentRecord(input: {
  assessmentContext?: AssessmentRouterContext | null;
  assessmentId?: string;
  marketingOptIn?: boolean;
  consentTimestamp?: string;
}): AssessmentConsent {
  return assessmentConsentSchema.parse({
    report_consent: true,
    marketing_opt_in: Boolean(input.marketingOptIn),
    consent_timestamp: input.consentTimestamp ?? new Date().toISOString(),
    consent_source: ASSESSMENT_CONSENT_SOURCE,
    assessment_id:
      input.assessmentContext?.assessment_id ?? input.assessmentId ?? createAssessmentId(),
    assessment_version:
      input.assessmentContext?.assessment_version ?? ASSESSMENT_VERSION,
    rule_version: input.assessmentContext?.rule_version ?? ASSESSMENT_RULE_VERSION,
  });
}

export function getAssessmentConsentAnalyticsMetadata(consent: AssessmentConsent) {
  return {
    assessment_id: consent.assessment_id,
    assessment_version: consent.assessment_version,
    rule_version: consent.rule_version,
    consent_source: consent.consent_source,
    report_consent: consent.report_consent,
    marketing_opt_in: consent.marketing_opt_in,
  };
}
