import type { Product } from "@/lib/data/products";
import { toRiskTriageLevel, type RiskTriageLevel } from "@/lib/health/risk-triage";
import type { AssessmentScenario } from "@/schemas/assessment-router";
import type { PlanSlug } from "@/types";

export const PRODUCT_SUITABILITY_STORAGE_KEY = "rongwang_product_suitability_assessment";
export const PRODUCT_SUITABILITY_VALID_DAYS = 30;

export const requiredUnsuitableWarnings = [
  "孕期 / 哺乳期",
  "正在服药",
  "慢病管理中",
  "成分过敏",
  "症状严重、持续或快速加重",
] as const;

export const highRiskPurchaseHiddenMessage =
  "你的评估结果建议优先咨询医生或药师，暂不展示购买入口。";

export interface ProductSuitabilityAssessment {
  assessment_id?: string;
  consultation_id?: string;
  assessment_version?: string;
  rule_version?: string;
  risk_level: RiskTriageLevel;
  selected_scenario?: AssessmentScenario;
  recommended_solution_type?: string;
  completed_at: string;
}

export type ProductSuitabilityState =
  | "unknown"
  | "matched"
  | "not_matching"
  | "high";

const planScenarioMap: Record<PlanSlug, AssessmentScenario> = {
  sleep: "sleep",
  fatigue: "fatigue",
  immune: "immunity",
  liver: "alcohol",
  beauty: "female",
  stress: "fatigue",
  cardio: "unknown",
};

const scenarioLabels: Record<AssessmentScenario, string> = {
  unknown: "不确定，AI 先帮我判断",
  sleep: "睡眠支持",
  fatigue: "疲劳恢复支持",
  alcohol: "应酬后支持",
  immunity: "免疫状态支持",
  female: "女性健康支持",
  male: "男性精力支持",
};

const solutionScenarioMap: Record<string, AssessmentScenario> = {
  sleep: "sleep",
  fatigue: "fatigue",
  liver: "alcohol",
  immune: "immunity",
  male_health: "male",
  "male-health": "male",
  female_health: "female",
  "female-health": "female",
  beauty: "female",
  stress: "fatigue",
};

export function getProductAssessmentScenario(product: Pick<Product, "plans">) {
  return product.plans.map((plan) => planScenarioMap[plan]).find(Boolean) ?? "unknown";
}

export function getProductAssessmentHref(product: Pick<Product, "plans">) {
  return `/assessment?scenario=${getProductAssessmentScenario(product)}`;
}

export function getProductScenarioLabel(scenario: AssessmentScenario) {
  return scenarioLabels[scenario];
}

export function getProductEvidenceHref(productSlug: string) {
  return `/products/${productSlug}#product-evidence`;
}

export function getProductSuitableForCopy(scenario: AssessmentScenario) {
  return `完成健康分层后，结果为 LOW / MEDIUM，且当前方向匹配「${getProductScenarioLabel(scenario)}」的用户。`;
}

export function getProductUnsuitableWarnings(productWarnings: readonly string[] = []) {
  return Array.from(new Set([...requiredUnsuitableWarnings, ...productWarnings]));
}

export function solutionToAssessmentScenario(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return solutionScenarioMap[value.trim().toLowerCase()] ?? null;
}

function isAssessmentScenario(value: unknown): value is AssessmentScenario {
  return (
    value === "unknown" ||
    value === "sleep" ||
    value === "fatigue" ||
    value === "alcohol" ||
    value === "immunity" ||
    value === "female" ||
    value === "male"
  );
}

export function normalizeProductSuitabilityAssessment(
  value: unknown,
): ProductSuitabilityAssessment | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const rawRiskLevel = typeof record.risk_level === "string" ? record.risk_level : "";
  const completedAt = typeof record.completed_at === "string" ? record.completed_at : "";
  const completedTime = Date.parse(completedAt);

  if (!rawRiskLevel || Number.isNaN(completedTime)) {
    return null;
  }

  return {
    assessment_id: typeof record.assessment_id === "string" ? record.assessment_id : undefined,
    consultation_id: typeof record.consultation_id === "string" ? record.consultation_id : undefined,
    assessment_version:
      typeof record.assessment_version === "string" ? record.assessment_version : undefined,
    rule_version: typeof record.rule_version === "string" ? record.rule_version : undefined,
    risk_level: toRiskTriageLevel(rawRiskLevel),
    selected_scenario: isAssessmentScenario(record.selected_scenario)
      ? record.selected_scenario
      : undefined,
    recommended_solution_type:
      typeof record.recommended_solution_type === "string"
        ? record.recommended_solution_type
        : undefined,
    completed_at: completedAt,
  };
}

export function isProductSuitabilityAssessmentValid(
  assessment: ProductSuitabilityAssessment | null,
  now = Date.now(),
) {
  if (!assessment) {
    return false;
  }

  const completedTime = Date.parse(assessment.completed_at);
  if (Number.isNaN(completedTime)) {
    return false;
  }

  return now - completedTime <= PRODUCT_SUITABILITY_VALID_DAYS * 24 * 60 * 60 * 1000;
}

export function doesAssessmentMatchProduct(
  assessment: ProductSuitabilityAssessment | null,
  productScenario: AssessmentScenario,
) {
  if (!isProductSuitabilityAssessmentValid(assessment)) {
    return false;
  }

  if (assessment?.selected_scenario === productScenario) {
    return true;
  }

  return solutionToAssessmentScenario(assessment?.recommended_solution_type) === productScenario;
}

export function getProductSuitabilityState(
  assessment: ProductSuitabilityAssessment | null,
  productScenario: AssessmentScenario,
): ProductSuitabilityState {
  if (!isProductSuitabilityAssessmentValid(assessment)) {
    return "unknown";
  }

  if (assessment?.risk_level === "high") {
    return "high";
  }

  return doesAssessmentMatchProduct(assessment, productScenario) ? "matched" : "not_matching";
}

export function readStoredProductSuitabilityAssessment() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return normalizeProductSuitabilityAssessment(
      JSON.parse(window.localStorage.getItem(PRODUCT_SUITABILITY_STORAGE_KEY) ?? "null"),
    );
  } catch {
    return null;
  }
}

export function persistProductSuitabilityAssessment(
  assessment: ProductSuitabilityAssessment,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      PRODUCT_SUITABILITY_STORAGE_KEY,
      JSON.stringify(assessment),
    );
  } catch {
    // Local persistence is best-effort and never blocks assessment completion.
  }
}
