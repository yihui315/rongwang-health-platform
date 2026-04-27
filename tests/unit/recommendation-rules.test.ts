import test from "node:test";
import assert from "node:assert/strict";
import { products } from "@/data/products";
import { doesRecommendationRuleMatch, getRecommendationsFromRules } from "@/lib/health/rule-mapper";
import type { HealthConsultationResult } from "@/schemas/ai-result";
import type { HealthProfile } from "@/schemas/health";
import type { RecommendationRuleRecord } from "@/schemas/recommendation-rule";

const profile: HealthProfile = {
  age: 36,
  gender: "male",
  symptoms: ["疲劳", "熬夜后恢复慢"],
  duration: "1 到 4 周",
  lifestyle: {
    sleep: "经常熬夜或睡眠不足",
    alcohol: true,
    smoking: false,
    exercise: "每周 1 到 2 次",
  },
  goal: "改善白天精力和应酬后的恢复状态",
  medications: "",
  allergies: "",
};

const fatigueResult: HealthConsultationResult = {
  summary: "当前更像是恢复不足和睡眠债。",
  riskLevel: "medium",
  possibleFactors: ["睡眠恢复不足"],
  redFlags: [],
  lifestyleAdvice: ["先稳定作息"],
  supplementDirections: ["B 族维生素方向"],
  otcDirections: [],
  recommendedSolutionType: "fatigue",
  productRecommendationReason: "优先查看恢复支持方向。",
  disclaimer: "本内容仅供健康教育和一般参考。",
};

function requireProductWithPlan(plan: string) {
  const product = products.find((item) => item.plans.includes(plan as never));
  assert.ok(product, `Expected a seeded product with plan ${plan}`);
  return product;
}

test("recommendation rules match consultation result and profile conditions", () => {
  const rule: RecommendationRuleRecord = {
    name: "Fatigue recovery override",
    active: true,
    priority: 10,
    condition: {
      solutionTypes: ["fatigue"],
      riskLevels: ["medium"],
      genders: ["male"],
      minAge: 30,
      maxAge: 45,
      symptomIncludes: ["疲劳"],
      goalIncludes: ["恢复"],
      lifestyle: {
        alcohol: true,
        sleepIncludes: ["熬夜"],
      },
    },
    productIds: [requireProductWithPlan("fatigue").slug],
  };

  assert.equal(doesRecommendationRuleMatch(rule, fatigueResult, profile), true);
});

test("rule-based recommendations use active priority order and ignore inactive rules", () => {
  const liverProduct = requireProductWithPlan("liver");
  const fatigueProduct = requireProductWithPlan("fatigue");
  const sleepProduct = requireProductWithPlan("sleep");

  const rules: RecommendationRuleRecord[] = [
    {
      name: "Inactive rule",
      active: false,
      priority: 1,
      condition: { solutionTypes: ["fatigue"] },
      productIds: [sleepProduct.slug],
    },
    {
      name: "Alcohol recovery priority",
      active: true,
      priority: 5,
      condition: {
        solutionTypes: ["fatigue"],
        lifestyle: { alcohol: true },
      },
      productIds: [liverProduct.slug],
    },
    {
      name: "Baseline fatigue",
      active: true,
      priority: 20,
      condition: { solutionTypes: ["fatigue"] },
      productIds: [fatigueProduct.slug],
    },
  ];

  const recommendations = getRecommendationsFromRules(products, rules, fatigueResult, profile, 3);

  assert.equal(recommendations[0]?.productSlug, liverProduct.slug);
  assert.equal(recommendations[1]?.productSlug, fatigueProduct.slug);
  assert.equal(
    recommendations.some((item) => item.productSlug === sleepProduct.slug),
    false,
  );
});

test("urgent results never return rule-based product recommendations", () => {
  const urgentResult: HealthConsultationResult = {
    ...fatigueResult,
    riskLevel: "urgent",
    redFlags: ["胸痛或呼吸困难"],
  };

  const rule: RecommendationRuleRecord = {
    name: "Should not run",
    active: true,
    priority: 1,
    condition: {},
    productIds: [requireProductWithPlan("fatigue").slug],
  };

  assert.deepEqual(getRecommendationsFromRules(products, [rule], urgentResult, profile), []);
});
