import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { readFileSync } from 'node:fs';

import { POST as createHealthReportRoute } from '../app/api/health-report/route';
import { POST as createMarketingPlanRoute } from '../app/api/marketing/plan/route';
import { generateHealthReport } from '../src/agents/generate-health-report';
import { runCampaignAgents } from '../src/agents/run-campaigns';
import { listLeads, resetLeadsForTest } from '../src/lib/contact/lead-store';
import { listHealthReports, resetHealthReportsForTest } from '../src/lib/health-report/report-store';
import { listMarketingPlans, resetMarketingPlansForTest } from '../src/lib/marketing/marketing-plan-store';

const originalCwd = process.cwd();
const tempDir = mkdtempSync(path.join(tmpdir(), 'rongwang-report-marketing-'));

before(() => {
  process.chdir(tempDir);
  resetLeadsForTest();
  resetHealthReportsForTest();
  resetMarketingPlansForTest();
});

after(() => {
  process.chdir(originalCwd);
  rmSync(tempDir, { recursive: true, force: true });
});

test('generateHealthReport returns a professional, compliant, traceable report', () => {
  const report = generateHealthReport({
    leadId: 'lead_demo',
    name: '李女士',
    contact: 'li78035',
    scenarioSlug: 'sleep-support',
    answers: {
      sleepHours: 5,
      stressLevel: 8,
      symptomDurationDays: 21,
      medicationUse: '偶尔使用助眠药',
      pregnancyOrBreastfeeding: false,
    },
  });

  assert.equal(report.scenarioSlug, 'sleep-support');
  assert.equal(report.reportVersion, 'health-report-v1');
  assert.ok(report.overallScore >= 0 && report.overallScore <= 100);
  assert.equal(report.riskLevel, 'high');
  assert.ok(report.redFlags.some((item) => item.includes('持续')));
  assert.ok(report.redFlags.some((item) => item.includes('用药')));
  assert.ok(report.sections.length >= 4);
  assert.ok(report.sections.some((section) => section.title === '风险分层'));
  assert.ok(report.sections.some((section) => section.title === '生活方式建议'));
  assert.ok(report.nutritionDirections.length >= 1);
  assert.match(report.disclaimers.join(''), /不能替代药物/);
  assert.match(report.disclaimers.join(''), /不构成医疗建议/);
  assert.equal(report.audit.source, 'ai_health_report');
  assert.ok(report.audit.generatedAt);
});

test('generateHealthReport keeps low-risk users in education-first flow', () => {
  const report = generateHealthReport({
    leadId: 'lead_low',
    name: '陈先生',
    contact: 'wechat-low',
    scenarioSlug: 'immune-support',
    answers: {
      sleepHours: 7,
      stressLevel: 3,
      symptomDurationDays: 2,
      medicationUse: '',
      pregnancyOrBreastfeeding: false,
    },
  });

  assert.equal(report.riskLevel, 'low');
  assert.equal(report.manualReviewRequired, false);
  assert.ok(report.nextActions.some((action) => action.type === 'education'));
  assert.ok(report.nextActions.some((action) => action.type === 'consult'));
});

test('runCampaignAgents creates a professional marketing plan gated by manual review', async () => {
  const report = generateHealthReport({
    leadId: 'lead_marketing',
    name: '王先生',
    contact: 'wechat-marketing',
    scenarioSlug: 'brain-focus',
    answers: {
      sleepHours: 6,
      stressLevel: 6,
      symptomDurationDays: 7,
      medicationUse: '',
      pregnancyOrBreastfeeding: false,
    },
  });

  const plan = await runCampaignAgents({
    report,
    leadId: report.leadId,
    channels: ['wechat_private', 'sms', 'content_remarketing'],
  });

  assert.equal(plan.status, 'pending_manual_review');
  assert.equal(plan.automationLevel, 'draft_only');
  assert.equal(plan.audience.segment, 'medium_risk_education');
  assert.ok(plan.steps.length >= 3);
  assert.ok(plan.steps.every((step) => step.status === 'draft'));
  assert.ok(plan.steps.some((step) => step.channel === 'wechat_private'));
  assert.ok(plan.complianceChecklist.every((item) => item.passed));
  assert.equal(plan.complianceSummary.autoSendBlocked, true);
  assert.equal(plan.complianceSummary.requiredManualReview, true);
  assert.ok(plan.complianceSummary.riskSignals.some((signal) => signal.includes('medium')));
  assert.match(plan.manualFollowUp.nextAction, /人工/);
  assert.match(plan.manualFollowUp.approvedAction, /人工跟进/);
  assert.match(plan.guardrails.join(''), /不会自动发送/);
  assert.match(plan.guardrails.join(''), /人工审核/);
});

test('health report API creates a lead and persists a professional report', async () => {
  const request = new Request('http://localhost/api/health-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '李女士',
      contact: 'li78035',
      scenarioSlug: 'sleep-support',
      answers: {
        sleepHours: 5,
        stressLevel: 8,
        symptomDurationDays: 21,
        medicationUse: '偶尔使用助眠药',
        pregnancyOrBreastfeeding: false,
      },
      consent: {
        privacyAccepted: true,
        termsAccepted: true,
        version: 'privacy-terms-2026-05',
        page: '/ai-consult',
      },
    }),
  });

  const response = await createHealthReportRoute(request);
  const body = await response.json();
  const reports = listHealthReports();
  const leads = listLeads();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.lead.contact, 'li78035');
  assert.equal(body.lead.consent.privacyAccepted, true);
  assert.equal(body.lead.consent.termsAccepted, true);
  assert.equal(body.lead.consent.version, 'privacy-terms-2026-05');
  assert.equal(body.lead.consent.page, '/ai-consult');
  assert.ok(body.lead.consent.acceptedAt);
  assert.equal(body.report.leadId, body.lead.id);
  assert.equal(body.report.status, 'pending_manual_review');
  assert.equal(body.report.riskLevel, 'high');
  assert.ok(body.report.sections.some((section: { title: string }) => section.title === '风险分层'));
  assert.equal(reports[0]?.id, body.report.id);
  assert.equal(reports[0]?.audit.source, 'ai_health_report');
  assert.equal(leads[0]?.consent.version, 'privacy-terms-2026-05');
});

test('health report API preserves customer smoke source for workspace filtering', async () => {
  const request = new Request('http://localhost/api/health-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Smoke 测试线索',
      contact: 'customer-smoke-wechat',
      scenarioSlug: 'sleep-support',
      source: 'customer_journey_smoke',
      answers: {
        sleepHours: 5.5,
        stressLevel: 7,
        symptomDurationDays: 14,
        medicationUse: '无',
        pregnancyOrBreastfeeding: false,
      },
      consent: {
        privacyAccepted: true,
        termsAccepted: true,
        version: 'privacy-terms-2026-05',
        page: '/ai-consult',
      },
    }),
  });

  const response = await createHealthReportRoute(request);
  const body = await response.json();
  const leads = listLeads();

  assert.equal(response.status, 200);
  assert.equal(body.lead.source, 'customer_journey_smoke');
  assert.equal(leads[0]?.source, 'customer_journey_smoke');
});

test('marketing plan API creates an automated draft workflow from a report', async () => {
  const reportResponse = await createHealthReportRoute(
    new Request('http://localhost/api/health-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '王先生',
        contact: 'wechat-marketing',
        scenarioSlug: 'brain-focus',
        answers: {
          sleepHours: 6,
          stressLevel: 6,
          symptomDurationDays: 7,
          medicationUse: '',
          pregnancyOrBreastfeeding: false,
        },
      }),
    })
  );
  const reportBody = await reportResponse.json();

  const response = await createMarketingPlanRoute(
    new Request('http://localhost/api/marketing/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId: reportBody.report.id,
        channels: ['wechat_private', 'sms', 'content_remarketing'],
      }),
    })
  );
  const body = await response.json();
  const plans = listMarketingPlans();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.plan.reportId, reportBody.report.id);
  assert.equal(body.plan.status, 'pending_manual_review');
  assert.equal(body.plan.automationLevel, 'draft_only');
  assert.equal(body.plan.workflow.trigger, 'health_report_generated');
  assert.equal(body.plan.workflow.reviewGate, 'manual_approval_required');
  assert.ok(body.plan.workflow.stopConditions.length >= 2);
  assert.ok(body.plan.steps.every((step: { status: string }) => step.status === 'draft'));
  assert.equal(body.plan.complianceSummary.autoSendBlocked, true);
  assert.equal(body.plan.manualFollowUp.owner, 'health_advisor');
  assert.deepEqual(body.plan.reviewHistory, []);
  assert.equal(plans[0]?.id, body.plan.id);
  assert.equal(plans[0]?.complianceSummary.autoSendBlocked, true);
});

test('AI consult form submits report inputs and requests draft marketing automation', () => {
  const source = readFileSync(path.join(originalCwd, 'app/ai-consult/AiConsultForm.tsx'), 'utf8');

  assert.match(source, /\/api\/health-report/);
  assert.match(source, /\/api\/marketing\/plan/);
  assert.match(source, /sleepHours/);
  assert.match(source, /stressLevel/);
  assert.match(source, /symptomDurationDays/);
  assert.match(source, /medicationUse/);
  assert.match(source, /pregnancyOrBreastfeeding/);
  assert.match(source, /风险分层/);
  assert.match(source, /顾问复核/);
  assert.match(source, /人工确认后才会联系/);
  assert.match(source, /风险关注指数/);
  assert.match(source, /分值越高越需要先人工复核/);
  assert.doesNotMatch(source, /综合评分/);
  assert.match(source, /required/);
  assert.match(source, /privacyConsent/);
  assert.match(source, /privacy-terms-2026-05/);
  assert.match(source, /consent/);
  assert.match(source, /\/privacy/);
  assert.match(source, /\/terms/);
  assert.match(source, /我已阅读并同意/);
  assert.match(source, /AI 报告仅作健康教育参考/);
  assert.doesNotMatch(source, /营销草稿/);
  assert.doesNotMatch(source, /自动化营销草稿/);
  assert.doesNotMatch(source, /\/api\/leads/);
});
