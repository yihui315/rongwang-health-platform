import type { RiskLevel } from "@/schemas/ai-result";

export type RiskTriageLevel = "low" | "medium" | "high";

export function toRiskTriageLevel(riskLevel: RiskLevel | string): RiskTriageLevel {
  if (riskLevel === "low") {
    return "low";
  }

  if (riskLevel === "medium") {
    return "medium";
  }

  return "high";
}

export function canShowProductPath(riskLevel: RiskLevel | string) {
  return toRiskTriageLevel(riskLevel) === "low";
}

export const riskTriageCopy: Record<
  RiskTriageLevel,
  {
    eyebrow: string;
    title: string;
    body: string;
    toneClass: string;
  }
> = {
  low: {
    eyebrow: "LOW",
    title: "当前未识别到明显高风险信号",
    body: "你可以先从生活方式调整开始，并查看与当前状态相关的营养支持方向。",
    toneClass:
      "border-[var(--nutrition-border)] bg-[var(--nutrition-soft)] text-[var(--nutrition-teal-dark)]",
  },
  medium: {
    eyebrow: "MEDIUM",
    title: "当前建议谨慎观察，并保留复测",
    body: "你的回答提示可能存在需要持续观察的因素。建议先进行 7 天生活方式调整；如状态持续、加重或伴随其他不适，请咨询医生或药师。",
    toneClass:
      "border-[var(--risk-medium-border)] bg-[var(--risk-medium-soft)] text-[var(--risk-medium)]",
  },
  high: {
    eyebrow: "HIGH",
    title: "建议优先线下咨询",
    body: "你的回答中出现了需要优先线下咨询的信号。为了避免延误判断，荣旺不会在本结果页展示购买入口。您的健康比任何销售都重要。建议你先咨询医生或药师，并保留本次健康分层摘要，方便线下沟通。",
    toneClass:
      "border-[var(--risk-high-border)] bg-[var(--risk-high-soft)] text-[var(--risk-high)]",
  },
};
