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
  | 'search'
  | 'users'
  | 'headset'
  | 'cart'
  | 'clock'
  | 'plane'
  | 'quote';

const kitBase = '/images/home/homepage-kit/assets';

export const homeHeroAssets = {
  logo: `${kitBase}/branding/rongwang-health-logo-header.png`,
  family: `${kitBase}/hero/family-group-v3.png`,
  skyline: `${kitBase}/hero/city-skyline-v2.png`,
  trustStrip: `${kitBase}/hero/trust-strip-v2.png`,
  healthEducationCard: `${kitBase}/hero/health-education-card-v2.png`,
  leavesLeft: `${kitBase}/decorations/leaves-left-v2.png`,
  leavesRight: `${kitBase}/decorations/leaves-right-v2.png`,
};

export const homeTrustBandAssets = {
  metricsStrip: `${kitBase}/icons/value-icons-strip.png`,
};

export const homeHeroTrustTags = [
  { title: 'AI健康评估', description: '科学问卷体系', icon: 'clipboard-check' },
  { title: '香港健康品牌', description: '合规安全之选', icon: 'shield-check' },
  { title: '营养支持建议', description: '健康教育参考', icon: 'leaf' },
  { title: '第三方平台购买', description: '正品保障 / 物流无忧', icon: 'truck' },
  { title: '隐私保护', description: '数据安全加密', icon: 'shield-heart' },
] satisfies Array<{ title: string; description: string; icon: HomeIconName }>;

export const homeTrustPoints = [
  {
    title: '健康场景分层',
    description: '先按需求选择方向',
    icon: 'users',
  },
  {
    title: '营养支持参考',
    description: '不替代医生诊断',
    icon: 'shield-heart',
  },
  {
    title: '第三方平台购买',
    description: '价格库存以对方为准',
    icon: 'cart',
  },
  {
    title: '隐私保护',
    description: '评估信息审慎使用',
    icon: 'globe',
  },
  {
    title: '合规健康教育',
    description: '保留风险提示',
    icon: 'leaf',
  },
] satisfies Array<{ title: string; description: string; icon: HomeIconName }>;

export const homeTrustBandPoints = [
  {
    title: '健康场景分层',
    description: '用户按需求选择',
    icon: 'users',
  },
  {
    title: '营养支持参考',
    description: '健康教育说明',
    icon: 'shield-heart',
  },
  {
    title: '第三方平台购买',
    description: '价格库存以平台为准',
    icon: 'cart',
  },
  {
    title: '隐私保护',
    description: '评估信息审慎处理',
    icon: 'shield-check',
  },
  {
    title: '合规健康教育',
    description: '保留风险提示',
    icon: 'headset',
  },
] satisfies Array<{ title: string; description: string; icon: HomeIconName }>;

export const homeWhyChoosePoints = [
  {
    title: '科学依据',
    description: '基于循证营养学和科研研究',
    icon: 'leaf',
  },
  {
    title: '专业团队',
    description: '注册营养师和健康专家团队',
    icon: 'users',
  },
  {
    title: '合规安全',
    description: '香港注册，严格质量控制',
    icon: 'shield-check',
  },
  {
    title: '隐私保护',
    description: '个人数据严格保密',
    icon: 'shield-heart',
  },
] satisfies Array<{ title: string; description: string; icon: HomeIconName }>;

export const homeSteps = [
  {
    title: '选择方案',
    description: '选择你的健康支持方向',
    icon: 'clipboard-check',
  },
  {
    title: '查看推荐',
    description: '查看个性化营养支持参考',
    icon: 'shield-check',
  },
  {
    title: '前往购买',
    description: '跳转第三方平台完成购买',
    icon: 'truck',
  },
  {
    title: '售后服务',
    description: '享受完整的售后服务支持',
    icon: 'plane',
  },
] satisfies Array<{ title: string; description: string; icon: HomeIconName }>;

export const homeHealthDirections = [
  {
    title: '睡眠与压力',
    description: '入睡慢、睡眠质量下降、长期精神紧绷',
    safetyNote: '持续失眠或正在用药者，先咨询医生。',
    href: '/solutions/sleep-support',
    accent: 'purple',
    icon: 'moon',
    image: `${kitBase}/scenarios/cards/01-sleep-pressure.png`,
  },
  {
    title: '脑力与专注',
    description: '高强度学习工作、注意力波动、用脑压力',
    safetyNote: '突发头痛、眩晕等情况应优先就医。',
    href: '/solutions/brain-focus',
    accent: 'blue',
    icon: 'spark',
    image: `${kitBase}/scenarios/cards/02-brain-focus.png`,
  },
  {
    title: '消化与代谢',
    description: '饮食不规律、餐后负担、日常代谢管理',
    safetyNote: '持续腹痛、便血等情况应立即就医。',
    href: '/solutions/digestive-support',
    accent: 'green',
    icon: 'leaf',
    image: `${kitBase}/scenarios/cards/03-digestion-metabolism.png`,
  },
  {
    title: '关节与骨骼',
    description: '久坐久站、运动恢复、骨骼营养关注',
    safetyNote: '急性损伤或关节红肿，应先医学评估。',
    href: '/solutions/joint-bone',
    accent: 'amber',
    icon: 'shield-check',
    image: `${kitBase}/scenarios/cards/04-joint-bone.png`,
  },
  {
    title: '肝胆代谢',
    description: '应酬较多、熬夜频繁、饮食油脂较高',
    safetyNote: '肝功能异常或长期饮酒者先咨询医生。',
    href: '/solutions/liver-metabolism',
    accent: 'amber',
    icon: 'chart',
    image: `${kitBase}/scenarios/cards/05-liver-metabolism.png`,
  },
  {
    title: '免疫支持',
    description: '换季、压力较大、基础营养补充关注',
    safetyNote: '发热、反复感染或免疫用药者应就医。',
    href: '/solutions/immune-support',
    accent: 'red',
    icon: 'shield-heart',
    image: `${kitBase}/scenarios/cards/06-immune-support.png`,
  },
  {
    title: '男士健康',
    description: '工作压力、精力管理、运动恢复、基础营养',
    safetyNote: '激素、泌尿或性功能问题应先咨询医生。',
    href: '/solutions/men-health',
    accent: 'blue',
    icon: 'zap',
    image: `${kitBase}/scenarios/cards/07-men-health.png`,
  },
  {
    title: '女士健康',
    description: '经期营养、作息压力、日常基础营养关注',
    safetyNote: '孕期、哺乳期或妇科症状持续者先咨询医生。',
    href: '/solutions/women-health',
    accent: 'pink',
    icon: 'female',
    image: `${kitBase}/scenarios/cards/08-women-health.png`,
  },
] satisfies Array<{
  title: string;
  description: string;
  safetyNote: string;
  href: string;
  accent: 'green' | 'blue' | 'amber' | 'teal' | 'purple' | 'red' | 'pink';
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
    title: '睡眠支持复合配方',
    tag: '睡眠支持',
    description: '用于睡眠节律与压力管理的营养支持参考',
    price: 'HK$ 298',
    image: `${kitBase}/products/cards/01-sleep-support.png`,
    bottleImage: `${kitBase}/products/bottles/01-sleep-support.png`,
    href: '/solutions/sleep-support',
    productHref: '/product-map/sleep-support-001',
    accent: 'purple',
  },
  {
    title: '脑力专注复合配方',
    tag: '脑力支持',
    description: '用于高强度用脑场景的基础营养支持参考',
    price: 'HK$ 328',
    image: `${kitBase}/products/cards/02-brain-support.png`,
    bottleImage: `${kitBase}/products/bottles/02-brain-support.png`,
    href: '/solutions/brain-focus',
    productHref: '/product-map/brain-focus-001',
    accent: 'blue',
  },
  {
    title: '肝胆代谢复合配方',
    tag: '肝胆支持',
    description: '用于作息、应酬与代谢负担管理参考',
    price: 'HK$ 358',
    image: `${kitBase}/products/cards/03-liver-support.png`,
    bottleImage: `${kitBase}/products/bottles/03-liver-support.png`,
    href: '/solutions/liver-metabolism',
    productHref: '/product-map/liver-metabolism-001',
    accent: 'green',
  },
  {
    title: '关节灵活复合配方',
    tag: '关节支持',
    description: '用于关节与骨骼基础营养关注场景',
    price: 'HK$ 338',
    image: `${kitBase}/products/cards/04-joint-support.png`,
    bottleImage: `${kitBase}/products/bottles/04-joint-support.png`,
    href: '/solutions/joint-bone',
    productHref: '/product-map/joint-bone-001',
    accent: 'amber',
  },
  {
    title: '免疫支持复合配方',
    tag: '免疫支持',
    description: '用于换季与基础营养补充方向参考',
    price: 'HK$ 288',
    image: `${kitBase}/products/cards/05-immune-support.png`,
    bottleImage: `${kitBase}/products/bottles/05-immune-support.png`,
    href: '/solutions/immune-support',
    productHref: '/product-map/immune-support-001',
    accent: 'red',
  },
  {
    title: '能量活力复合配方',
    tag: '能量支持',
    description: '用于工作压力与运动恢复营养支持参考',
    price: 'HK$ 308',
    image: `${kitBase}/products/cards/06-energy-support.png`,
    bottleImage: `${kitBase}/products/bottles/06-energy-support.png`,
    href: '/solutions/men-health',
    productHref: '/product-map/men-health-001',
    accent: 'purple',
  },
] satisfies Array<{
  title: string;
  tag: string;
  description: string;
  price: string;
  image: string;
  bottleImage: string;
  href: string;
  productHref: string;
  accent: 'green' | 'blue' | 'amber' | 'purple' | 'red';
}>;

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
