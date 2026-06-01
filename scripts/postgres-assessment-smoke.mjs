import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

function shouldRunSmoke() {
  return process.env.RUN_POSTGRES_ASSESSMENT_SMOKE?.toLowerCase() === 'true';
}

function printSummary(summary) {
  console.log(JSON.stringify(summary, null, 2));
}

if (!shouldRunSmoke()) {
  printSummary({
    decision: 'SKIP',
    mode: 'skipped',
    checks: 0,
    failures: [],
    nextStep: 'Set RUN_POSTGRES_ASSESSMENT_SMOKE=true with DATABASE_URL to run the live Postgres assessment smoke.',
  });
  process.exit(0);
}

if (!process.env.DATABASE_URL?.trim()) {
  printSummary({
    decision: 'FAIL',
    mode: 'postgres',
    checks: 0,
    failures: ['DATABASE_URL is required when RUN_POSTGRES_ASSESSMENT_SMOKE=true'],
  });
  process.exit(1);
}

process.env.RONGWANG_DATA_BACKEND = 'postgres';
process.env.ALLOW_AUTOMATED_MARKETING_SEND = 'false';
process.env.WECHAT_PRIVATE_SEND_PROVIDER ||= '';

const rootDir = process.cwd();
const checks = [];

function addCheck(name, ok, detail = '') {
  checks.push({ name, ok: Boolean(ok), detail });
}

async function applySchema() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(readFileSync(resolve(rootDir, 'database/schema.sql'), 'utf8'));
  } finally {
    await pool.end();
  }
}

try {
  await applySchema();

  const { generateHealthReport } = await import('../src/agents/generate-health-report.ts');
  const { runCampaignAgents } = await import('../src/agents/run-campaigns.ts');
  const { createLead, getHealthReport, getLeadById, saveHealthReport } = await import('../src/lib/assessment/assessment-store.ts');
  const { saveMarketingPlan } = await import('../src/lib/marketing/marketing-plan-repository.ts');
  const { listOutboundQueueAsync } = await import('../src/lib/automation/outbound-queue-store.ts');
  const { getPostgresPool } = await import('../src/lib/data/postgres-client.ts');

  const contact = `postgres-smoke-${Date.now()}`;
  const lead = await createLead({
    name: 'Postgres Smoke',
    contact,
    concern: '睡眠与压力',
    scenarioSlug: 'sleep-support',
    source: 'customer_journey_smoke',
    consent: {
      privacyAccepted: true,
      termsAccepted: true,
      sensitiveHealthDataAccepted: true,
      marketingContactAccepted: true,
      version: 'postgres-smoke-2026-06',
      page: '/ai-consult',
    },
  });

  addCheck('lead persisted to postgres', lead.id.startsWith('lead_') && lead.contact === contact);

  const report = await saveHealthReport(
    generateHealthReport({
      leadId: lead.id,
      name: lead.name,
      contact: lead.contact,
      scenarioSlug: 'sleep-support',
      answers: {
        sleepHours: 5,
        stressLevel: 8,
        symptomDurationDays: 21,
        medicationUse: '无',
        pregnancyOrBreastfeeding: false,
      },
    })
  );
  const storedReport = await getHealthReport(report.id);
  addCheck('health report persisted to postgres', storedReport?.id === report.id && storedReport.status === 'pending_manual_review');

  const storedLead = await getLeadById(lead.id);
  const plan = await runCampaignAgents({
    report,
    leadId: lead.id,
    channels: ['wechat_private'],
    lead: storedLead,
  });
  const storedPlan = await saveMarketingPlan({
    reportId: report.id,
    plan: {
      ...plan,
      reportId: report.id,
    },
  });
  addCheck('marketing plan persisted to postgres', storedPlan.reportId === report.id && storedPlan.status === 'pending_manual_review');

  const outboundQueue = await listOutboundQueueAsync();
  const outboundEntry = outboundQueue.find((entry) => entry.leadId === lead.id && entry.marketingPlanId === storedPlan.id);
  addCheck(
    'outbound queue remains blocked by default',
    outboundEntry?.status === 'blocked' &&
      outboundEntry.blockedReasons.includes('marketing_plan_not_approved') &&
      outboundEntry.blockedReasons.includes('automated_marketing_disabled')
  );

  const pool = getPostgresPool();
  await pool.end();
} catch (error) {
  addCheck('postgres assessment smoke executes', false, error instanceof Error ? error.message : 'unknown error');
}

const failures = checks.filter((check) => !check.ok);
printSummary({
  decision: failures.length === 0 ? 'PASS' : 'FAIL',
  mode: 'postgres',
  checks: checks.length,
  failures: failures.map((check) => check.detail || check.name),
  verifiedFlow: ['lead', 'health_report', 'marketing_plan', 'outbound_queue'],
});

if (failures.length > 0) {
  process.exit(1);
}
