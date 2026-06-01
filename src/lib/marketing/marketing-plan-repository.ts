import { randomUUID } from 'node:crypto';

import type { MarketingPlan } from '@/src/agents/run-campaigns';
import type { StoredMarketingPlan } from '@/src/lib/marketing/marketing-plan-store';
import {
  listMarketingPlans as listJsonMarketingPlans,
  saveMarketingPlan as saveJsonMarketingPlan,
  updateMarketingPlanStatus as updateJsonMarketingPlanStatus,
} from '@/src/lib/marketing/marketing-plan-store';
import { saveOutboundQueueEntriesAsync } from '@/src/lib/automation/outbound-queue-store';
import { getPostgresPool } from '@/src/lib/data/postgres-client';
import { resolveDataBackend } from '@/src/lib/data/data-backend';

function rowToMarketingPlan(row: Record<string, unknown>): StoredMarketingPlan {
  return {
    id: String(row.id),
    reportId: String(row.report_id),
    leadId: String(row.lead_id),
    status: String(row.status) as StoredMarketingPlan['status'],
    automationLevel: String(row.automation_level) as StoredMarketingPlan['automationLevel'],
    audience: (row.audience ?? {}) as StoredMarketingPlan['audience'],
    steps: (row.steps ?? []) as StoredMarketingPlan['steps'],
    complianceChecklist: (row.compliance_checklist ?? []) as StoredMarketingPlan['complianceChecklist'],
    complianceSummary: (row.compliance_summary ?? {}) as StoredMarketingPlan['complianceSummary'],
    manualFollowUp: (row.manual_follow_up ?? {}) as StoredMarketingPlan['manualFollowUp'],
    guardrails: (row.guardrails ?? []) as StoredMarketingPlan['guardrails'],
    workflow: (row.workflow ?? {}) as StoredMarketingPlan['workflow'],
    reviewNotes: row.review_notes ? String(row.review_notes) : null,
    reviewer: row.reviewer ? String(row.reviewer) : null,
    reviewedAt: row.reviewed_at ? new Date(String(row.reviewed_at)).toISOString() : null,
    reviewHistory: (row.review_history ?? []) as StoredMarketingPlan['reviewHistory'],
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function saveMarketingPlan(input: { reportId: string; plan: MarketingPlan }): Promise<StoredMarketingPlan> {
  if (resolveDataBackend() === 'json') {
    return saveJsonMarketingPlan(input);
  }

  const createdAt = new Date().toISOString();
  const planId = input.plan.id ?? `marketing_plan_${randomUUID()}`;
  const outboundQueue = input.plan.outboundQueue?.map((entry) => ({
    ...entry,
    marketingPlanId: planId,
    updatedAt: createdAt,
  }));
  const stored: StoredMarketingPlan = {
    ...input.plan,
    id: planId,
    reportId: input.reportId,
    outboundQueue,
    reviewNotes: null,
    reviewer: null,
    reviewedAt: null,
    reviewHistory: [],
    createdAt,
    updatedAt: createdAt,
  };

  await getPostgresPool().query(
    `INSERT INTO marketing_plans
      (id, report_id, lead_id, status, automation_level, audience, steps, compliance_checklist, compliance_summary,
       manual_follow_up, guardrails, workflow, review_notes, reviewer, reviewed_at, review_history, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     ON CONFLICT (id) DO UPDATE SET
      status=EXCLUDED.status,
      updated_at=EXCLUDED.updated_at`,
    [
      stored.id,
      stored.reportId,
      stored.leadId,
      stored.status,
      stored.automationLevel,
      JSON.stringify(stored.audience),
      JSON.stringify(stored.steps),
      JSON.stringify(stored.complianceChecklist),
      JSON.stringify(stored.complianceSummary),
      JSON.stringify(stored.manualFollowUp),
      JSON.stringify(stored.guardrails),
      JSON.stringify(stored.workflow),
      stored.reviewNotes,
      stored.reviewer,
      stored.reviewedAt,
      JSON.stringify(stored.reviewHistory),
      stored.createdAt,
      stored.updatedAt,
    ]
  );
  if (outboundQueue?.length) {
    await saveOutboundQueueEntriesAsync(outboundQueue);
  }
  return stored;
}

export async function listMarketingPlans(): Promise<StoredMarketingPlan[]> {
  if (resolveDataBackend() === 'json') {
    return listJsonMarketingPlans();
  }

  const result = await getPostgresPool().query('SELECT * FROM marketing_plans ORDER BY created_at DESC');
  return result.rows.map(rowToMarketingPlan);
}

export async function updateMarketingPlanStatus(input: {
  planId: string;
  status: StoredMarketingPlan['status'];
  reviewNotes?: string | null;
  reviewer?: string | null;
}): Promise<StoredMarketingPlan | null> {
  if (resolveDataBackend() === 'json') {
    return updateJsonMarketingPlanStatus(input);
  }

  const updatedAt = new Date().toISOString();
  const current = (await getPostgresPool().query('SELECT * FROM marketing_plans WHERE id=$1', [input.planId])).rows[0];
  if (!current) return null;

  const reviewHistory = [
    ...((current.review_history ?? []) as StoredMarketingPlan['reviewHistory']),
    {
      status: input.status,
      notes: input.reviewNotes ?? null,
      reviewer: input.reviewer ?? 'admin',
      reviewedAt: updatedAt,
    },
  ];
  const result = await getPostgresPool().query(
    `UPDATE marketing_plans
     SET status=$2, review_notes=$3, reviewer=$4, reviewed_at=$5, review_history=$6, updated_at=$5
     WHERE id=$1
     RETURNING *`,
    [input.planId, input.status, input.reviewNotes ?? null, input.reviewer ?? 'admin', updatedAt, JSON.stringify(reviewHistory)]
  );
  return result.rows[0] ? rowToMarketingPlan(result.rows[0]) : null;
}
