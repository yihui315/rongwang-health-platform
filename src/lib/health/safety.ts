import type { HealthConsultationResult, RiskLevel, SolutionType } from "@/schemas/ai-result";
import type { HealthProfile } from "@/schemas/health";

export const MEDICAL_DISCLAIMER =
  "本内容仅供健康教育和一般参考，不构成医学诊断、治疗建议或处方。若症状严重、持续或正在服药，请咨询医生或药师。";

const urgentKeywordGroups: Array<{ label: string; keywords: string[] }> = [
  { label: "胸痛或胸闷", keywords: ["胸痛", "胸闷", "压榨样疼痛"] },
  { label: "呼吸困难", keywords: ["呼吸困难", "喘不过气", "气促"] },
  { label: "意识异常", keywords: ["意识模糊", "昏迷", "抽搐"] },
  { label: "突发剧烈头痛", keywords: ["剧烈头痛", "爆炸样头痛", "突发头痛"] },
  { label: "持续高热", keywords: ["持续高烧", "高热", "发热不退"] },
  { label: "消化道出血", keywords: ["黑便", "呕血", "便血"] },
  { label: "严重过敏", keywords: ["严重过敏", "喉头紧缩", "全身红疹"] },
  { label: "自伤风险", keywords: ["自杀", "自伤", "伤害自己"] },
];

const highRiskKeywordGroups: Array<{ label: string; keywords: string[] }> = [
  { label: "症状持续时间较长", keywords: ["超过 3 个月", "长期", "反复"] },
  { label: "存在用药或过敏信息", keywords: ["正在服药", "慢性病", "过敏"] },
];

function toSearchText(profile: HealthProfile) {
  return [
    profile.symptoms.join(" "),
    profile.duration,
    profile.goal,
    profile.medications,
    profile.allergies,
    profile.lifestyle.sleep,
    profile.lifestyle.exercise,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchLabels(text: string, groups: Array<{ label: string; keywords: string[] }>) {
  return groups
    .filter((group) => group.keywords.some((keyword) => text.includes(keyword.toLowerCase())))
    .map((group) => group.label);
}

export interface SafetyAssessment {
  riskLevel: RiskLevel;
  redFlags: string[];
  cautionFlags: string[];
  commerceAllowed: boolean;
  clinicianAdvice: string[];
}

export function assessMedicalSafety(profile: HealthProfile): SafetyAssessment {
  const searchText = toSearchText(profile);
  const redFlags = matchLabels(searchText, urgentKeywordGroups);
  const cautionFlags = matchLabels(searchText, highRiskKeywordGroups);

  if (profile.age < 18) {
    cautionFlags.push("未成年人建议由监护人陪同寻求线下专业意见");
  }

  if (profile.age >= 70) {
    cautionFlags.push("高龄人群出现新发症状时建议尽快线下评估");
  }

  if (profile.medications) {
    cautionFlags.push("正在服药时需先确认成分与药物是否相互作用");
  }

  if (profile.allergies) {
    cautionFlags.push("存在过敏史时应先核对成分表");
  }

  if (profile.lifestyle.alcohol && profile.symptoms.some((item) => item.includes("饮酒") || item.includes("熬夜"))) {
    cautionFlags.push("饮酒与熬夜同时存在时，恢复周期通常更长");
  }

  let riskLevel: RiskLevel = "low";
  if (redFlags.length > 0) {
    riskLevel = "urgent";
  } else if (profile.age < 18 || profile.age >= 70 || cautionFlags.length >= 3) {
    riskLevel = "high";
  } else if (cautionFlags.length > 0) {
    riskLevel = "medium";
  }

  const clinicianAdvice =
    riskLevel === "urgent"
      ? ["请尽快前往急诊或联系当地医疗服务，不建议继续依赖自我调理。"]
      : riskLevel === "high"
        ? ["建议在开始任何补充剂或 OTC 方向前，先和医生或药师确认适用性。"]
        : ["若症状持续、反复，或开始用药后不适加重，请尽快线下咨询医生。"];

  return {
    riskLevel,
    redFlags,
    cautionFlags: Array.from(new Set(cautionFlags)),
    commerceAllowed: riskLevel !== "urgent",
    clinicianAdvice,
  };
}

export function createUrgentResult(redFlags: string[]): HealthConsultationResult {
  return {
    summary: "你提供的信息里出现了需要尽快线下处理的风险信号，当前更重要的是及时就医，而不是继续自行筛选补充剂或 OTC 方案。",
    riskLevel: "urgent",
    possibleFactors: [],
    redFlags: redFlags.length > 0 ? redFlags : ["存在需要及时线下评估的症状"],
    lifestyleAdvice: [
      "优先联系医生、急诊或当地医疗服务。",
      "暂时不要自行叠加新的保健品、OTC 或酒精。",
      "若症状正在加重，请尽快让家人陪同就医。",
    ],
    supplementDirections: [],
    otcDirections: [],
    recommendedSolutionType: "general",
    productRecommendationReason: "高风险情况不展示商品推荐。",
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

export function applySafetyToResult(
  result: HealthConsultationResult,
  safety: SafetyAssessment,
  fallbackType: SolutionType,
): HealthConsultationResult {
  if (safety.riskLevel === "urgent") {
    return createUrgentResult(safety.redFlags);
  }

  let normalizedRisk: RiskLevel = result.riskLevel;

  if (safety.riskLevel === "high") {
    normalizedRisk = "high";
  } else if (result.riskLevel === "high") {
    normalizedRisk = "high";
  } else if (safety.riskLevel === "medium") {
    normalizedRisk = "medium";
  }

  return {
    ...result,
    riskLevel: normalizedRisk,
    redFlags: Array.from(new Set([...result.redFlags, ...safety.redFlags])).slice(0, 5),
    lifestyleAdvice: Array.from(
      new Set([...result.lifestyleAdvice, ...safety.clinicianAdvice, ...safety.cautionFlags]),
    ).slice(0, 6),
    recommendedSolutionType:
      result.recommendedSolutionType === "general" ? fallbackType : result.recommendedSolutionType,
    disclaimer: MEDICAL_DISCLAIMER,
  };
}
