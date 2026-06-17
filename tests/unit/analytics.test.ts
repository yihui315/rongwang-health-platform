import test from "node:test";
import assert from "node:assert/strict";
import { createAnalyticsEvent } from "@/lib/analytics";
import {
  ASSESSMENT_RULE_VERSION,
  ASSESSMENT_VERSION,
} from "@/schemas/assessment-router";

test("analytics events accept the MVP conversion and homepage hero metrics", () => {
  const eventNames = [
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
    "marketing_autopilot_run",
  ] as const;

  for (const name of eventNames) {
    assert.equal(createAnalyticsEvent({ name }).name, name);
  }
});

test("analytics events add common metadata without PII", () => {
  const event = createAnalyticsEvent({
    name: "assessment_completed",
    sessionId: "anon-session",
    source: "assessment_router",
    metadata: {
      assessment_id: "rhtp_test",
      assessment_version: "RHTP-assessment-v1.0",
      rule_version: "RHTP-rules-v1.0",
      entry_scenario: "sleep",
      selected_scenario: "sleep",
      risk_level: "low",
    },
  });

  assert.equal(event.metadata?.session_id, "anon-session");
  assert.equal(event.metadata?.entry_source, "assessment_router");
  assert.equal(event.metadata?.assessment_version, "RHTP-assessment-v1.0");
  assert.equal(event.metadata?.rule_version, "RHTP-rules-v1.0");
  assert.equal(typeof event.metadata?.timestamp, "string");
  assert.equal("email" in (event.metadata ?? {}), false);
  assert.equal("phone" in (event.metadata ?? {}), false);
});

test("analytics events add default version metadata when unavailable", () => {
  const event = createAnalyticsEvent({
    name: "protocol_hero_view",
    sessionId: "anon-session",
    source: "homepage",
  });

  assert.equal(event.metadata?.session_id, "anon-session");
  assert.equal(event.metadata?.entry_source, "homepage");
  assert.equal(event.metadata?.assessment_version, ASSESSMENT_VERSION);
  assert.equal(event.metadata?.rule_version, ASSESSMENT_RULE_VERSION);
  assert.match(String(event.metadata?.timestamp), /^\d{4}-\d{2}-\d{2}T/);
});

test("analytics events reject forbidden sensitive metadata", () => {
  assert.throws(() =>
    createAnalyticsEvent({
      name: "assessment_started",
      metadata: {
        answers: [{ question: "sleep", answer: "raw free text" }],
      },
    }),
  );

  assert.throws(() =>
    createAnalyticsEvent({
      name: "assessment_completed",
      metadata: {
        nested: { email: "person@example.com" },
      },
    }),
  );

  assert.throws(() =>
    createAnalyticsEvent({
      name: "assessment_completed",
      metadata: {
        nested: { safeKey: "person@example.com" },
      },
    }),
  );
});

test("analytics events reject forbidden top-level payload fields", () => {
  assert.throws(() =>
    createAnalyticsEvent({
      name: "assessment_started",
      // @ts-expect-error - this intentionally verifies runtime validation.
      email: "person@example.com",
    }),
  );
});

test("analytics events reject unknown metric names", () => {
  assert.throws(() =>
    createAnalyticsEvent({
      // @ts-expect-error - this intentionally verifies runtime validation.
      name: "unknown_metric",
    }),
  );
});
