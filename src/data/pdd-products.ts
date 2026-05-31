import { pddProductLinks } from '@/src/data/pdd-product-links';

export type PddProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  scenarioSlugs: string[];
  claimsSafeSummary: string;
  suitableFor: string[];
  notFor: string[];
  complianceNote: string;
  pddUrl?: string;
  image?: string;
  priority: number;
};

const commonNotFor = ['孕期或哺乳期人群', '儿童', '正在使用处方药或有明确疾病诊断的人群'];
const commonComplianceNote = '如有疾病、正在服药或症状持续，请先咨询医生或药师。';

export const pddProducts: PddProduct[] = [
  {
    id: 'sleep-support-001',
    slug: 'sleep-support-basic',
    name: '睡眠与压力支持产品',
    shortName: '睡眠支持',
    category: 'sleep-support',
    scenarioSlugs: ['sleep-support'],
    claimsSafeSummary: '用于睡眠健康教育场景下的营养支持方向参考，不构成医疗建议。',
    suitableFor: ['关注睡眠质量的人群', '长期精神压力较大的人群'],
    notFor: ['孕期或哺乳期人群', '儿童', '正在使用镇静安眠类药物的人群'],
    complianceNote: commonComplianceNote,
    pddUrl: '',
    image: '/images/home/product-sleep.webp',
    priority: 10,
  },
  {
    id: 'brain-focus-001',
    slug: 'brain-focus-basic',
    name: '脑力与专注支持产品',
    shortName: '脑力支持',
    category: 'brain-focus',
    scenarioSlugs: ['brain-focus'],
    claimsSafeSummary: '用于高强度用脑场景下的基础营养支持方向参考，不承诺功能提升。',
    suitableFor: ['长时间学习工作的人群', '希望管理专注节奏的人群'],
    notFor: commonNotFor,
    complianceNote: commonComplianceNote,
    pddUrl: '',
    image: '/images/home/product-fatigue.webp',
    priority: 10,
  },
  {
    id: 'digestive-support-001',
    slug: 'digestive-support-basic',
    name: '消化与代谢支持产品',
    shortName: '消化代谢支持',
    category: 'digestive-support',
    scenarioSlugs: ['digestive-support'],
    claimsSafeSummary: '用于饮食结构与代谢节奏管理的营养支持方向参考，不构成疾病建议。',
    suitableFor: ['饮食不规律的人群', '关注日常代谢管理的人群'],
    notFor: commonNotFor,
    complianceNote: commonComplianceNote,
    pddUrl: '',
    image: '/images/home/product-immune.webp',
    priority: 10,
  },
  {
    id: 'joint-bone-001',
    slug: 'joint-bone-basic',
    name: '关节与骨骼支持产品',
    shortName: '关节骨骼支持',
    category: 'joint-bone',
    scenarioSlugs: ['joint-bone'],
    claimsSafeSummary: '用于关节与骨骼健康教育场景下的营养支持方向参考，不替代专业处置。',
    suitableFor: ['久坐久站人群', '关注骨骼营养的人群'],
    notFor: commonNotFor,
    complianceNote: commonComplianceNote,
    pddUrl: '',
    image: '/images/home/product-sleep.webp',
    priority: 10,
  },
  {
    id: 'liver-metabolism-001',
    slug: 'liver-metabolism-basic',
    name: '肝胆代谢支持产品',
    shortName: '肝胆代谢支持',
    category: 'liver-metabolism',
    scenarioSlugs: ['liver-metabolism'],
    claimsSafeSummary: '用于肝胆代谢负担健康教育场景下的生活方式与营养支持方向参考。',
    suitableFor: ['熬夜较多的人群', '外食应酬较多的人群'],
    notFor: commonNotFor,
    complianceNote: commonComplianceNote,
    pddUrl: '',
    image: '/images/home/product-fatigue.webp',
    priority: 10,
  },
  {
    id: 'immune-support-001',
    slug: 'immune-support-basic',
    name: '免疫支持产品',
    shortName: '免疫支持',
    category: 'immune-support',
    scenarioSlugs: ['immune-support'],
    claimsSafeSummary: '用于基础营养与日常防护健康教育场景的营养支持方向参考。',
    suitableFor: ['换季健康管理人群', '蔬果摄入不足的人群'],
    notFor: commonNotFor,
    complianceNote: commonComplianceNote,
    pddUrl: '',
    image: '/images/home/product-immune.webp',
    priority: 10,
  },
  {
    id: 'men-health-001',
    slug: 'men-health-basic',
    name: '男士健康支持产品',
    shortName: '男士健康支持',
    category: 'men-health',
    scenarioSlugs: ['men-health'],
    claimsSafeSummary: '用于男士基础营养、压力管理与运动恢复方向参考，不涉及疾病承诺。',
    suitableFor: ['工作压力较高的男士', '关注运动恢复的人群'],
    notFor: commonNotFor,
    complianceNote: commonComplianceNote,
    pddUrl: '',
    image: '/images/home/product-fatigue.webp',
    priority: 10,
  },
  {
    id: 'women-health-001',
    slug: 'women-health-basic',
    name: '女士健康支持产品',
    shortName: '女士健康支持',
    category: 'women-health',
    scenarioSlugs: ['women-health'],
    claimsSafeSummary: '用于女士日常营养、作息压力与经期营养关注场景的方向参考。',
    suitableFor: ['关注经期营养的人群', '作息压力较高的女性人群'],
    notFor: ['孕期或哺乳期人群', '备孕或正在使用激素类药物的人群', '妇科症状持续或指标异常人群'],
    complianceNote: commonComplianceNote,
    pddUrl: '',
    image: '/images/home/product-immune.webp',
    priority: 10,
  },
];

export function resolvePddProductUrl(product: PddProduct, linkConfig: Record<string, string> = pddProductLinks): string {
  const productUrl = product.pddUrl?.trim();
  if (productUrl) {
    return productUrl;
  }

  return linkConfig[product.id]?.trim() ?? '';
}
