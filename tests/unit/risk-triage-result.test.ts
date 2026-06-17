import test from "node:test";
import assert from "node:assert/strict";
import { metadata } from "@/app/assessment/result/[id]/page";
import { buildConsultationResultTracking } from "@/lib/data/consultations";
import {
  canShowProductPath,
  riskTriageCopy,
  toRiskTriageLevel,
} from "@/lib/health/risk-triage";

test("risk triage maps urgent and high into the protected high-risk page", () => {
  assert.equal(toRiskTriageLevel("low"), "low");
  assert.equal(toRiskTriageLevel("medium"), "medium");
  assert.equal(toRiskTriageLevel("high"), "high");
  assert.equal(toRiskTriageLevel("urgent"), "high");
});

test("only low risk can enter the product-support path", () => {
  assert.equal(canShowProductPath("low"), true);
  assert.equal(canShowProductPath("medium"), false);
  assert.equal(canShowProductPath("high"), false);
  assert.equal(canShowProductPath("urgent"), false);
});

test("risk result page copy preserves the required high-risk no-purchase boundary", () => {
  assert.match(riskTriageCopy.low.title, /当前未识别到明显高风险信号/);
  assert.match(riskTriageCopy.medium.title, /当前建议谨慎观察/);
  assert.match(riskTriageCopy.high.title, /建议优先线下咨询/);
  assert.match(riskTriageCopy.high.body, /不会在本结果页展示购买入口/);
});

test("personal assessment result pages are noindex", () => {
  assert.deepEqual(metadata.robots, {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  });
});

test("completed assessment tracking stores versions, generated time, scenario and risk", () => {
  const tracking = buildConsultationResultTracking({
    generatedAt: "2026-05-04T00:00:00.000Z",
    riskLevel: "medium",
    assessment: {
      assessment_id: "rhtp_test",
      assessment_version: "RHTP-assessment-v1.0",
      rule_version: "RHTP-rules-v1.0",
      entry_scenario: "sleep",
      selected_scenario: "fatigue",
      entry_source: "homepage",
      started_at: "2026-05-04T00:00:00.000Z",
    },
  });

  assert.equal(tracking.generated_at, "2026-05-04T00:00:00.000Z");
  assert.equal(tracking.assessment_version, "RHTP-assessment-v1.0");
  assert.equal(tracking.rule_version, "RHTP-rules-v1.0");
  assert.equal(tracking.selected_scenario, "fatigue");
  assert.equal(tracking.risk_level, "medium");
});
