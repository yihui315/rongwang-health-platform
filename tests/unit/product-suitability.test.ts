import test from "node:test";
import assert from "node:assert/strict";
import {
  doesAssessmentMatchProduct,
  getProductAssessmentHref,
  getProductAssessmentScenario,
  getProductSuitabilityState,
  getProductUnsuitableWarnings,
  normalizeProductSuitabilityAssessment,
  requiredUnsuitableWarnings,
} from "@/lib/product-suitability";

test("product suitability maps product plans into assessment scenario routes", () => {
  assert.equal(getProductAssessmentScenario({ plans: ["sleep"] }), "sleep");
  assert.equal(getProductAssessmentScenario({ plans: ["liver"] }), "alcohol");
  assert.equal(getProductAssessmentScenario({ plans: ["immune"] }), "immunity");
  assert.equal(getProductAssessmentHref({ plans: ["beauty"] }), "/assessment?scenario=female");
});

test("product suitability states gate unknown, matching, and high-risk users", () => {
  const now = Date.parse("2026-05-04T00:00:00.000Z");
  const lowMatching = normalizeProductSuitabilityAssessment({
    risk_level: "low",
    selected_scenario: "sleep",
    recommended_solution_type: "sleep",
    completed_at: "2026-05-03T00:00:00.000Z",
  });
  const mediumMatching = normalizeProductSuitabilityAssessment({
    risk_level: "medium",
    recommended_solution_type: "liver",
    completed_at: "2026-05-03T00:00:00.000Z",
  });
  const highRisk = normalizeProductSuitabilityAssessment({
    risk_level: "urgent",
    selected_scenario: "sleep",
    completed_at: "2026-05-03T00:00:00.000Z",
  });

  assert.equal(doesAssessmentMatchProduct(lowMatching, "sleep"), true);
  assert.equal(getProductSuitabilityState(lowMatching, "sleep"), "matched");
  assert.equal(getProductSuitabilityState(mediumMatching, "alcohol"), "matched");
  assert.equal(getProductSuitabilityState(highRisk, "sleep"), "high");
  assert.equal(
    getProductSuitabilityState(
      {
        risk_level: "low",
        selected_scenario: "sleep",
        completed_at: "2026-03-01T00:00:00.000Z",
      },
      "sleep",
    ),
    "unknown",
  );
  assert.equal(
    getProductSuitabilityState(
      {
        risk_level: "low",
        selected_scenario: "sleep",
        completed_at: new Date(now).toISOString(),
      },
      "fatigue",
    ),
    "not_matching",
  );
});

test("product suitability boundaries include the required unsuitable warnings", () => {
  const warnings = getProductUnsuitableWarnings(["正在服药"]);

  for (const warning of requiredUnsuitableWarnings) {
    assert.equal(warnings.includes(warning), true);
  }

  assert.equal(warnings.filter((warning) => warning === "正在服药").length, 1);
  assert.deepEqual(requiredUnsuitableWarnings, [
    "孕期 / 哺乳期",
    "正在服药",
    "慢病管理中",
    "成分过敏",
    "症状严重、持续或快速加重",
  ]);
});
