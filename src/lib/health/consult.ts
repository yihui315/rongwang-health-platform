import { createAiLogRecord } from "@/lib/ai/logging";
import { parseHealthConsultationOutput } from "@/lib/ai/parse";
import { getHealthConsultPromptBundle } from "@/lib/ai/prompts";
import { generateTextWithProvider } from "@/lib/ai/provider";
import { isFeatureEnabled } from "@/lib/feature-flags";
import type { AiLogRecord } from "@/schemas/ai-log";
import { type HealthConsultationResult, type SolutionType } from "@/schemas/ai-result";
import type { HealthProfile } from "@/schemas/health";
import { getRecommendationsForConsultation } from "./recommendation-engine";
import type { ProductRecommendation } from "./recommendations";
import { MEDICAL_DISCLAIMER, applySafetyToResult, assessMedicalSafety, createUrgentResult, type SafetyAssessment } from "./safety";

function unique(items: string[], limit = 5) {
  return Array.from(new Set(items.filter(Boolean))).slice(0, limit);
}

function inferSolutionType(profile: HealthProfile): SolutionType {
  const text = `${profile.symptoms.join(" ")} ${profile.goal} ${profile.duration}`.toLowerCase();
  const scores: Record<SolutionType, number> = {
    sleep: 0,
    fatigue: 0,
    liver: 0,
    immune: 0,
    male_health: 0,
    female_health: 0,
    general: 0,
  };

  const keywordMap: Record<Exclude<SolutionType, "general">, string[]> = {
    sleep: ["睡眠", "失眠", "入睡", "夜醒", "浅睡", "熬夜"],
    fatigue: ["疲劳", "疲惫", "犯困", "精力", "恢复慢", "没劲"],
    liver: ["饮酒", "应酬", "熬夜", "肝", "宿醉"],
    immune: ["感冒", "换季", "免疫", "恢复慢", "体质"],
    male_health: ["男性", "精力状态", "恢复效率", "应酬压力"],
    female_health: ["女性", "经期", "月经", "痛经", "周期", "气色", "更年期", "备孕", "皮肤", "睡眠情绪"],
  };

  for (const [type, keywords] of Object.entries(keywordMap) as Array<[Exclude<SolutionType, "general">, string[]]>) {
    scores[type] += keywords.filter((keyword) => text.includes(keyword)).length * 2;
  }

  if (profile.lifestyle.alcohol) {
    scores.liver += 3;
  }

  if (profile.lifestyle.sleep.includes("经常熬夜")) {
    scores.sleep += 2;
    scores.fatigue += 2;
  }

  if (profile.gender === "male") {
    scores.male_health += 1;
  }

  if (profile.gender === "female") {
    scores.female_health += 1;
  }

  const bestMatch = Object.entries(scores)
    .filter(([type]) => type !== "general")
    .sort((left, right) => right[1] - left[1])[0];

  if (!bestMatch || bestMatch[1] <= 0) {
    return "general";
  }

  return bestMatch[0] as SolutionType;
}

function buildSummary(profile: HealthProfile, type: SolutionType) {
  if (type === "sleep") {
    return "你的信息更像是睡眠节律和恢复质量一起受影响，建议先把作息、晚间刺激和恢复节奏稳住，再看补充方向。";
  }

  if (type === "fatigue") {
    return "你的信息更像是恢复不足叠加精力透支，建议先修复睡眠债和白天恢复节奏，再补充基础支持。";
  }

  if (type === "liver") {
    return "你的信息更贴近熬夜、应酬或饮酒后的恢复支持场景，先看风险分层，再决定是否加入肝脏支持方向。";
  }

  if (type === "immune") {
    return "你的信息更像是作息、恢复和日常防护状态一起影响了整体免疫支持，需要先把基础生活方式稳住。";
  }

  if (type === "male_health") {
    return "你的信息更贴近男性精力、压力和恢复效率问题，建议先从睡眠、应酬频率和运动节奏做基础修复。";
  }

  if (type === "female_health") {
    return "你的信息更贴近女性周期节律、气色疲劳、睡眠情绪和日常恢复支持，建议先记录变化趋势，再决定调理方向。";
  }

  return `目前更适合先做基础型健康评估，再从睡眠、精力与恢复节奏中找出主导问题。`;
}

function buildPossibleFactors(profile: HealthProfile, type: SolutionType) {
  const factors: string[] = [];

  if (profile.lifestyle.sleep.includes("熬夜")) {
    factors.push("作息不规律可能正在拖慢恢复");
  }

  if (profile.lifestyle.alcohol) {
    factors.push("饮酒会放大恢复负担");
  }

  if (profile.lifestyle.smoking) {
    factors.push("吸烟会影响整体恢复与日常防护状态");
  }

  if (profile.lifestyle.exercise.includes("几乎不运动")) {
    factors.push("活动量不足可能让精力和睡眠状态更不稳定");
  }

  if (type === "sleep") {
    factors.push("压力和晚间刺激可能影响入睡与夜间稳定性");
  }

  if (type === "fatigue") {
    factors.push("恢复窗口不足可能导致白天精力下滑");
  }

  if (type === "immune") {
    factors.push("睡眠和恢复质量会直接影响日常防护状态");
  }

  if (type === "male_health") {
    factors.push("高压作息与应酬习惯会拖慢精力恢复效率");
  }

  if (type === "female_health") {
    factors.push("周期节律、睡眠压力和营养摄入可能共同影响日常状态");
  }

  return unique(factors, 4);
}

function buildLifestyleAdvice(profile: HealthProfile, type: SolutionType, safety: SafetyAssessment) {
  const advice: string[] = [
    "先固定起床时间，再逐步修复睡眠和恢复节奏。",
    "连续熬夜、饮酒或高压工作时，不要同时叠加太多新产品。",
  ];

  if (type === "sleep") {
    advice.push("睡前 1 小时减少蓝光、酒精和重口味进食。");
  } else if (type === "fatigue") {
    advice.push("白天安排轻强度活动和规律进餐，避免靠持续提神硬扛。");
  } else if (type === "liver") {
    advice.push("先减少连续饮酒与应酬频率，把恢复优先级提到睡眠前面。");
  } else if (type === "immune") {
    advice.push("优先补足睡眠和活动量，再考虑基础防护支持。");
  } else if (type === "male_health") {
    advice.push("先把睡眠、压力和运动节奏稳住，再看是否需要额外支持。");
  } else if (type === "female_health") {
    advice.push("先记录周期、睡眠、疲劳和情绪变化，备孕孕期哺乳期或正在服药时优先咨询医生或药师。");
  }

  return unique([...advice, ...safety.clinicianAdvice], 5);
}

function buildSupplementDirections(type: SolutionType) {
  if (type === "sleep") {
    return ["镁 / 甘氨酸镁方向", "GABA 或茶氨酸方向", "低剂量褪黑素方向"];
  }

  if (type === "fatigue") {
    return ["B 族维生素方向", "辅酶 Q10 方向", "Omega-3 恢复支持方向"];
  }

  if (type === "liver") {
    return ["饮酒后恢复支持方向", "抗氧化恢复方向", "肝脏支持方向"];
  }

  if (type === "immune") {
    return ["维生素 D3 / K2 方向", "维生素 C 方向", "益生菌方向"];
  }

  if (type === "male_health") {
    return ["精力恢复方向", "压力与睡眠支持方向", "应酬后恢复方向"];
  }

  if (type === "female_health") {
    return ["铁 / 叶酸 / B 族维生素方向", "维生素 D / 钙镁支持方向", "益生菌或睡眠恢复支持方向"];
  }

  return ["基础营养支持方向", "睡眠与恢复支持方向"];
}

function buildOtcDirections(type: SolutionType) {
  if (type === "sleep") {
    return ["若伴鼻塞、胃部不适或其他明显症状，请先咨询药师确认是否适合 OTC 辅助处理。"];
  }

  if (type === "immune") {
    return ["若已经出现发热、咳嗽、过敏或呼吸道不适，请先向药师确认是否适合 OTC 处理。"];
  }

  if (type === "female_health") {
    return ["如涉及痛经、异常出血、备孕孕期哺乳期或正在服药，请先咨询医生或药师，不建议自行长期使用 OTC。"];
  }

  return ["如伴疼痛、持续不适或正在服药，先和医生或药师确认是否适合 OTC 方向。"];
}

function buildRuleBasedResult(profile: HealthProfile, safety: SafetyAssessment): HealthConsultationResult {
  const type = inferSolutionType(profile);
  return {
    summary: buildSummary(profile, type),
    riskLevel: safety.riskLevel,
    possibleFactors: buildPossibleFactors(profile, type),
    redFlags: safety.redFlags,
    lifestyleAdvice: buildLifestyleAdvice(profile, type, safety),
    supplementDirections: buildSupplementDirections(type),
    otcDirections: buildOtcDirections(type),
    recommendedSolutionType: type,
    productRecommendationReason: "AI 只判断问题方向与风险等级，商品推荐由站内规则引擎匹配。",
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

async function getAiResult(profile: HealthProfile, fallbackType: SolutionType) {
  const promptBundle = getHealthConsultPromptBundle(profile, fallbackType);
  const generation = await generateTextWithProvider({
    prompt: promptBundle.userPrompt,
    systemPrompt: promptBundle.systemPrompt,
    temperature: 0.3,
    maxTokens: 900,
    promptVersion: promptBundle.promptVersion,
    taskType: "health_consult",
  });

  if (!generation.success || !generation.text) {
    return {
      result: null,
      aiLog: createAiLogRecord({
        generation,
        rawInput: promptBundle,
      }),
    };
  }

  const parsed = parseHealthConsultationOutput(generation.text);
  return {
    result: parsed.result,
    aiLog: createAiLogRecord({
      generation,
      rawInput: promptBundle,
      rawOutput: generation.text,
      parsed,
    }),
  };
}

export interface ConsultationBundle {
  result: HealthConsultationResult;
  recommendations: ProductRecommendation[];
  safety: SafetyAssessment;
  aiLog: AiLogRecord | null;
}

export async function createHealthConsultation(profile: HealthProfile): Promise<ConsultationBundle> {
  const safety = assessMedicalSafety(profile);

  if (safety.riskLevel === "urgent") {
    return {
      result: createUrgentResult(safety.redFlags),
      recommendations: [],
      safety,
      aiLog: null,
    };
  }

  const fallbackType = inferSolutionType(profile);
  const aiResponse = isFeatureEnabled("aiProvider")
    ? await getAiResult(profile, fallbackType)
    : { result: null, aiLog: null };
  const merged = applySafetyToResult(aiResponse.result ?? buildRuleBasedResult(profile, safety), safety, fallbackType);

  return {
    result: merged,
    recommendations: await getRecommendationsForConsultation(merged, profile),
    safety,
    aiLog: aiResponse.aiLog,
  };
}
