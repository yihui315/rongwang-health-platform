import test from "node:test";
import assert from "node:assert/strict";
import { products } from "@/data/products";
import { getRecommendations, getRecommendationsFromCatalog } from "@/lib/health/recommendations";
import type { HealthConsultationResult } from "@/schemas/ai-result";
import type { HealthProfile } from "@/schemas/health";

const profile: HealthProfile = {
  age: 36,
  gender: "male",
  symptoms: ["疲劳"],
  duration: "1 到 4 周",
  lifestyle: {
    sleep: "经常熬夜或睡眠不足",
    alcohol: false,
    smoking: false,
    exercise: "每周 1 到 2 次",
  },
  goal: "改善白天精力",
  medications: "",
  allergies: "",
};

test("urgent consultation results never return product recommendations", () => {
  const urgentResult: HealthConsultationResult = {
    summary: "存在需要尽快线下处理的风险信号。",
    riskLevel: "urgent",
    possibleFactors: [],
    redFlags: ["胸痛或呼吸困难"],
    lifestyleAdvice: ["请尽快就医"],
    supplementDirections: [],
    otcDirections: [],
    recommendedSolutionType: "general",
    productRecommendationReason: "高风险情况不展示商品推荐。",
    disclaimer: "本内容仅供健康教育和一般参考。",
  };

  assert.deepEqual(getRecommendations(urgentResult, profile), []);
});

test("non-urgent consultation results can return rule-based recommendations", () => {
  const result: HealthConsultationResult = {
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

  assert.ok(getRecommendations(result, profile).length > 0);
  assert.deepEqual(
    getRecommendationsFromCatalog(products, result, profile).map((item) => item.id),
    getRecommendations(result, profile).map((item) => item.id),
  );
});

test("female health consultation results return rule-based support directions", () => {
  const result: HealthConsultationResult = {
    summary: "当前更适合先围绕女性周期、疲劳恢复和睡眠节律做健康教育评估。",
    riskLevel: "medium",
    possibleFactors: ["周期节律波动", "睡眠恢复不足"],
    redFlags: [],
    lifestyleAdvice: ["先记录周期、睡眠和疲劳变化"],
    supplementDirections: ["铁/叶酸/维生素 D 方向", "睡眠恢复方向"],
    otcDirections: ["如有持续疼痛或异常出血，请先咨询医生或药师"],
    recommendedSolutionType: "female_health",
    productRecommendationReason: "女性健康方向由规则引擎匹配相关支持产品。",
    disclaimer: "本内容仅供健康教育和一般参考。",
  };

  const femaleProfile: HealthProfile = {
    ...profile,
    gender: "female",
    symptoms: ["经期前后疲劳", "睡眠不稳", "气色状态波动"],
    goal: "改善女性周期相关疲劳与日常状态",
  };

  const recommendations = getRecommendations(result, femaleProfile);
  assert.ok(recommendations.length > 0);
});
