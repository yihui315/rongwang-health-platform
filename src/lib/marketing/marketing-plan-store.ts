import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { MarketingPlan, MarketingComplianceSummary, MarketingManualFollowUp } from '@/src/agents/run-campaigns';
import { saveOutboundQueueEntries } from '@/src/lib/automation/outbound-queue-store';

export type MarketingPlanReviewEvent = {
  status: 'pending_manual_review' | 'approved' | 'rejected';
  notes: string | null;
  reviewer: string;
  reviewedAt: string;
};

export type StoredMarketingPlan = Omit<MarketingPlan, 'status'> & {
  id: string;
  reportId: string;
  status: MarketingPlan['status'] | 'approved' | 'rejected';
  reviewNotes: string | null;
  reviewer: string | null;
  reviewedAt: string | null;
  reviewHistory: MarketingPlanReviewEvent[];
  createdAt: string;
  updatedAt: string;
};

function getPlanPath(): string {
  return path.join(process.cwd(), '.rongwang-data', 'marketing-plans.json');
}

function fallbackComplianceSummary(plan: Partial<StoredMarketingPlan>): MarketingComplianceSummary {
  return {
    requiredManualReview: true,
    autoSendBlocked: true,
    riskSignals: [
      `risk_level:${plan.audience?.riskLevel ?? 'unknown'}`,
      `scenario:${plan.audience?.scenarioSlug ?? 'unknown'}`,
      'legacy_plan_backfill',
    ],
    contentWarnings: [
      '不得承诺治疗、治愈、根治或替代处方药。',
      '旧营销草稿需要人工复核后才能跟进。',
    ],
  };
}

function fallbackManualFollowUp(plan: Partial<StoredMarketingPlan>): MarketingManualFollowUp {
  const highRisk = plan.audience?.riskLevel === 'high';

  return {
    owner: highRisk ? 'compliance_reviewer' : 'health_advisor',
    nextAction: highRisk ? '人工先复核风险提示，再决定是否跟进。' : '人工确认草稿内容和触达节奏，再决定是否跟进用户。',
    approvedAction: '审核通过后可由顾问人工跟进，不进入自动发送。',
    rejectedAction: '驳回后调整文案、渠道或节奏，再提交人工复核。',
  };
}

function normalizePlan(plan: StoredMarketingPlan): StoredMarketingPlan {
  return {
    ...plan,
    complianceSummary: plan.complianceSummary ?? fallbackComplianceSummary(plan),
    manualFollowUp: plan.manualFollowUp ?? fallbackManualFollowUp(plan),
    reviewHistory: plan.reviewHistory ?? [],
  };
}

function readPlans(): StoredMarketingPlan[] {
  const planPath = getPlanPath();
  if (!existsSync(planPath)) {
    return [];
  }

  try {
    return (JSON.parse(readFileSync(planPath, 'utf8')) as StoredMarketingPlan[]).map(normalizePlan);
  } catch {
    return [];
  }
}

function persistPlans(plans: StoredMarketingPlan[]): void {
  const planPath = getPlanPath();
  mkdirSync(path.dirname(planPath), { recursive: true });
  writeFileSync(planPath, `${JSON.stringify(plans, null, 2)}\n`);
}

export function saveMarketingPlan(input: { reportId: string; plan: MarketingPlan }): StoredMarketingPlan {
  const createdAt = new Date().toISOString();
  const planId = input.plan.id ?? `marketing_plan_${randomUUID()}`;
  const storedPlan: StoredMarketingPlan = {
    ...input.plan,
    id: planId,
    reportId: input.reportId,
    reviewNotes: null,
    reviewer: null,
    reviewedAt: null,
    reviewHistory: [],
    createdAt,
    updatedAt: createdAt,
  };

  const plans = readPlans().filter((plan) => plan.id !== storedPlan.id);
  plans.unshift(storedPlan);
  persistPlans(plans);
  if (input.plan.outboundQueue?.length) {
    const outboundEntries = input.plan.outboundQueue.map((entry) => ({
      ...entry,
      marketingPlanId: planId,
      updatedAt: createdAt,
    }));
    saveOutboundQueueEntries(outboundEntries);
    storedPlan.outboundQueue = outboundEntries;
  }
  return storedPlan;
}

export function listMarketingPlans(): StoredMarketingPlan[] {
  return readPlans();
}

export function updateMarketingPlanStatus(input: {
  planId: string;
  status: StoredMarketingPlan['status'];
  reviewNotes?: string | null;
  reviewer?: string | null;
}): StoredMarketingPlan | null {
  const plans = readPlans();
  const plan = plans.find((item) => item.id === input.planId);
  if (!plan) {
    return null;
  }

  const updatedAt = new Date().toISOString();
  const reviewer = input.reviewer ?? 'admin';
  const reviewNotes = input.reviewNotes ?? plan.reviewNotes ?? null;
  plan.status = input.status;
  plan.reviewNotes = reviewNotes;
  plan.reviewer = reviewer;
  plan.reviewedAt = updatedAt;
  plan.updatedAt = updatedAt;
  plan.reviewHistory = [
    ...(plan.reviewHistory ?? []),
    {
      status: input.status,
      notes: reviewNotes,
      reviewer,
      reviewedAt: updatedAt,
    },
  ];
  persistPlans(plans);
  return plan;
}

export function resetMarketingPlansForTest(): void {
  persistPlans([]);
}
