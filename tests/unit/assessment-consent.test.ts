import test from "node:test";
import assert from "node:assert/strict";
import {
  ASSESSMENT_CONSENT_SOURCE,
  createAssessmentConsentRecord,
  getAssessmentConsentAnalyticsMetadata,
} from "@/schemas/assessment-consent";
import { createAssessmentRouterContext } from "@/schemas/assessment-router";
import { consultationRequestSchema } from "@/schemas/health";
import { buildScenarioConsultFormState } from "@/components/ai/consult-form-state";

test("assessment consent persists required consent and optional marketing choice", () => {
  const context = createAssessmentRouterContext({
    assessmentId: "rhtp_consent_test",
    entryScenario: "sleep",
    startedAt: "2026-05-03T00:00:00.000Z",
  });
  const consent = createAssessmentConsentRecord({
    assessmentContext: context,
    marketingOptIn: false,
    consentTimestamp: "2026-05-03T01:00:00.000Z",
  });

  assert.equal(consent.report_consent, true);
  assert.equal(consent.marketing_opt_in, false);
  assert.equal(consent.consent_source, ASSESSMENT_CONSENT_SOURCE);
  assert.equal(consent.assessment_id, context.assessment_id);
  assert.equal(consent.assessment_version, context.assessment_version);
  assert.equal(consent.rule_version, context.rule_version);
});

test("assessment consent analytics metadata excludes health answers and contact fields", () => {
  const consent = createAssessmentConsentRecord({
    assessmentId: "rhtp_consent_meta",
    marketingOptIn: true,
    consentTimestamp: "2026-05-03T01:00:00.000Z",
  });
  const metadata = getAssessmentConsentAnalyticsMetadata(consent);

  assert.deepEqual(Object.keys(metadata).sort(), [
    "assessment_id",
    "assessment_version",
    "consent_source",
    "marketing_opt_in",
    "report_consent",
    "rule_version",
  ]);
  assert.equal(metadata.marketing_opt_in, true);
});

test("consultation request accepts consent beside the unified assessment payload", () => {
  const context = createAssessmentRouterContext({
    assessmentId: "rhtp_request_consent",
    entryScenario: "fatigue",
    startedAt: "2026-05-03T00:00:00.000Z",
  });
  const consent = createAssessmentConsentRecord({
    assessmentContext: context,
    marketingOptIn: false,
    consentTimestamp: "2026-05-03T01:00:00.000Z",
  });
  const form = buildScenarioConsultFormState("fatigue");
  const parsed = consultationRequestSchema.safeParse({
    profile: {
      age: 32,
      gender: form.gender,
      symptoms: form.symptoms,
      duration: form.duration,
      lifestyle: {
        sleep: form.sleep,
        alcohol: form.alcohol,
        smoking: form.smoking,
        exercise: form.exercise,
      },
      goal: form.goal,
      medications: "",
      allergies: "",
    },
    assessment: context,
    consent,
  });

  assert.equal(parsed.success, true);
});
