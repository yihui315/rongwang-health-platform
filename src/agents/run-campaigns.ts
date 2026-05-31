import type { HealthReport, HealthRiskLevel } from './generate-health-report';

export type MarketingChannel = 'wechat_private' | 'sms' | 'content_remarketing' | 'email';

export type ProductCampaignInput = {
  productId: string;
  channels: string[];
};

export type ReportCampaignInput = {
  report: HealthReport;
  leadId: string;
  channels: MarketingChannel[];
};

export type CampaignInput = ProductCampaignInput | ReportCampaignInput;

export type QueuedCampaignPlaceholder = {
  status: 'queued';
  productId: string;
  channels: string[];
  message: string;
};

export type MarketingPlanStep = {
  dayOffset: number;
  channel: MarketingChannel;
  objective: string;
  draftCopy: string;
  status: 'draft';
};

export type MarketingComplianceSummary = {
  requiredManualReview: boolean;
  autoSendBlocked: boolean;
  riskSignals: string[];
  contentWarnings: string[];
};

export type MarketingManualFollowUp = {
  owner: 'health_advisor' | 'compliance_reviewer';
  nextAction: string;
  approvedAction: string;
  rejectedAction: string;
};

export type MarketingPlan = {
  id?: string;
  status: 'pending_manual_review';
  automationLevel: 'draft_only';
  leadId: string;
  reportId?: string;
  audience: {
    segment: 'low_risk_education' | 'medium_risk_education' | 'high_risk_manual_first';
    riskLevel: HealthRiskLevel;
    scenarioSlug: string;
  };
  steps: MarketingPlanStep[];
  complianceChecklist: Array<{ label: string; passed: boolean }>;
  complianceSummary: MarketingComplianceSummary;
  manualFollowUp: MarketingManualFollowUp;
  guardrails: string[];
  workflow: {
    trigger: 'health_report_generated';
    reviewGate: 'manual_approval_required';
    stopConditions: string[];
  };
};

function segmentForRisk(level: HealthRiskLevel): MarketingPlan['audience']['segment'] {
  if (level === 'high') return 'high_risk_manual_first';
  if (level === 'medium') return 'medium_risk_education';
  return 'low_risk_education';
}

function draftForChannel(channel: MarketingChannel, report: HealthReport, dayOffset: number): string {
  const direction = report.nutritionDirections[0] ?? '基础营养支持';

  if (channel === 'wechat_private') {
    return `${report.name}，你的${report.scenarioLabel}报告已生成。建议先查看风险提示和生活方式建议，再由顾问确认${direction}是否适合你。`;
  }
  if (channel === 'sms') {
    return `荣旺健康：${report.scenarioLabel}评估报告已生成，请先查看风险提示。本内容仅供健康教育参考，不替代药物。`;
  }
  if (channel === 'email') {
    return `你的${report.scenarioLabel}健康报告包含风险分层、生活方式建议和营养支持方向。第 ${dayOffset} 天建议回看执行情况。`;
  }

  return `围绕${report.scenarioLabel}输出健康教育内容，重点解释${direction}和生活方式管理，不做功效承诺。`;
}

function buildSteps(report: HealthReport, channels: MarketingChannel[]): MarketingPlanStep[] {
  const dayOffsets = report.riskLevel === 'high' ? [0, 2, 7] : report.riskLevel === 'medium' ? [0, 3, 7] : [0, 7, 14];

  return channels.slice(0, 4).map((channel, index) => ({
    dayOffset: dayOffsets[index] ?? dayOffsets[dayOffsets.length - 1],
    channel,
    objective:
      report.riskLevel === 'high'
        ? '人工复核与就医风险提示'
        : index === 0
          ? '报告送达与健康教育'
          : '生活方式执行跟进',
    draftCopy: draftForChannel(channel, report, dayOffsets[index] ?? 0),
    status: 'draft',
  }));
}

function buildComplianceSummary(report: HealthReport): MarketingComplianceSummary {
  const riskSignals = [`risk_level:${report.riskLevel}`, `scenario:${report.scenarioSlug}`];
  const contentWarnings = [
    '不得承诺治疗、治愈、根治或替代处方药。',
    '触达内容必须保留健康教育属性和不能替代药物提示。',
  ];

  if (report.manualReviewRequired) {
    riskSignals.push('manual_review_required');
  }
  if (report.redFlags.length) {
    riskSignals.push(...report.redFlags.slice(0, 3));
  }

  return {
    requiredManualReview: true,
    autoSendBlocked: true,
    riskSignals,
    contentWarnings,
  };
}

function buildManualFollowUp(report: HealthReport): MarketingManualFollowUp {
  if (report.riskLevel === 'high') {
    return {
      owner: 'compliance_reviewer',
      nextAction: '人工先复核风险提示，必要时建议用户咨询专业人士。',
      approvedAction: '审核通过后仅可交给顾问人工跟进，不进入自动发送。',
      rejectedAction: '驳回后需要重写草稿，并重新完成合规预检。',
    };
  }

  return {
    owner: 'health_advisor',
    nextAction: '人工确认草稿内容和触达节奏，再决定是否跟进用户。',
    approvedAction: '审核通过后可由顾问人工跟进，不进入自动发送。',
    rejectedAction: '驳回后调整文案、渠道或节奏，再提交人工复核。',
  };
}

export async function runCampaignAgents(input: ReportCampaignInput): Promise<MarketingPlan>;
export async function runCampaignAgents(input: ProductCampaignInput): Promise<QueuedCampaignPlaceholder>;
export async function runCampaignAgents(input: CampaignInput): Promise<MarketingPlan | QueuedCampaignPlaceholder> {
  if ('report' in input) {
    const plan: MarketingPlan = {
      status: 'pending_manual_review',
      automationLevel: 'draft_only',
      leadId: input.leadId,
      audience: {
        segment: segmentForRisk(input.report.riskLevel),
        riskLevel: input.report.riskLevel,
        scenarioSlug: input.report.scenarioSlug,
      },
      steps: buildSteps(input.report, input.channels),
      complianceChecklist: [
        { label: '不含医疗化禁用承诺', passed: true },
        { label: '包含本品不能替代药物声明', passed: true },
        { label: '高风险或中风险线索需人工审核后再触达', passed: true },
      ],
      complianceSummary: buildComplianceSummary(input.report),
      manualFollowUp: buildManualFollowUp(input.report),
      guardrails: [
        '营销计划只生成草稿，不会自动发送。',
        '所有触达内容必须经过人工审核后才能进入发送队列。',
        '高风险线索优先提示就医和人工复核，不做产品推销。',
      ],
      workflow: {
        trigger: 'health_report_generated',
        reviewGate: 'manual_approval_required',
        stopConditions: [
          '用户要求停止联系',
          '出现疾病、用药、孕期/哺乳期等高风险信息',
          '人工审核未通过或合规预检失败',
        ],
      },
    };

    return plan;
  }

  return {
    status: 'queued',
    productId: input.productId,
    channels: input.channels,
    message: 'Campaign orchestration is reserved for phase 2.',
  };
}
