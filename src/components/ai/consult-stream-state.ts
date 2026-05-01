export type ConsultStreamStepStatus = "active" | "pending";

export type ConsultStreamStep = {
  id: string;
  title: string;
  description: string;
  status: ConsultStreamStepStatus;
};

const baseConsultStreamSteps = [
  {
    id: "validate",
    title: "资料校验",
    description: "确认年龄、症状、生活方式和目标字段是否完整。",
  },
  {
    id: "safety",
    title: "风险分层",
    description:
      "优先识别胸痛、呼吸困难、出血、自伤想法等需要及时就医的信号。",
  },
  {
    id: "analysis",
    title: "生成解释",
    description:
      "结合症状、持续时间和生活习惯生成健康教育建议，不替代医生判断。",
  },
  {
    id: "recommend",
    title: "方案匹配",
    description:
      "AI 只给方向，商品入口由规则匹配，并受高风险禁购保护。",
  },
] as const;

export function getConsultStreamSteps(activeIndex = 0): ConsultStreamStep[] {
  return baseConsultStreamSteps.map((step, index) => ({
    ...step,
    status: index <= activeIndex ? "active" : "pending",
  }));
}
