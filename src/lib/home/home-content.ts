/**
 * 荣旺健康首页 V3 - 静态文案与数据
 * 仅用于教育型内容展示，请勿涉及医疗诊断或疗效承诺。
 */

export type IconKey =
  | "clipboard-check"
  | "shield-heart"
  | "shield-check"
  | "truck"
  | "moon"
  | "spark"
  | "shield"
  | "venus"
  | "logic"
  | "layers"
  | "globe"
  | "stethoscope"
  | "info"
  | "edit"
  | "lock";

export interface TrustPoint {
  title: string;
  description: string;
  icon: IconKey;
}

export interface StepItem {
  title: string;
  description: string;
}

export interface HealthDirection {
  title: string;
  description: string;
  href: string;
  accent: "purple" | "green" | "blue" | "pink";
  icon: IconKey;
  image?: string;
}

export interface ProductPreviewItem {
  title: string;
  description: string;
  image: string;
  href: string;
}

export interface Testimonial {
  name: string;
  meta: string;
  quote: string;
  initial: string;
  accent: "purple" | "green" | "blue" | "pink";
}

export interface FaqItem {
  question: string;
  answer: string;
  icon: IconKey;
}

export interface ExpertHighlight {
  title: string;
  description: string;
  icon: IconKey;
}

export const homeTrustPoints: TrustPoint[] = [
  {
    title: "先评估后购买",
    description: "先了解自身状况，再决定是否需要方案。",
    icon: "clipboard-check",
  },
  {
    title: "高风险优先建议就医",
    description: "系统识别中高风险，优先提示就医建议。",
    icon: "shield-heart",
  },
  {
    title: "质量与来源透明",
    description: "严选品牌与供应链，信息公开可追溯。",
    icon: "shield-check",
  },
  {
    title: "订单物流可追踪",
    description: "跨境物流全程可追踪，安心到达。",
    icon: "truck",
  },
];

export const homeSteps: StepItem[] = [
  {
    title: "填写资料",
    description: "回答健康与生活方式相关问题。",
  },
  {
    title: "获取AI报告",
    description: "获得风险评估与营养支持方向建议。",
  },
  {
    title: "进入方案与购买入口",
    description: "查看推荐方案，按需选择是否购买。",
  },
];

export const homeHealthDirections: HealthDirection[] = [
  {
    title: "睡眠支持",
    description: "改善入睡与睡眠质量",
    href: "/solutions/sleep",
    accent: "purple",
    icon: "moon",
    image: "/images/home/sleep-support.svg",
  },
  {
    title: "疲劳恢复",
    description: "提升精力，缓解疲劳感",
    href: "/solutions/fatigue",
    accent: "green",
    icon: "spark",
    image: "/images/home/fatigue-recovery.svg",
  },
  {
    title: "免疫支持",
    description: "增强抵抗力，守护健康",
    href: "/solutions/immune",
    accent: "blue",
    icon: "shield",
    image: "/images/home/immune-support.svg",
  },
  {
    title: "女性健康",
    description: "调节平衡，关爱女性",
    href: "/solutions/female",
    accent: "pink",
    icon: "venus",
    image: "/images/home/women-health.svg",
  },
];

export const expertHighlights: ExpertHighlight[] = [
  {
    title: "营养健康逻辑",
    description: "基于循证营养学与健康管理原则",
    icon: "logic",
  },
  {
    title: "AI分层评估",
    description: "多维数据建模，识别风险与需求",
    icon: "layers",
  },
  {
    title: "跨境支持流程",
    description: "从下单到配送，全流程专业支持",
    icon: "globe",
  },
];

export const expertChecklist: string[] = [
  "注册营养顾问支持",
  "风险提示清晰",
  "建议更审慎",
  "安全优先",
];

export const productPreviewItems: ProductPreviewItem[] = [
  {
    title: "睡眠支持",
    description: "支持放松情绪，帮助改善睡眠质量。",
    image: "/images/home/product-sleep.svg",
    href: "/solutions/sleep",
  },
  {
    title: "日常免疫",
    description: "支持免疫防御，守护日常健康。",
    image: "/images/home/product-immune.svg",
    href: "/solutions/immune",
  },
  {
    title: "疲劳恢复",
    description: "支持能量代谢，缓解疲劳感。",
    image: "/images/home/product-fatigue.svg",
    href: "/solutions/fatigue",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "林女士",
    meta: "32岁 · 广州",
    quote: "评估过程很简单，报告清晰易懂，让我更了解自己的健康状况。",
    initial: "林",
    accent: "pink",
  },
  {
    name: "陈先生",
    meta: "38岁 · 深圳",
    quote: "根据建议调整后，精力改善了，睡眠也更稳定了。",
    initial: "陈",
    accent: "blue",
  },
  {
    name: "刘女士",
    meta: "29岁 · 上海",
    quote: "方案建议很贴合我的情况，购买流程也很顺畅。",
    initial: "刘",
    accent: "purple",
  },
];

export const homeFaqItems: FaqItem[] = [
  {
    question: "AI评估能代替医生吗？",
    answer:
      "不能。AI评估仅提供健康教育参考，不作为诊断依据；中高风险建议优先就医并咨询医生。",
    icon: "stethoscope",
  },
  {
    question: "多久可以完成评估？",
    answer:
      "约3分钟即可完成评估并生成报告，建议在安静环境下如实填写，以获得更准确的结果。",
    icon: "edit",
  },
  {
    question: "跨境配送如何安排？",
    answer:
      "我们提供跨境直邮服务，订单与物流全程可追踪，具体时效以结算页显示为准。",
    icon: "globe",
  },
];

export const heroBadges = ["流程透明", "风险优先", "跨境支持"];

export const heroReportSample = {
  riskScore: 62,
  riskLevel: "中等风险",
  lifestyleTips: [
    "规律作息，保证充足睡眠",
    "均衡饮食，增加优质蛋白摄入",
    "每周适度运动，管理压力",
  ],
  supportDirections: ["睡眠支持", "疲劳恢复", "免疫支持"],
  disclaimer: "本报告仅供健康教育参考，不作为诊断依据。",
};

export const complianceDisclaimer =
  "AI评估仅提供健康教育参考，不作为诊断依据；中高风险建议优先就医并咨询医生。";
