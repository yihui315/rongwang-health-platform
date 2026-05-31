import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

import {
  GET as listHealthReportsRoute,
  POST as createHealthReportRoute,
  PATCH as updateHealthReportRoute,
} from '../app/api/health-report/route';
import {
  GET as listMarketingPlansRoute,
  POST as createMarketingPlanRoute,
  PATCH as updateMarketingPlanRoute,
} from '../app/api/marketing/plan/route';
import { POST as loginRoute } from '../app/api/auth/login/route';
import { isAdminProtectionEnabled, requireAdminRequest } from '../src/lib/auth/admin-guard';
import { resetLeadsForTest } from '../src/lib/contact/lead-store';
import { listHealthReports, resetHealthReportsForTest } from '../src/lib/health-report/report-store';
import { listMarketingPlans, resetMarketingPlansForTest } from '../src/lib/marketing/marketing-plan-store';

const originalCwd = process.cwd();
const tempDir = mkdtempSync(path.join(tmpdir(), 'rongwang-workspace-audit-'));
const env = process.env as Record<string, string | undefined>;
const originalNodeEnv = env.NODE_ENV;
const originalAdminToken = env.RONGWANG_ADMIN_TOKEN;
const originalLegacyAdminToken = env.ADMIN_TOKEN;

before(() => {
  process.chdir(tempDir);
  env.NODE_ENV = 'test';
  env.RONGWANG_ADMIN_TOKEN = '';
  env.ADMIN_TOKEN = '';
  resetLeadsForTest();
  resetHealthReportsForTest();
  resetMarketingPlansForTest();
});

after(() => {
  process.chdir(originalCwd);
  env.NODE_ENV = originalNodeEnv;
  env.RONGWANG_ADMIN_TOKEN = originalAdminToken;
  env.ADMIN_TOKEN = originalLegacyAdminToken;
  rmSync(tempDir, { recursive: true, force: true });
});

test('admin review APIs accept login cookie authorization when admin token is configured', async () => {
  env.NODE_ENV = 'production';
  env.RONGWANG_ADMIN_TOKEN = 'workspace-secret-token';
  env.ADMIN_TOKEN = '';

  try {
    const unauthorizedPlansResponse = await listMarketingPlansRoute(
      new Request('http://localhost/api/marketing/plan', {
        method: 'GET',
      })
    );
    const unauthorizedPlansBody = await unauthorizedPlansResponse.json();

    assert.equal(unauthorizedPlansResponse.status, 401);
    assert.equal(unauthorizedPlansBody.ok, false);
    assert.match(unauthorizedPlansBody.error, /Admin authorization required/);

    const authorizedPlansResponse = await listMarketingPlansRoute(
      new Request('http://localhost/api/marketing/plan', {
        method: 'GET',
        headers: {
          cookie: 'rongwang_admin_token=workspace-secret-token',
        },
      })
    );
    const authorizedPlansBody = await authorizedPlansResponse.json();

    assert.equal(authorizedPlansResponse.status, 200);
    assert.equal(authorizedPlansBody.ok, true);

    const authorizedReportsResponse = await listHealthReportsRoute(
      new Request('http://localhost/api/health-report', {
        method: 'GET',
        headers: {
          cookie: 'rongwang_admin_token=workspace-secret-token',
        },
      })
    );
    const authorizedReportsBody = await authorizedReportsResponse.json();

    assert.equal(authorizedReportsResponse.status, 200);
    assert.equal(authorizedReportsBody.ok, true);
  } finally {
    env.NODE_ENV = 'test';
    env.RONGWANG_ADMIN_TOKEN = '';
    env.ADMIN_TOKEN = '';
  }
});

test('admin protection is enabled by default even when local env misses token', () => {
  env.NODE_ENV = 'test';
  env.RONGWANG_ADMIN_TOKEN = '';
  env.ADMIN_TOKEN = '';

  try {
    assert.equal(isAdminProtectionEnabled(), true);

    const unauthorized = requireAdminRequest(
      new Request('http://localhost/api/health-report', {
        method: 'GET',
      })
    );

    assert.ok(unauthorized);
    assert.equal(unauthorized.status, 401);
  } finally {
    env.NODE_ENV = 'test';
    env.RONGWANG_ADMIN_TOKEN = '';
    env.ADMIN_TOKEN = '';
  }
});

test('admin login keeps production cookies secure except local loopback preview', async () => {
  env.NODE_ENV = 'production';
  env.RONGWANG_ADMIN_TOKEN = 'workspace-secret-token';
  env.ADMIN_TOKEN = '';

  try {
    const localLoginResponse = await loginRoute(
      new Request('http://127.0.0.1:3002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'workspace-secret-token' }),
      })
    );
    const localCookie = localLoginResponse.headers.get('set-cookie') || '';

    assert.equal(localLoginResponse.status, 200);
    assert.match(localCookie, /rongwang_admin_token=workspace-secret-token/);
    assert.doesNotMatch(localCookie, /;\s*Secure/i);

    const productionLoginResponse = await loginRoute(
      new Request('https://rongwang.hk/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'workspace-secret-token' }),
      })
    );
    const productionCookie = productionLoginResponse.headers.get('set-cookie') || '';

    assert.equal(productionLoginResponse.status, 200);
    assert.match(productionCookie, /;\s*Secure/i);
  } finally {
    env.NODE_ENV = 'test';
    env.RONGWANG_ADMIN_TOKEN = '';
    env.ADMIN_TOKEN = '';
  }
});

test('Next proxy convention replaces deprecated middleware file', () => {
  assert.ok(readFileSync(path.join(originalCwd, 'proxy.ts'), 'utf8').includes('export function proxy'));
  assert.throws(() => readFileSync(path.join(originalCwd, 'middleware.ts'), 'utf8'), /ENOENT/);
});

test('admin review routes can approve reports and marketing plans', async () => {
  env.NODE_ENV = 'production';
  env.RONGWANG_ADMIN_TOKEN = 'workspace-secret-token';
  env.ADMIN_TOKEN = '';
  const adminHeaders = {
    'Content-Type': 'application/json',
    cookie: 'rongwang_admin_token=workspace-secret-token',
  };

  try {
  const reportResponse = await createHealthReportRoute(
    new Request('http://localhost/api/health-report', {
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
      }),
    })
  );
  const reportBody = await reportResponse.json();

  const approvedReportResponse = await updateHealthReportRoute(
    new Request('http://localhost/api/health-report', {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        reportId: reportBody.report.id,
        status: 'approved',
        reviewNotes: '已完成人工审核，可进入顾问跟进。',
      }),
    })
  );
  const approvedReportBody = await approvedReportResponse.json();

  assert.equal(approvedReportResponse.status, 200);
  assert.equal(approvedReportBody.ok, true);
  assert.equal(approvedReportBody.report.status, 'approved');
  assert.equal(approvedReportBody.report.reviewNotes, '已完成人工审核，可进入顾问跟进。');
  assert.ok(approvedReportBody.report.reviewedAt);
  assert.equal(listHealthReports()[0]?.status, 'approved');

  const planResponse = await createMarketingPlanRoute(
    new Request('http://localhost/api/marketing/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId: reportBody.report.id,
        channels: ['wechat_private', 'sms', 'content_remarketing'],
      }),
    })
  );
  const planBody = await planResponse.json();

  const approvedPlanResponse = await updateMarketingPlanRoute(
    new Request('http://localhost/api/marketing/plan', {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        planId: planBody.plan.id,
        status: 'approved',
        reviewNotes: '营销草稿已复核，可交给运营继续人工跟进。',
      }),
    })
  );
  const approvedPlanBody = await approvedPlanResponse.json();

  assert.equal(approvedPlanResponse.status, 200);
  assert.equal(approvedPlanBody.ok, true);
  assert.equal(approvedPlanBody.plan.status, 'approved');
  assert.equal(approvedPlanBody.plan.reviewNotes, '营销草稿已复核，可交给运营继续人工跟进。');
  assert.ok(approvedPlanBody.plan.reviewedAt);
  assert.equal(approvedPlanBody.plan.reviewHistory.length, 1);
  assert.equal(approvedPlanBody.plan.reviewHistory[0].status, 'approved');
  assert.equal(approvedPlanBody.plan.reviewHistory[0].reviewer, 'admin');
  assert.equal(approvedPlanBody.plan.reviewHistory[0].notes, '营销草稿已复核，可交给运营继续人工跟进。');
  assert.equal(listMarketingPlans()[0]?.status, 'approved');
  assert.equal(listMarketingPlans()[0]?.reviewHistory.length, 1);

  const rejectedPlanResponse = await updateMarketingPlanRoute(
    new Request('http://localhost/api/marketing/plan', {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        planId: planBody.plan.id,
        status: 'rejected',
        reviewNotes: '第二次复核发现文案需要重新调整。',
        reviewer: 'compliance',
      }),
    })
  );
  const rejectedPlanBody = await rejectedPlanResponse.json();

  assert.equal(rejectedPlanResponse.status, 200);
  assert.equal(rejectedPlanBody.plan.status, 'rejected');
  assert.equal(rejectedPlanBody.plan.reviewHistory.length, 2);
  assert.equal(rejectedPlanBody.plan.reviewHistory[1].status, 'rejected');
  assert.equal(rejectedPlanBody.plan.reviewHistory[1].reviewer, 'compliance');

  const resubmittedPlanResponse = await updateMarketingPlanRoute(
    new Request('http://localhost/api/marketing/plan', {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        planId: planBody.plan.id,
        status: 'pending_manual_review',
        reviewNotes: '运营已调整文案，重新提交人工审核。',
        reviewer: 'operator',
      }),
    })
  );
  const resubmittedPlanBody = await resubmittedPlanResponse.json();

  assert.equal(resubmittedPlanResponse.status, 200);
  assert.equal(resubmittedPlanBody.plan.status, 'pending_manual_review');
  assert.equal(resubmittedPlanBody.plan.reviewHistory.length, 3);
  assert.equal(resubmittedPlanBody.plan.reviewHistory[2].status, 'pending_manual_review');
  assert.equal(resubmittedPlanBody.plan.reviewHistory[2].reviewer, 'operator');
  assert.equal(resubmittedPlanBody.plan.reviewHistory[2].notes, '运营已调整文案，重新提交人工审核。');
  assert.equal(resubmittedPlanBody.plan.complianceSummary.autoSendBlocked, true);
  assert.ok(resubmittedPlanBody.plan.steps.every((step: { status: string }) => step.status === 'draft'));
  } finally {
    env.NODE_ENV = 'test';
    env.RONGWANG_ADMIN_TOKEN = '';
    env.ADMIN_TOKEN = '';
  }
});

test('workspace page advertises health report and marketing review panels', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/page.tsx'), 'utf8');

  assert.match(source, /健康报告审核/);
  assert.match(source, /同意记录/);
  assert.match(source, /privacyAccepted/);
  assert.match(source, /termsAccepted/);
  assert.match(source, /acceptedAt/);
  assert.match(source, /consentByLeadId/);
  assert.match(source, /营销草稿审核/);
  assert.match(source, /通过/);
  assert.match(source, /驳回/);
  assert.match(source, /重新提交审核/);
  assert.match(source, /pending_manual_review/);
  assert.match(source, /\/api\/health-report/);
  assert.match(source, /\/api\/marketing\/plan/);
  assert.match(source, /workspace-panel/);
  assert.match(source, /workspace-row-actions/);
});

test('workspace report cards label report score as a risk attention index', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/page.tsx'), 'utf8');

  assert.match(source, /风险关注指数/);
  assert.match(source, /分值越高越需要先人工复核/);
  assert.doesNotMatch(source, /· 评分 \{report\.overallScore\}/);
});

test('workspace report review can filter and label customer smoke data', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(originalCwd, 'app/globals.css'), 'utf8');

  assert.match(source, /type ReviewSourceFilter/);
  assert.match(source, /const \[sourceFilter, setSourceFilter\]/);
  assert.match(source, /leadById/);
  assert.match(source, /isSmokeLead/);
  assert.match(source, /客户旅程 Smoke/);
  assert.match(source, /仅看 Smoke/);
  assert.match(source, /隐藏 Smoke/);
  assert.match(source, /全部数据/);
  assert.match(source, /aria-pressed=\{sourceFilter === option\.value\}/);
  assert.match(source, /visibleReports =/);
  assert.match(source, /matchesSourceFilter\(leadById\.get\(report\.leadId\), sourceFilter\)/);
  assert.match(source, /workspace-source-badge/);
  assert.match(styles, /\.workspace-report-filter-bar\s*\{/);
  assert.match(styles, /\.workspace-source-badge\s*\{/);
  assert.match(styles, /\.workspace-source-badge-smoke\s*\{/);
});

test('workspace marketing review can filter and label customer smoke data', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/page.tsx'), 'utf8');

  assert.match(source, /type ReviewSourceFilter/);
  assert.match(source, /const \[sourceFilter, setSourceFilter\]/);
  assert.match(source, /visiblePlans =/);
  assert.match(source, /leadById\.get\(plan\.leadId\)/);
  assert.match(source, /aria-label="审核数据来源筛选"/);
  assert.match(source, /aria-pressed=\{sourceFilter === option\.value\}/);
  assert.match(source, /全部数据/);
  assert.match(source, /客户旅程 Smoke/);
  assert.match(source, /来源：\{planLead\?\.source \|\| '未记录'\}/);
});

test('workspace page surfaces launch readiness gaps for WeChat and customer systems', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(originalCwd, 'app/globals.css'), 'utf8');

  assert.match(source, /上线准备核对/);
  assert.match(source, /微信登录/);
  assert.match(source, /微信商城/);
  assert.match(source, /小程序/);
  assert.match(source, /客户系统/);
  assert.match(source, /未开通/);
  assert.match(source, /顾问人工确认/);
  assert.match(source, /阻断自动发送/);
  assert.match(source, /人工审核/);
  assert.match(source, /workspace-readiness/);
  assert.match(source, /readinessItems/);
  assert.match(styles, /\.workspace-readiness\s*\{/);
  assert.match(styles, /\.workspace-readiness-grid\s*\{/);
  assert.match(styles, /\.workspace-readiness-status-/);
});

test('workspace page exposes admin logout action', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(originalCwd, 'app/globals.css'), 'utf8');

  assert.match(source, /useRouter/);
  assert.match(source, /\/api\/auth\/logout/);
  assert.match(source, /method:\s*'POST'/);
  assert.match(source, /退出登录/);
  assert.match(source, /router\.push\('\/login'\)/);
  assert.match(styles, /\.workspace-actions a,\s*\.workspace-actions button/s);
});

test('admin login form exposes a stable token field for browser smoke tests', () => {
  const source = readFileSync(path.join(originalCwd, 'app/login/LoginForm.tsx'), 'utf8');

  assert.match(source, /id="admin-token"/);
  assert.match(source, /name="token"/);
  assert.match(source, /autoComplete="current-password"/);
  assert.match(source, /aria-label="管理员令牌"/);
});

test('workspace marketing review surfaces draft copy layout preflight', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(originalCwd, 'app/globals.css'), 'utf8');

  assert.match(source, /DraftLayoutPreviewGroup/);
  assert.match(source, /draftCopy/);
  assert.match(source, /营销文案布局预检/);
  assert.match(source, /合规预检摘要/);
  assert.match(source, /人工跟进建议/);
  assert.match(source, /审核历史/);
  assert.match(source, /complianceSummary/);
  assert.match(source, /manualFollowUp/);
  assert.match(source, /reviewHistory/);
  assert.match(source, /reviewDraftFonts/);
  assert.match(styles, /draft-layout-summary/);
  assert.match(styles, /workspace-review-grid/);
  assert.match(styles, /workspace-review-block/);
});

test('draft layout summary is protected from mobile horizontal overflow', () => {
  const styles = readFileSync(path.join(originalCwd, 'app/globals.css'), 'utf8');

  assert.match(styles, /\.draft-layout-summary\s*\{[^}]*flex-wrap:\s*wrap/s);
  assert.match(styles, /\.draft-layout-summary strong\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.draft-layout-summary span\s*\{[^}]*white-space:\s*normal/s);
  assert.match(styles, /\.draft-layout-summary span\s*\{[^}]*overflow-wrap:\s*anywhere/s);
});

test('workspace health report review surfaces report copy layout preflight', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/page.tsx'), 'utf8');

  assert.match(source, /健康报告布局预检/);
  assert.match(source, /report\.redFlags/);
  assert.match(source, /report\.reviewNotes/);
  assert.match(source, /reviewDraftFonts\.reportCopy/);
  assert.match(source, /workspace-report-preflight/);
});

test('workspace content generation surfaces grouped draft layout preflight', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/generate/page.tsx'), 'utf8');

  assert.match(source, /DraftLayoutPreviewGroup/);
  assert.match(source, /移动端文案布局预检/);
  assert.match(source, /latestContent\.shortTitle/);
  assert.match(source, /latestContent\.shortDescription/);
  assert.match(source, /latestContent\.faqDraft/);
});

test('workspace import surfaces measured import messages and product titles', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/import/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(originalCwd, 'app/globals.css'), 'utf8');

  assert.match(source, /import MeasuredText/);
  assert.match(source, /importTextFonts/);
  assert.match(source, /className="workspace-import-message"[\s\S]*font=\{importTextFonts\.message\}/);
  assert.match(source, /className="workspace-import-message"[\s\S]*maxLines=\{2\}/);
  assert.match(source, /className="workspace-import-product-title"[\s\S]*font=\{importTextFonts\.productTitle\}/);
  assert.match(source, /className="workspace-import-product-title"[\s\S]*maxLines=\{2\}/);
  assert.match(source, /className="workspace-import-table-wrap"/);
  assert.match(styles, /\.workspace-import-table-wrap\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(styles, /\.workspace-import-table-wrap\s*\{[^}]*max-width:\s*100%/s);
  assert.match(styles, /\.workspace-import-product-title\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(styles, /\.workspace-import-table\s*\{[^}]*min-width:\s*1280px/s);
});

test('workspace import surfaces product audit metadata for latest price sheet reviews', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/import/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(originalCwd, 'app/globals.css'), 'utf8');

  assert.match(source, /rawPayload/);
  assert.match(source, /资料状态/);
  assert.match(source, /来源行/);
  assert.match(source, /合规提示/);
  assert.match(source, /图片待确认/);
  assert.match(source, /图片参考/);
  assert.match(source, /product\.rawPayload\.sourceRows/);
  assert.match(source, /product\.rawPayload\.specs\?\.合规提示/);
  assert.match(source, /className="workspace-import-audit-note"/);
  assert.match(source, /workspace-import-status-pill workspace-import-status-pill-\$\{assetStatus\.tone\}/);
  assert.match(styles, /\.workspace-import-audit-note\s*\{[^}]*white-space:\s*normal/s);
  assert.match(styles, /\.workspace-import-audit-note\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(styles, /\.workspace-import-status-pill\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(styles, /\.workspace-import-table\s*\{[^}]*min-width:\s*1280px/s);
});

test('workspace import provides audit filters for imported product follow-up work', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/import/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(originalCwd, 'app/globals.css'), 'utf8');

  assert.match(source, /type ImportFilter/);
  assert.match(source, /const \[importFilter, setImportFilter\]/);
  assert.match(source, /visibleProducts/);
  assert.match(source, /待补图片/);
  assert.match(source, /有图片参考/);
  assert.match(source, /有合规提示/);
  assert.match(source, /aria-pressed=\{importFilter === option\.value\}/);
  assert.match(source, /products\.filter/);
  assert.match(source, /workspace-import-filter-bar/);
  assert.match(source, /workspace-import-empty/);
  assert.match(styles, /\.workspace-import-filter-bar\s*\{[^}]*flex-wrap:\s*wrap/s);
  assert.match(styles, /\.workspace-import-filter-button\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(styles, /\.workspace-import-empty\s*\{[^}]*overflow-wrap:\s*anywhere/s);
});

test('workspace import exposes traceable JD image reference links', () => {
  const source = readFileSync(path.join(originalCwd, 'app/workspace/import/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(originalCwd, 'app/globals.css'), 'utf8');

  assert.match(source, /图片来源/);
  assert.match(source, /product\.rawPayload\.jdReference\?\.itemUrl/);
  assert.match(source, /getAssetFollowUpNote/);
  assert.match(source, /product\.rawPayload\.importNotes\?\.assetFollowUp/);
  assert.match(source, /补图：/);
  assert.match(source, /className="workspace-import-reference-link"/);
  assert.match(source, /className="workspace-import-follow-up-note"/);
  assert.match(source, /target="_blank"/);
  assert.match(source, /rel="noreferrer"/);
  assert.match(source, /待补来源/);
  assert.match(styles, /\.workspace-import-reference-link\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(styles, /\.workspace-import-reference-missing\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(styles, /\.workspace-import-follow-up-note\s*\{[^}]*overflow-wrap:\s*anywhere/s);
});
