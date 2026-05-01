import test from "node:test";
import assert from "node:assert/strict";
import { createHealthConsultation } from "@/lib/health/consult";

test("health consultation uses the configured default AI provider", async () => {
  const previous = {
    aiProvider: process.env.AI_PROVIDER,
    featureAiProvider: process.env.FEATURE_AI_PROVIDER,
    featureDbRules: process.env.FEATURE_DB_RECOMMENDATION_RULES,
    deepSeekApiKey: process.env.DEEPSEEK_API_KEY,
    deepSeekBaseUrl: process.env.DEEPSEEK_BASE_URL,
    deepSeekModel: process.env.DEEPSEEK_MODEL,
    fetch: globalThis.fetch,
  };
  const requests: Array<string> = [];

  process.env.AI_PROVIDER = "deepseek";
  process.env.FEATURE_AI_PROVIDER = "true";
  process.env.FEATURE_DB_RECOMMENDATION_RULES = "false";
  process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
  delete process.env.DEEPSEEK_BASE_URL;
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  globalThis.fetch = async (input: string | URL | Request) => {
    requests.push(String(input));
    assert.equal(String(input), "https://api.deepseek.com/chat/completions");

    return new Response(
      JSON.stringify({
        model: "deepseek-v4-flash",
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "Low-risk fatigue pattern.",
                riskLevel: "low",
                possibleFactors: ["Sleep debt"],
                redFlags: [],
                lifestyleAdvice: ["Keep a stable sleep schedule."],
                supplementDirections: ["Basic nutrient support"],
                otcDirections: ["Consult a pharmacist if symptoms persist."],
                recommendedSolutionType: "fatigue",
                productRecommendationReason: "Rule-based product matching only.",
                disclaimer: "Educational information only.",
              }),
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  try {
    const consultation = await createHealthConsultation({
      age: 38,
      gender: "male",
      symptoms: ["容易疲劳", "白天犯困"],
      duration: "1 到 3 个月",
      lifestyle: {
        sleep: "经常熬夜或睡眠不足",
        alcohol: false,
        smoking: false,
        exercise: "几乎不运动",
      },
      goal: "改善白天精力",
      medications: "无",
      allergies: "无",
    });

    assert.equal(requests.length, 1);
    assert.equal(consultation.aiLog?.provider, "deepseek");
    assert.equal(consultation.aiLog?.status, "success");
    assert.equal(consultation.aiLog?.model, "deepseek-v4-flash");
  } finally {
    globalThis.fetch = previous.fetch;
    process.env.AI_PROVIDER = previous.aiProvider;
    process.env.FEATURE_AI_PROVIDER = previous.featureAiProvider;
    process.env.FEATURE_DB_RECOMMENDATION_RULES = previous.featureDbRules;
    process.env.DEEPSEEK_API_KEY = previous.deepSeekApiKey;
    process.env.DEEPSEEK_BASE_URL = previous.deepSeekBaseUrl;
    process.env.DEEPSEEK_MODEL = previous.deepSeekModel;
  }
});
