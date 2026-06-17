import test from "node:test";
import assert from "node:assert/strict";
import {
  ASSESSMENT_RULE_VERSION,
  ASSESSMENT_VERSION,
  createAssessmentRouterContext,
  normalizeAssessmentEntrySource,
  normalizeAssessmentScenario,
  updateAssessmentRouterContextScenario,
} from "@/schemas/assessment-router";
import { buildScenarioConsultFormState } from "@/components/ai/consult-form-state";

test("assessment router normalizes invalid or missing scenarios to unknown", () => {
  assert.equal(normalizeAssessmentScenario("sleep"), "sleep");
  assert.equal(normalizeAssessmentScenario("female"), "female");
  assert.equal(normalizeAssessmentScenario("liver"), "unknown");
  assert.equal(normalizeAssessmentScenario(undefined), "unknown");
});

test("assessment router context stores version, scenario and source metadata", () => {
  const context = createAssessmentRouterContext({
    assessmentId: "rhtp_test",
    entryScenario: "alcohol",
    entrySource: "Homepage Selector",
    startedAt: "2026-05-03T00:00:00.000Z",
  });

  assert.equal(context.assessment_id, "rhtp_test");
  assert.equal(context.assessment_version, ASSESSMENT_VERSION);
  assert.equal(context.rule_version, ASSESSMENT_RULE_VERSION);
  assert.equal(context.entry_scenario, "alcohol");
  assert.equal(context.selected_scenario, "alcohol");
  assert.equal(context.entry_source, "homepage_selector");

  const changed = updateAssessmentRouterContextScenario(context, "sleep");
  assert.equal(changed.entry_scenario, "alcohol");
  assert.equal(changed.selected_scenario, "sleep");
});

test("assessment entry source is privacy-safe and bounded", () => {
  assert.equal(normalizeAssessmentEntrySource("homepage_chief_complaint_selector"), "homepage_chief_complaint_selector");
  assert.equal(normalizeAssessmentEntrySource("Email Campaign / May 2026"), "email_campaign___may_2026");
  assert.equal(normalizeAssessmentEntrySource(""), "assessment_router");
});

test("scenario presets seed the unified form without creating separate engines", () => {
  const alcohol = buildScenarioConsultFormState("alcohol");
  assert.deepEqual(alcohol.symptoms, ["饮酒后疲惫", "熬夜后不适"]);
  assert.equal(alcohol.alcohol, true);
  assert.equal(alcohol.goal, "减少熬夜和应酬后的不适");

  const unknown = buildScenarioConsultFormState("unknown");
  assert.deepEqual(unknown.symptoms, []);
  assert.equal(unknown.goal, "改善白天精力");
});
