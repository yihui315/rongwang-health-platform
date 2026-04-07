import type { ExperimentalFeature } from "@/types";

export type { ExperimentalFeature };

export const experimentalFeatures: ExperimentalFeature[] = [
  {
    id: "ai-deep-analysis",
    name: "AI 深度分析",
    description: "基于多模型协同的深度健康分析，提供更全面的健康洞察报告。",
    status: "beta",
  },
  {
    id: "family-health-map",
    name: "家庭健康图谱",
    description: "可视化展示家庭成员健康关联与遗传风险因子。",
    status: "alpha",
  },
  {
    id: "smart-plan-adjust",
    name: "智能方案动态调整",
    description: "根据每日反馈与睡眠数据，自动微调健康方案配比。",
    status: "preview",
  },
  {
    id: "multi-model-qa",
    name: "多模型问答",
    description: "同时调用多个 AI 大模型回答健康问题，交叉验证答案可信度。",
    status: "beta",
  },
];
