import type { HomeIconName } from '@/src/lib/home/home-content';

export type HealthScenario = {
  slug: string;
  label: string;
  title: string;
  concern: string;
  safetyNote: string;
  href: string;
  ctaLabel: string;
  icon: HomeIconName;
  accent: 'green' | 'blue' | 'amber' | 'teal';
  heroSummary: string;
  suitableFor: string[];
  riskExclusions: string[];
  lifestyleTips: string[];
  faq: Array<{ question: string; answer: string }>;
};

export const healthScenarios: HealthScenario[] = [
  {
    slug: 'sleep-support',
    label: '睡眠与压力',
    title: '睡眠与压力支持方案',
    concern: '入睡慢、睡眠质量下降、长期精神紧绷、白天精力不足的人群。',
    safetyNote: '长期失眠、明显焦虑抑郁或正在用药者，应先咨询医生。',
    href: '/solutions/sleep-support',
    ctaLabel: '查看方案与产品',
    icon: 'moon',
    accent: 'teal',
    heroSummary: '适合关注睡眠节律、压力管理与夜间恢复的人群。',
    suitableFor: ['入睡时间较长', '近期压力较高', '白天精神状态下降'],
    riskExclusions: ['持续失眠超过 2 周', '正在使用镇静安眠类药物', '伴随明显情绪低落或胸闷心悸'],
    lifestyleTips: ['固定起床时间，减少睡前强光刺激', '下午后减少咖啡因摄入', '睡前保留 20 分钟放松流程'],
    faq: [
      {
        question: '睡眠支持产品能替代安眠药吗？',
        answer: '不能。营养支持只能作为健康管理参考，如已在用药或症状持续，应咨询医生。',
      },
      {
        question: '一定要先做 AI 评估吗？',
        answer: '不需要。你可以先查看推荐方向；评估只用于提高匹配准确度。',
      },
    ],
  },
  {
    slug: 'brain-focus',
    label: '脑力与专注',
    title: '脑力与专注支持方案',
    concern: '长时间学习工作、注意力波动、用脑强度较高的人群。',
    safetyNote: '突发头痛、眩晕、记忆明显下降等情况，应优先就医。',
    href: '/solutions/brain-focus',
    ctaLabel: '查看方案与产品',
    icon: 'spark',
    accent: 'blue',
    heroSummary: '适合关注高强度用脑、专注节奏与日常能量管理的人群。',
    suitableFor: ['长期伏案工作', '学习备考压力较高', '午后注意力下降'],
    riskExclusions: ['突发神经系统不适', '正在使用精神类或神经类药物', '未成年人需监护人和医生确认'],
    lifestyleTips: ['每 50 分钟安排短暂离屏休息', '保证早餐蛋白质与水分摄入', '避免用补剂替代睡眠'],
    faq: [
      {
        question: '脑力支持是否代表提升智力？',
        answer: '不是。本页只提供营养和生活方式支持方向，不承诺功能提升。',
      },
      {
        question: '学生可以直接购买吗？',
        answer: '未成年人或正在用药者，应由监护人先咨询医生或药师。',
      },
    ],
  },
  {
    slug: 'digestive-support',
    label: '消化与代谢',
    title: '消化与代谢支持方案',
    concern: '饮食不规律、餐后负担感、希望管理日常代谢节奏的人群。',
    safetyNote: '持续腹痛、便血、体重快速下降等情况，应立即就医。',
    href: '/solutions/digestive-support',
    ctaLabel: '查看方案与产品',
    icon: 'leaf',
    accent: 'green',
    heroSummary: '适合关注饮食结构、肠胃舒适度与日常代谢管理的人群。',
    suitableFor: ['饮食油腻频率较高', '膳食纤维摄入不足', '希望建立规律饮食'],
    riskExclusions: ['持续腹痛或便血', '已诊断消化系统疾病', '正在使用降糖或减重相关药物'],
    lifestyleTips: ['优先增加蔬菜、全谷物与饮水', '减少夜宵和高糖饮料', '饭后轻步行 10 到 15 分钟'],
    faq: [
      {
        question: '消化支持产品能处理胃肠疾病吗？',
        answer: '不能。疾病相关症状需要医生诊断，本页仅作健康教育参考。',
      },
      {
        question: '代谢支持是否等同减肥？',
        answer: '不是。本页不提供减重承诺，只建议饮食和生活方式管理方向。',
      },
    ],
  },
  {
    slug: 'joint-bone',
    label: '关节与骨骼',
    title: '关节与骨骼支持方案',
    concern: '久坐、运动后关节负担、骨骼健康关注度提高的人群。',
    safetyNote: '急性损伤、肿胀疼痛或行动受限，应先就医评估。',
    href: '/solutions/joint-bone',
    ctaLabel: '查看方案与产品',
    icon: 'shield-check',
    accent: 'amber',
    heroSummary: '适合关注关节灵活度、运动恢复与骨骼营养支持的人群。',
    suitableFor: ['久坐或久站', '中低强度运动人群', '关注钙和维生素 D 摄入'],
    riskExclusions: ['急性扭伤或骨折风险', '关节红肿热痛', '肾功能异常或高钙风险人群'],
    lifestyleTips: ['每周安排力量和柔韧训练', '保证日晒与蛋白质摄入', '控制体重以减少关节负担'],
    faq: [
      {
        question: '关节产品能处理持续不适吗？',
        answer: '不能。持续不适需要医生评估，营养支持不能替代药物。',
      },
      {
        question: '钙类产品所有人都适合吗？',
        answer: '不一定。肾功能异常、高钙风险或正在用药者需先咨询专业人士。',
      },
    ],
  },
  {
    slug: 'liver-metabolism',
    label: '肝胆代谢',
    title: '肝胆代谢支持方案',
    concern: '应酬较多、熬夜频繁、关注肝胆代谢负担的人群。',
    safetyNote: '肝功能异常、黄疸、长期饮酒或正在服药者，应先咨询医生。',
    href: '/solutions/liver-metabolism',
    ctaLabel: '查看方案与产品',
    icon: 'chart',
    accent: 'teal',
    heroSummary: '适合关注作息、饮酒频率、饮食油脂与肝胆代谢负担的人群。',
    suitableFor: ['熬夜频率较高', '外食和应酬较多', '希望优化饮食作息'],
    riskExclusions: ['已知肝胆疾病', '肝功能指标异常', '正在服用可能影响肝功能的药物'],
    lifestyleTips: ['减少酒精摄入并安排休肝日', '避免长期高油饮食', '保持规律体检和肝功能检查'],
    faq: [
      {
        question: '肝胆代谢支持能处理异常指标吗？',
        answer: '不能。本页不提供指标改善承诺，异常指标应由医生评估。',
      },
      {
        question: '熬夜后吃产品就可以补回来吗？',
        answer: '不建议这样理解。规律作息仍是优先级最高的健康策略。',
      },
    ],
  },
  {
    slug: 'immune-support',
    label: '免疫支持',
    title: '免疫支持方案',
    concern: '换季、工作压力较大、希望补足基础营养的人群。',
    safetyNote: '发热、反复感染、自身免疫疾病或免疫抑制用药者，应先就医。',
    href: '/solutions/immune-support',
    ctaLabel: '查看方案与产品',
    icon: 'shield-heart',
    accent: 'blue',
    heroSummary: '适合关注日常防护、基础营养和作息稳定的人群。',
    suitableFor: ['换季健康管理', '蔬果摄入不足', '作息压力影响状态'],
    riskExclusions: ['正在发热或感染', '自身免疫疾病', '正在使用免疫抑制相关药物'],
    lifestyleTips: ['保证睡眠与规律运动', '补足蛋白质、蔬果和水分', '按需关注维生素 D 等基础营养'],
    faq: [
      {
        question: '免疫支持产品能预防疾病吗？',
        answer: '不能。本页只讨论基础营养支持，不承诺预防疾病或改善症状。',
      },
      {
        question: '换季时是否适合先看方案？',
        answer: '可以先看健康教育和营养支持方向，如有症状应优先就医。',
      },
    ],
  },
  {
    slug: 'men-health',
    label: '男士健康',
    title: '男士健康支持方案',
    concern: '工作压力、精力管理、运动恢复和基础营养关注人群。',
    safetyNote: '涉及性功能、激素、前列腺等疾病问题，应先咨询医生。',
    href: '/solutions/men-health',
    ctaLabel: '查看方案与产品',
    icon: 'zap',
    accent: 'amber',
    heroSummary: '适合关注工作压力、运动恢复和基础营养补充的男士人群。',
    suitableFor: ['工作压力较高', '运动恢复需求', '饮食结构不稳定'],
    riskExclusions: ['疑似激素或泌尿系统问题', '正在使用处方药', '高血压或心血管风险人群'],
    lifestyleTips: ['每周稳定力量训练和有氧运动', '减少酒精与高油夜宵', '定期关注血压、血脂等指标'],
    faq: [
      {
        question: '男士健康产品能改善疾病或性功能吗？',
        answer: '不能。本页不提供疾病或性功能相关承诺，相关问题应咨询医生。',
      },
      {
        question: '运动人群可以直接选吗？',
        answer: '可以先看方向，但如有慢病、用药或运动损伤，应先咨询专业人士。',
      },
    ],
  },
  {
    slug: 'women-health',
    label: '女士健康',
    title: '女士健康支持方案',
    concern: '关注经期营养、作息压力、皮肤状态和基础营养补充的人群。',
    safetyNote: '孕期、哺乳期、备孕或妇科症状持续者，应先咨询医生或药师。',
    href: '/solutions/women-health',
    ctaLabel: '查看方案与产品',
    icon: 'female',
    accent: 'green',
    heroSummary: '适合关注日常营养、作息压力与女性健康风险提示的人群。',
    suitableFor: ['经期前后营养关注', '作息压力较高', '饮食结构不稳定'],
    riskExclusions: ['孕期或哺乳期', '备孕或正在使用激素类药物', '妇科症状持续或指标异常'],
    lifestyleTips: ['保证蛋白质、铁和蔬果摄入', '经期前后减少熬夜和过度节食', '症状持续时优先医学评估'],
    faq: [
      {
        question: '女士健康产品能解决妇科问题吗？',
        answer: '不能。本页只提供健康教育和营养支持方向参考，症状持续应咨询医生。',
      },
      {
        question: '孕期或哺乳期可以直接购买吗？',
        answer: '不建议直接购买。孕期、哺乳期或备孕人群应先咨询医生或药师。',
      },
    ],
  },
];

export function getHealthScenario(slug: string): HealthScenario | null {
  return healthScenarios.find((scenario) => scenario.slug === slug) ?? null;
}
