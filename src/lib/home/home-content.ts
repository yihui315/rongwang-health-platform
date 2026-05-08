export type HomeIconName =
  | 'clipboard-check'
  | 'shield-heart'
  | 'shield-check'
  | 'truck'
  | 'moon'
  | 'zap'
  | 'spark'
  | 'female'
  | 'leaf'
  | 'chart'
  | 'globe'
  | 'check'
  | 'clock'
  | 'plane'
  | 'quote';

export const homeTrustPoints = [
  {
    title: '先评估后购买',
    description: '先了解自身状况，再决定是否需要方案。',
    icon: 'clipboard-check',
  },
  {
    title: '高风险优先建议就医',
    description: '系统识别中高风险，优先提示就医建议。',
    icon: 'shield-heart',
  },
  {
    title: '质量与来源透明',
    description: '严选品牌与供应链，信息公开可追溯。',
    icon: 'shield-check',
  },
  {
    title: '订单物流可追踪',
    description: '跨境物流全程可追踪，安心到达。',
    icon: 'truck',
  },
] satisfies Array<{ title: string; description: string; icon: HomeIconName }>;

export const homeSteps = [
  {
    title: '填写资料',
    description: '回答健康与生活方式相关问题。',
  },
  {
    title: '获取AI报告',
    description: '获得风险评估与营养支持方向建议。',
  },
  {
    title: '进入方案与购买入口',
    description: '查看推荐方案，按需选择是否购买。',
  },
];

export const homeHealthDirections = [
  {
    title: '睡眠支持',
    description: '关注入睡节律与夜间休息质量',
    href: '/assessment/sleep',
    accent: 'purple',
    icon: 'moon',
    image: '/images/home/direction-sleep.webp',
  },
  {
    title: '疲劳恢复',
    description: '关注日常精力与能量代谢支持',
    href: '/assessment/fatigue',
    accent: 'green',
    icon: 'zap',
    image: '/images/home/direction-fatigue.webp',
  },
  {
    title: '免疫支持',
    description: '关注日常防护与基础营养支持',
    href: '/assessment/immune',
    accent: 'blue',
    icon: 'shield-check',
    image: '/images/home/direction-immune.webp',
  },
  {
    title: '女性健康',
    description: '关注周期、状态与营养平衡',
    href: '/assessment/female',
    accent: 'pink',
    icon: 'female',
    image: '/images/home/direction-female.webp',
  },
] satisfies Array<{
  title: string;
  description: string;
  href: string;
  accent: 'purple' | 'green' | 'blue' | 'pink';
  icon: HomeIconName;
  image: string;
}>;

export const expertTrustPoints = [
  {
    title: '营养健康逻辑',
    description: '基于循证营养学与健康管理原则',
    icon: 'leaf',
  },
  {
    title: 'AI分层评估',
    description: '多维信息建模，识别风险与需求',
    icon: 'chart',
  },
  {
    title: '跨境支持流程',
    description: '从下单到配送，全流程专业支持',
    icon: 'globe',
  },
] satisfies Array<{ title: string; description: string; icon: HomeIconName }>;

export const expertChecklist = [
  '注册营养顾问支持',
  '风险提示清晰',
  '建议更审慎',
  '安全优先',
];

export const productPreviewItems = [
  {
    title: '睡眠支持',
    description: '支持放松与夜间休息状态管理。',
    image: '/images/home/product-sleep.webp',
    href: '/solutions/sleep',
  },
  {
    title: '日常免疫',
    description: '支持基础营养补充与日常健康管理。',
    image: '/images/home/product-immune.webp',
    href: '/solutions/immune',
  },
  {
    title: '疲劳恢复',
    description: '支持能量代谢与日常精力管理。',
    image: '/images/home/product-fatigue.webp',
    href: '/solutions/fatigue',
  },
];

export const testimonials = [
  {
    name: '林女士',
    meta: '32岁 · 广州',
    quote: '评估过程很简单，报告清晰易懂，让我更了解自己的健康状况。',
    initials: '林',
  },
  {
    name: '陈先生',
    meta: '38岁 · 深圳',
    quote: '根据建议调整作息和饮食后，我对日常健康管理更有方向。',
    initials: '陈',
  },
  {
    name: '刘女士',
    meta: '29岁 · 上海',
    quote: '方案建议贴合我的情况，先看评估再选择，让购买更有信心。',
    initials: '刘',
  },
];

export const homeFaqItems = [
  {
    question: 'AI评估能代替医生吗？',
    answer: 'AI评估仅提供健康教育参考，不作为诊断依据；中高风险建议优先就医并咨询医生。',
    icon: 'shield-heart',
  },
  {
    question: '多久可以完成评估？',
    answer: '约3分钟即可完成评估并生成报告，建议在安静环境下如实填写，以获得更有参考价值的结果。',
    icon: 'clock',
  },
  {
    question: '跨境配送如何安排？',
    answer: '我们提供跨境直邮服务，订单与物流全程可追踪，具体时效以结算页显示为准。',
    icon: 'plane',
  },
] satisfies Array<{ question: string; answer: string; icon: HomeIconName }>;
