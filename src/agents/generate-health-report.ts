import { getHealthScenario } from '@/src/data/health-scenarios';

export type HealthReportAnswers = {
  sleepHours?: number;
  stressLevel?: number;
  symptomDurationDays?: number;
  medicationUse?: string;
  pregnancyOrBreastfeeding?: boolean;
};

export type HealthReportInput = {
  leadId: string;
  name: string;
  contact: string;
  scenarioSlug: string;
  answers?: HealthReportAnswers;
};

export type HealthRiskLevel = 'low' | 'medium' | 'high';

export type HealthReportSection = {
  title: string;
  summary: string;
  bullets: string[];
};

export type HealthReportAction = {
  type: 'medical_consult' | 'education' | 'consult' | 'follow_up';
  label: string;
  priority: number;
};

export type HealthReport = {
  id: string;
  reportVersion: 'health-report-v1';
  leadId: string;
  name: string;
  contact: string;
  scenarioSlug: string;
  scenarioLabel: string;
  overallScore: number;
  riskLevel: HealthRiskLevel;
  redFlags: string[];
  manualReviewRequired: boolean;
  sections: HealthReportSection[];
  nutritionDirections: string[];
  nextActions: HealthReportAction[];
  disclaimers: string[];
  audit: {
    source: 'ai_health_report';
    generatedAt: string;
    inputHash: string;
  };
};

const disclaimers = [
  '本报告仅用于健康教育与营养支持参考，不构成医疗建议或诊断依据。',
  '本品不能替代药物；如有疾病、正在服药、孕期/哺乳期或症状持续，请先咨询医生或药师。',
  '跨境商品符合原产国标准，可能与中国相关标准存在差异，请消费者充分了解后谨慎选择。',
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreFromAnswers(answers: HealthReportAnswers): number {
  let score = 35;

  if (typeof answers.stressLevel === 'number') {
    score += clamp(answers.stressLevel, 0, 10) * 3;
  }
  if (typeof answers.symptomDurationDays === 'number') {
    score += answers.symptomDurationDays >= 14 ? 20 : answers.symptomDurationDays >= 7 ? 10 : 0;
  }
  if (typeof answers.sleepHours === 'number') {
    score += answers.sleepHours < 6 ? 14 : answers.sleepHours < 7 ? 6 : 0;
  }
  if (answers.medicationUse?.trim()) {
    score += 18;
  }
  if (answers.pregnancyOrBreastfeeding) {
    score += 18;
  }

  return clamp(score, 0, 100);
}

function riskLevel(score: number, redFlags: string[]): HealthRiskLevel {
  if (redFlags.length >= 2 || score >= 75) return 'high';
  if (redFlags.length === 1 || score >= 55) return 'medium';
  return 'low';
}

function collectRedFlags(input: HealthReportInput): string[] {
  const answers = input.answers ?? {};
  const flags: string[] = [];

  if ((answers.symptomDurationDays ?? 0) >= 14) {
    flags.push('症状或困扰持续超过 2 周，建议优先咨询医生或药师。');
  }
  if (answers.medicationUse?.trim()) {
    flags.push('存在用药情况，营养补充方案需要先做药物相互作用风险确认。');
  }
  if (answers.pregnancyOrBreastfeeding) {
    flags.push('孕期、哺乳期或备孕相关人群需要先咨询医生或药师。');
  }
  if (input.scenarioSlug === 'sleep-support' && (answers.sleepHours ?? 8) < 6) {
    flags.push('睡眠时长明显不足，应先排查作息、压力和潜在健康风险。');
  }

  return flags;
}

function nutritionDirectionsForScenario(scenarioSlug: string): string[] {
  const mapping: Record<string, string[]> = {
    'sleep-support': ['睡眠节律支持', '压力管理营养', '镁/维生素 B 族方向'],
    'brain-focus': ['高强度用脑支持', '基础能量代谢', 'Omega-3 与 B 族方向'],
    'digestive-support': ['膳食纤维方向', '消化节律支持', '益生菌方向'],
    'joint-bone': ['骨骼基础营养', '关节灵活度支持', '维生素 D/钙方向'],
    'liver-metabolism': ['作息与饮酒风险管理', '抗氧化营养方向', '基础代谢支持'],
    'immune-support': ['基础免疫营养', '维生素 D/锌方向', '蛋白质摄入管理'],
    'men-health': ['压力与运动恢复', '基础能量代谢', '男士日常营养方向'],
    'women-health': ['周期营养支持', '铁与蛋白质摄入管理', '作息压力支持'],
  };

  return mapping[scenarioSlug] ?? ['基础营养支持', '生活方式管理', '专业咨询确认'];
}

function buildSections(input: HealthReportInput, score: number, level: HealthRiskLevel, redFlags: string[]): HealthReportSection[] {
  const scenario = getHealthScenario(input.scenarioSlug);
  const answers = input.answers ?? {};

  return [
    {
      title: '风险分层',
      summary: `综合风险评分 ${score}/100，当前分层为${level === 'high' ? '高风险' : level === 'medium' ? '中等风险' : '低风险'}。`,
      bullets: redFlags.length ? redFlags : ['当前未识别到强红旗因素，仍建议结合自身情况审慎判断。'],
    },
    {
      title: '健康场景解读',
      summary: scenario?.heroSummary ?? '根据提交信息生成健康关注方向摘要。',
      bullets: [
        scenario?.concern ?? '当前关注点需要进一步确认。',
        scenario?.safetyNote ?? '如症状持续或正在用药，请优先咨询专业人士。',
      ],
    },
    {
      title: '生活方式建议',
      summary: '优先通过可执行的生活方式调整降低风险，再考虑营养支持。',
      bullets: scenario?.lifestyleTips ?? ['保持规律作息', '均衡饮食并补足饮水', '定期观察身体反馈'],
    },
    {
      title: '营养支持方向',
      summary: '以下为方向性参考，不是个体化医疗处方。',
      bullets: nutritionDirectionsForScenario(input.scenarioSlug),
    },
    {
      title: '输入摘要',
      summary: '用于审计与人工复核的关键输入摘要。',
      bullets: [
        `睡眠时长：${answers.sleepHours ?? '未填写'}`,
        `压力等级：${answers.stressLevel ?? '未填写'}`,
        `持续天数：${answers.symptomDurationDays ?? '未填写'}`,
        `用药情况：${answers.medicationUse?.trim() || '未填写'}`,
      ],
    },
  ];
}

function nextActionsForRisk(level: HealthRiskLevel): HealthReportAction[] {
  if (level === 'high') {
    return [
      { type: 'medical_consult', label: '优先咨询医生或药师', priority: 100 },
      { type: 'consult', label: '由荣旺顾问进行人工复核', priority: 80 },
      { type: 'education', label: '先查看健康教育内容', priority: 60 },
    ];
  }

  if (level === 'medium') {
    return [
      { type: 'consult', label: '安排顾问确认适用方向', priority: 90 },
      { type: 'education', label: '查看健康教育和生活方式建议', priority: 70 },
      { type: 'follow_up', label: '3 天后跟进反馈', priority: 50 },
    ];
  }

  return [
    { type: 'education', label: '查看健康教育内容', priority: 80 },
    { type: 'consult', label: '按需咨询顾问确认方向', priority: 60 },
    { type: 'follow_up', label: '7 天后轻量跟进', priority: 40 },
  ];
}

function inputHash(input: HealthReportInput): string {
  return Buffer.from(JSON.stringify(input)).toString('base64url').slice(0, 18);
}

export function generateHealthReport(input: HealthReportInput): HealthReport {
  const scenario = getHealthScenario(input.scenarioSlug);
  const redFlags = collectRedFlags(input);
  const overallScore = scoreFromAnswers(input.answers ?? {});
  const level = riskLevel(overallScore, redFlags);

  return {
    id: `health_report_${input.leadId}_${inputHash(input)}`,
    reportVersion: 'health-report-v1',
    leadId: input.leadId,
    name: input.name,
    contact: input.contact,
    scenarioSlug: input.scenarioSlug,
    scenarioLabel: scenario?.label ?? '健康场景',
    overallScore,
    riskLevel: level,
    redFlags,
    manualReviewRequired: level !== 'low',
    sections: buildSections(input, overallScore, level, redFlags),
    nutritionDirections: nutritionDirectionsForScenario(input.scenarioSlug),
    nextActions: nextActionsForRisk(level),
    disclaimers,
    audit: {
      source: 'ai_health_report',
      generatedAt: new Date().toISOString(),
      inputHash: inputHash(input),
    },
  };
}
