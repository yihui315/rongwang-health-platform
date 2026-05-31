import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const rootDir = process.cwd();

function readProjectFile(relativePath: string): string {
  return readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function parseJsonSummary(scriptName: string, stdout: string, stderr: string) {
  for (const output of [stdout, stderr]) {
    const jsonStart = output.lastIndexOf('\n{');
    const jsonText = jsonStart === -1 ? output.trim() : output.slice(jsonStart + 1).trim();

    if (!jsonText.startsWith('{')) continue;
    return JSON.parse(jsonText) as unknown;
  }

  assert.fail(`${scriptName} did not print JSON summary:\n${stdout}\n${stderr}`);
}

function runProjectScript(scriptPath: string, env: NodeJS.ProcessEnv) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: rootDir,
    env,
    encoding: 'utf8',
  });

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    summary: parseJsonSummary(scriptPath, result.stdout, result.stderr),
  };
}

function runReleaseGate(env: Record<string, string>) {
  const result = runProjectScript('scripts/release-gate.mjs', {
    ...process.env,
    ...env,
  });

  return {
    ...result,
    summary: result.summary as {
      decision: 'PASS' | 'FAIL';
      failures: string[];
      inspectedEnvironment: {
        gateMode: 'local-preview' | 'production';
      };
    },
  };
}

function runDeployCheck(env: NodeJS.ProcessEnv) {
  const result = runProjectScript('scripts/deploy-check.mjs', env);

  return {
    ...result,
    summary: result.summary as {
      decision: 'PASS' | 'FAIL';
      checks: number;
      failures: string[];
      gateMode: 'ready' | 'blocked';
      inspectedFrom: string;
    },
  };
}

function runComplianceScan(env: NodeJS.ProcessEnv) {
  const result = runProjectScript('scripts/compliance-scan.mjs', env);

  return {
    ...result,
    summary: result.summary as {
      decision: 'PASS' | 'FAIL';
      scannedFiles?: number;
      findings?: Array<{
        file: string;
        line: number;
        phrase: string;
      }>;
    },
  };
}

function runReleaseLogCheck(releaseLogPath: string) {
  const result = runProjectScript('scripts/release-log-check.mjs', {
    ...process.env,
    RELEASE_LOG_PATH: releaseLogPath,
  });

  return {
    ...result,
    summary: result.summary as {
      decision: 'PASS' | 'FAIL';
      checkedFile: string;
      checks: number;
      failures: string[];
    },
  };
}

function runReleaseDryRun() {
  const result = runProjectScript('scripts/release-dry-run.mjs', process.env);

  return {
    ...result,
    summary: result.summary as {
      decision: 'PASS' | 'FAIL';
      dryRun: true;
      releaseGate: {
        decision: 'PASS' | 'FAIL';
        gateMode: 'production' | 'local-preview';
        failures: string[];
      };
      releaseLog: {
        decision: 'PASS' | 'FAIL';
        checkedFile: string;
        failures: string[];
      };
      failures: string[];
    },
  };
}

async function runCustomerSmokeAsync(env: NodeJS.ProcessEnv) {
  const result = await runProjectScriptAsync('scripts/customer-journey-smoke.mjs', env);

  return {
    ...result,
    summary: result.summary as {
      decision: 'PASS' | 'FAIL';
      checks: number;
      failures: string[];
      smokeMode: 'customer-journey';
    },
  };
}

async function runProjectScriptAsync(scriptPath: string, env: NodeJS.ProcessEnv) {
  const child = spawn(process.execPath, [scriptPath], {
    cwd: rootDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  const status = await new Promise<number | null>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });

  return {
    status,
    stdout,
    stderr,
    summary: parseJsonSummary(scriptPath, stdout, stderr),
  };
}

async function runFastFunnelSmokeAsync(env: NodeJS.ProcessEnv) {
  const result = await runProjectScriptAsync('scripts/smoke-fast-funnel.mjs', env);

  return {
    ...result,
    summary: result.summary as {
      decision: 'PASS' | 'FAIL';
      checks: number;
      failures: string[];
      smokeMode: 'fast-funnel';
    },
  };
}

async function runAcceptanceSmokeAsync(env: NodeJS.ProcessEnv) {
  const result = await runProjectScriptAsync('scripts/acceptance-fast-funnel.mjs', env);

  return {
    ...result,
    summary: result.summary as {
      decision: 'PASS' | 'FAIL';
      homepageScenarioCardsCount: number;
      productCardsFound: number;
      failures: string[];
    },
  };
}

async function readRequestBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function sendResponse(
  response: ServerResponse,
  status: number,
  body: string,
  headers: Record<string, string | string[]> = {}
) {
  response.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    ...headers,
  });
  response.end(body);
}

function sendJson(response: ServerResponse, status: number, body: unknown, headers: Record<string, string | string[]> = {}) {
  sendResponse(response, status, JSON.stringify(body), {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
}

async function withCustomerSmokeServer(callback: (baseUrl: string, state: { smokeSourceSeen: boolean }) => Promise<void>) {
  const state = { smokeSourceSeen: false };
  let lastReportId = '';
  let lastLeadId = '';
  let lastPlanId = '';

  const server = createServer(async (request, response) => {
    const url = new URL(request.url || '/', 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/products') {
      sendResponse(
        response,
        200,
        '已审核商品展示 官网商城当前为商品展示与顾问确认入口 微信商城/小程序待开通 本品不能替代药物'
      );
      return;
    }

    if (request.method === 'GET' && url.pathname === '/products/prod_demo_approved') {
      sendResponse(response, 200, '荣旺进口维生素营养片 当前不提供站内支付 本商品符合原产国标准');
      return;
    }

    if (request.method === 'GET' && url.pathname === '/') {
      sendResponse(
        response,
        200,
        [
          '按健康场景查看方案',
          '<a href="/solutions/sleep-support">睡眠压力</a>',
          '<a href="/solutions/brain-focus">脑力专注</a>',
          '<a href="/solutions/liver-metabolism">肝脏代谢</a>',
          '<a href="/solutions/joint-bone">关节骨骼</a>',
          '<a href="/solutions/digestive-support">消化代谢</a>',
          '<a href="/solutions/immune-support">免疫支持</a>',
          '<a href="/solutions/men-health">男士健康</a>',
          '<a href="/solutions/women-health">女士健康</a>',
        ].join('\n')
      );
      return;
    }

    if (request.method === 'GET' && url.pathname.startsWith('/solutions/')) {
      sendResponse(
        response,
        200,
        [
          '推荐产品',
          '本页面内容仅用于健康教育',
          '<article class="solution-product-card">推荐产品</article>',
          '<a href="https://mobile.yangkeduo.com/goods.html?goods_id=123&utm_campaign=fast_funnel_v2">查看</a>',
        ].join('\n')
      );
      return;
    }

    if (request.method === 'GET' && url.pathname === '/product-map/sleep-support-001') {
      sendResponse(response, 200, '购买前复核');
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/health-report') {
      const body = await readRequestBody(request);
      state.smokeSourceSeen = body.source === 'customer_journey_smoke';
      lastReportId = 'report_smoke_1';
      lastLeadId = 'lead_smoke_1';
      sendJson(response, 200, {
        ok: true,
        lead: {
          id: lastLeadId,
          source: body.source,
          consent: body.consent,
        },
        report: {
          id: lastReportId,
          status: 'pending_manual_review',
          overallScore: 72,
          manualReviewRequired: true,
        },
      });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/marketing/plan') {
      lastPlanId = 'plan_smoke_1';
      sendJson(response, 200, {
        ok: true,
        plan: {
          id: lastPlanId,
          status: 'pending_manual_review',
          automationLevel: 'draft_only',
          workflow: { reviewGate: 'manual_approval_required' },
          complianceSummary: { autoSendBlocked: true },
        },
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/workspace') {
      if (!request.headers.cookie?.includes('rongwang_admin_token=smoke-admin-token')) {
        response.writeHead(307, { Location: '/login?next=/workspace' });
        response.end();
        return;
      }
      sendResponse(response, 200, '运营审核工作台 上线准备核对 微信登录 未开通');
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readRequestBody(request);
      if (body.token !== 'smoke-admin-token') {
        sendJson(response, 401, { ok: false });
        return;
      }
      sendJson(response, 200, { ok: true }, { 'Set-Cookie': 'rongwang_admin_token=smoke-admin-token; Path=/; HttpOnly' });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/health-report') {
      if (!request.headers.cookie?.includes('rongwang_admin_token=smoke-admin-token')) {
        sendJson(response, 401, { ok: false });
        return;
      }
      sendJson(response, 200, {
        ok: true,
        reports: [{ id: lastReportId }],
        leads: [{ id: lastLeadId, source: 'customer_journey_smoke' }],
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/marketing/plan') {
      if (!request.headers.cookie?.includes('rongwang_admin_token=smoke-admin-token')) {
        sendJson(response, 401, { ok: false });
        return;
      }
      sendJson(response, 200, {
        ok: true,
        plans: [{ id: lastPlanId }],
      });
      return;
    }

    sendResponse(response, 404, 'not found');
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');

  try {
    await callback(`http://127.0.0.1:${address.port}`, state);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

function currentEnvironmentWithoutAdminToken(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.RONGWANG_ADMIN_TOKEN;
  delete env.ADMIN_TOKEN;
  return env;
}

test('release readiness provides repeatable deploy checks and runbooks', () => {
  assert.ok(existsSync(path.join(rootDir, 'scripts/deploy-check.mjs')), 'deploy-check script is missing');
  assert.ok(existsSync(path.join(rootDir, 'docs/release-runbook.md')), 'release runbook is missing');
  assert.ok(existsSync(path.join(rootDir, 'docs/ops-monitoring.md')), 'ops monitoring doc is missing');
  assert.ok(existsSync(path.join(rootDir, 'scripts/customer-journey-smoke.mjs')), 'customer journey smoke script is missing');

  const packageJson = JSON.parse(readProjectFile('package.json')) as { scripts: Record<string, string> };
  assert.equal(packageJson.scripts['deploy:check'], 'node scripts/deploy-check.mjs');
  assert.equal(packageJson.scripts['customer:smoke'], 'node scripts/customer-journey-smoke.mjs');
  assert.match(packageJson.scripts['release:verify'], /deploy:check/);
  assert.match(packageJson.scripts['release:verify'], /typecheck/);
  assert.match(packageJson.scripts['release:verify'], /test/);
  assert.match(packageJson.scripts['release:verify'], /build/);
  assert.match(packageJson.scripts['release:verify'], /lint/);
  assert.match(packageJson.scripts['release:verify'], /compliance:scan/);
  assert.match(packageJson.scripts['release:smoke'], /smoke/);
  assert.match(packageJson.scripts['release:smoke'], /acceptance/);
  assert.match(packageJson.scripts['release:smoke'], /customer:smoke/);

  const deployCheck = readProjectFile('scripts/deploy-check.mjs');
  for (const required of ['DATABASE_URL', 'NEXT_PUBLIC_SITE_URL', 'APP_SECRET', 'JWT_SECRET', 'RONGWANG_ADMIN_TOKEN']) {
    assert.match(deployCheck, new RegExp(required));
  }
  assert.match(deployCheck, /\/workspace/);
  assert.match(deployCheck, /\/api\/mock/);
  assert.match(deployCheck, /RONGWANG_ADMIN_TOKEN must be set/);
  assert.match(deployCheck, /draft_only/);
  assert.match(deployCheck, /manual_approval_required/);
  assert.match(deployCheck, /release:verify/);
  assert.match(deployCheck, /customer journey smoke script exists/);

  const runbook = readProjectFile('docs/release-runbook.md');
  for (const required of [
    'production branch',
    'git archive',
    'npm ci',
    'npm run build',
    'systemctl restart rongwang-health-platform',
    'nginx -t',
    'rollback',
    'backup',
    'RONGWANG_ADMIN_TOKEN',
    'local HTTP loopback preview may omit the Secure cookie flag',
    'Production HTTPS must keep the admin cookie Secure',
    '本品不能替代药物',
    'manual review',
    'npm run customer:smoke',
  ]) {
    assert.match(runbook, new RegExp(required));
  }

  const monitoring = readProjectFile('docs/ops-monitoring.md');
  for (const required of [
    'https://rongwang.hk/',
    '/products',
    '/ai-consult',
    '/workspace',
    '/compliance',
    '/api/mock/products',
    'npm run compliance:scan',
    'npm run customer:smoke',
    'customer_journey_smoke',
    'Smoke',
    'unauthorized',
    'rollback',
    'daily',
  ]) {
    assert.match(monitoring, new RegExp(required));
  }
});

test('deploy check executes ready and blocked decisions with explicit JSON mode', () => {
  const ready = runDeployCheck({
    ...process.env,
    RONGWANG_ADMIN_TOKEN: 'verify-local-token',
  });

  assert.equal(ready.status, 0);
  assert.equal(ready.summary.decision, 'PASS');
  assert.equal(ready.summary.gateMode, 'ready');
  assert.equal(ready.summary.failures.length, 0);
  assert.ok(ready.summary.checks >= 32);

  const blocked = runDeployCheck(currentEnvironmentWithoutAdminToken());

  assert.equal(blocked.status, 1);
  assert.equal(blocked.summary.decision, 'FAIL');
  assert.equal(blocked.summary.gateMode, 'blocked');
  assert.ok(blocked.summary.failures.includes('RONGWANG_ADMIN_TOKEN must be set before production release'));
});

test('compliance scan executes against configured roots and blocks risky public copy', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'rongwang-compliance-scan-'));

  try {
    const appDir = path.join(tempDir, 'app');
    mkdirSync(appDir, { recursive: true });

    writeFileSync(
      path.join(appDir, 'safe-copy.ts'),
      [
        'export const copy = "本品不能替代药物。本商品符合原产国标准，可能与中国相关标准存在差异。";',
        '',
      ].join('\n')
    );

    const safe = runComplianceScan({
      ...process.env,
      COMPLIANCE_SCAN_ROOTS: appDir,
    });

    assert.equal(safe.status, 0);
    assert.equal(safe.summary.decision, 'PASS');
    assert.equal(safe.summary.scannedFiles, 1);

    writeFileSync(path.join(appDir, 'risky-copy.ts'), 'export const copy = "治疗失眠，保证见效";\n');

    const risky = runComplianceScan({
      ...process.env,
      COMPLIANCE_SCAN_ROOTS: appDir,
    });

    assert.equal(risky.status, 1);
    assert.equal(risky.summary.decision, 'FAIL');
    assert.ok(risky.summary.findings?.some((finding) => finding.file.endsWith('risky-copy.ts')));
    assert.ok(risky.summary.findings?.some((finding) => finding.phrase === '治疗失眠'));
    assert.ok(risky.summary.findings?.some((finding) => finding.phrase === '保证见效'));
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('customer journey smoke verifies protected workspace and manual-review flow against a local server', async () => {
  await withCustomerSmokeServer(async (baseUrl, state) => {
    const result = await runCustomerSmokeAsync({
      ...process.env,
      SMOKE_BASE_URL: baseUrl,
      RONGWANG_ADMIN_TOKEN: 'smoke-admin-token',
    });

    assert.equal(result.status, 0);
    assert.equal(result.summary.decision, 'PASS');
    assert.equal(result.summary.smokeMode, 'customer-journey');
    assert.equal(result.summary.failures.length, 0);
    assert.ok(result.summary.checks >= 20);
    assert.equal(state.smokeSourceSeen, true);
  });
});

test('release smoke scripts run against one local server for funnel, acceptance, and customer journey', async () => {
  await withCustomerSmokeServer(async (baseUrl, state) => {
    const env = {
      ...process.env,
      SMOKE_BASE_URL: baseUrl,
      RONGWANG_ADMIN_TOKEN: 'smoke-admin-token',
    };

    const fastFunnel = await runFastFunnelSmokeAsync(env);
    assert.equal(fastFunnel.status, 0);
    assert.equal(fastFunnel.summary.decision, 'PASS');
    assert.equal(fastFunnel.summary.smokeMode, 'fast-funnel');
    assert.equal(fastFunnel.summary.failures.length, 0);
    assert.ok(fastFunnel.summary.checks >= 15);

    const acceptance = await runAcceptanceSmokeAsync(env);
    assert.equal(acceptance.status, 0);
    assert.equal(acceptance.summary.decision, 'PASS');
    assert.equal(acceptance.summary.failures.length, 0);
    assert.ok(acceptance.summary.homepageScenarioCardsCount >= 8);
    assert.ok(acceptance.summary.productCardsFound >= 4);

    const customer = await runCustomerSmokeAsync(env);
    assert.equal(customer.status, 0);
    assert.equal(customer.summary.decision, 'PASS');
    assert.equal(customer.summary.smokeMode, 'customer-journey');
    assert.equal(state.smokeSourceSeen, true);
  });
});

test('release preview smoke command starts local production preview and runs all smoke suites', () => {
  assert.ok(existsSync(path.join(rootDir, 'scripts/release-preview-smoke.mjs')), 'release preview smoke script is missing');

  const packageJson = JSON.parse(readProjectFile('package.json')) as { scripts: Record<string, string> };
  assert.equal(packageJson.scripts['release:preview-smoke'], 'node scripts/release-preview-smoke.mjs');

  const script = readProjectFile('scripts/release-preview-smoke.mjs');
  for (const required of [
    'next',
    'start',
    'scripts/smoke-fast-funnel.mjs',
    'scripts/acceptance-fast-funnel.mjs',
    'scripts/customer-journey-smoke.mjs',
    'SMOKE_BASE_URL',
    'RONGWANG_ADMIN_TOKEN',
    'server.kill',
    'previewSmoke',
  ]) {
    assert.match(script, new RegExp(required));
  }

  const runbook = readProjectFile('docs/release-runbook.md');
  assert.match(runbook, /npm run release:preview-smoke/);
  assert.match(runbook, /local production preview/i);
});

test('release runbook documents machine-readable release and smoke gate outputs', () => {
  const runbook = readProjectFile('docs/release-runbook.md');

  for (const required of [
    'gateMode',
    'smokeMode',
    'fast-funnel',
    'customer-journey',
    'homepageScenarioCardsCount',
    'productCardsFound',
    'trackingHookDetected',
    'COMPLIANCE_SCAN_ROOTS',
    'decision: PASS',
    'failures',
    'Do not deploy',
    'rollback',
    'investigate',
  ]) {
    assert.match(runbook, new RegExp(required));
  }
});

test('release runbook requires completed release log verification before release signoff', () => {
  const runbook = readProjectFile('docs/release-runbook.md');

  assert.match(runbook, /npm run release-log:check -- <completed-release-log\.md>/);
  assert.match(runbook, /completed release log/i);
  assert.match(runbook, /do not declare the release ready/i);
});

test('release log template captures gate evidence, manual approvals, and rollback notes', () => {
  assert.ok(existsSync(path.join(rootDir, 'docs/release-log-template.md')), 'release log template is missing');

  const template = readProjectFile('docs/release-log-template.md');
  for (const required of [
    'Release identity',
    'Release commit',
    'Operator',
    'Release timestamp',
    'RONGWANG_RELEASE_TARGET=production',
    'deploy:check JSON',
    'release:gate JSON',
    'compliance:scan JSON',
    'release:smoke JSON',
    'customer:smoke JSON',
    'gateMode',
    'smokeMode',
    'decision: PASS',
    'failures',
    'homepageScenarioCardsCount',
    'productCardsFound',
    'trackingHookDetected',
    'COMPLIANCE_SCAN_ROOTS',
    'Manual approval',
    'WeChat login',
    'WeChat store',
    'mini program',
    'payment',
    'automated marketing send',
    'auto listing publish',
    '本品不能替代药物',
    '本商品符合原产国标准',
    'Rollback decision',
    'Incident notes',
    'Do not deploy',
  ]) {
    assert.match(template, new RegExp(required));
  }
});

test('release log check blocks incomplete gate evidence and missing manual signatures', () => {
  assert.ok(existsSync(path.join(rootDir, 'scripts/release-log-check.mjs')), 'release-log-check script is missing');

  const packageJson = JSON.parse(readProjectFile('package.json')) as { scripts: Record<string, string> };
  assert.equal(packageJson.scripts['release-log:check'], 'node scripts/release-log-check.mjs');

  const tempDir = mkdtempSync(path.join(tmpdir(), 'rongwang-release-log-'));

  try {
    const passingLogPath = path.join(tempDir, 'passing-release-log.md');
    writeFileSync(
      passingLogPath,
      [
        '# Test Release Log',
        '',
        '- Release commit: abc123',
        '- Release branch: production',
        '- Release timestamp: 2026-05-31T19:00:00+08:00',
        '- Operator: QA Operator',
        '- Reviewer: Compliance Reviewer',
        '- Target site: https://rongwang.hk',
        '- Release package path: /tmp/rongwang-health-platform-abc123.tgz',
        '- Previous release id: previous-release',
        '',
        '- `RONGWANG_RELEASE_TARGET=production`: confirmed',
        '- `NEXT_PUBLIC_SITE_URL=https://rongwang.hk`: confirmed',
        '- `RONGWANG_ADMIN_TOKEN` stored in secret manager, not in this log: confirmed',
        '- `APP_SECRET` stored in secret manager, not in this log: confirmed',
        '- `JWT_SECRET` stored in secret manager, not in this log: confirmed',
        '- `ALLOW_WECHAT_LOGIN_PRODUCTION=false`: confirmed',
        '- `ALLOW_WECHAT_STORE_PRODUCTION=false`: confirmed',
        '- `ALLOW_PAYMENT_PRODUCTION=false`: confirmed',
        '- `ALLOW_AUTOMATED_MARKETING_SEND=false`: confirmed',
        '- `ALLOW_AUTO_LISTING_PUBLISH=false`: confirmed',
        '',
        '### `deploy:check JSON`',
        '```json',
        '{"decision":"PASS","checks":32,"failures":[],"gateMode":"ready"}',
        '```',
        '',
        '### `release:gate JSON`',
        '```json',
        '{"decision":"PASS","checks":17,"failures":[],"inspectedEnvironment":{"gateMode":"production"}}',
        '```',
        '',
        '### `compliance:scan JSON`',
        '```json',
        '{"decision":"PASS","scannedFiles":102}',
        '```',
        '',
        '- WeChat login: not applicable, signer QA, 2026-05-31T19:05:00+08:00',
        '- WeChat store: not applicable, signer QA, 2026-05-31T19:05:00+08:00',
        '- mini program: not applicable, signer QA, 2026-05-31T19:05:00+08:00',
        '- payment: not applicable, signer QA, 2026-05-31T19:05:00+08:00',
        '- automated marketing send: not applicable, signer QA, 2026-05-31T19:05:00+08:00',
        '- auto listing publish: not applicable, signer QA, 2026-05-31T19:05:00+08:00',
        '- health report approval: approved, signer QA, 2026-05-31T19:05:00+08:00',
        '- marketing draft approval: approved, signer QA, 2026-05-31T19:05:00+08:00',
        '- product copy publication: approved, signer QA, 2026-05-31T19:05:00+08:00',
        '- channel listing publication: not applicable, signer QA, 2026-05-31T19:05:00+08:00',
        '',
        '- Product pages preserve `本品不能替代药物`: confirmed',
        '- Cross-border pages preserve `本商品符合原产国标准` and the standard-difference notice: confirmed',
        '- AI health reports remain `pending_manual_review` when risk is elevated: confirmed',
        '- Marketing workflows remain `draft_only` and `manual_approval_required`: confirmed',
        '- No treatment, cure, guaranteed-effect, or disease claim was introduced: confirmed',
        '',
        '### `release:smoke JSON` fast funnel',
        '```json',
        '{"decision":"PASS","smokeMode":"fast-funnel","checks":19,"failures":[]}',
        '```',
        '',
        '### `release:smoke JSON` acceptance',
        '```json',
        '{"decision":"PASS","homepageScenarioCardsCount":8,"productCardsFound":8,"trackingHookDetected":true,"failures":[]}',
        '```',
        '',
        '### `customer:smoke JSON`',
        '```json',
        '{"decision":"PASS","smokeMode":"customer-journey","checks":29,"failures":[]}',
        '```',
        '',
        '- Home page loads: confirmed',
        '- `/products` loads approved products only: confirmed',
        '- `/ai-consult` accepts a test consultation into manual review: confirmed',
        '- `/workspace` redirects unauthorized users to login: confirmed',
        '- `/workspace` is reachable after admin login: confirmed',
        '- `/compliance` shows required statements: confirmed',
        '- `/api/mock/*` write routes reject unauthorized requests: confirmed',
        '',
        '- Rollback decision: not needed',
        '- Rollback trigger if any: none',
        '- Previous release id used: previous-release',
        '- Rollback operator: QA Operator',
        '- Recovery smoke command: not needed',
        '- Recovery smoke result: not needed',
      ].join('\n')
    );

    const passing = runReleaseLogCheck(passingLogPath);
    assert.equal(passing.status, 0);
    assert.equal(passing.summary.decision, 'PASS');
    assert.equal(passing.summary.failures.length, 0);
    assert.ok(passing.summary.checks >= 30);

    const failingLogPath = path.join(tempDir, 'failing-release-log.md');
    writeFileSync(
      failingLogPath,
      readFileSync(passingLogPath, 'utf8')
        .replace('"decision":"PASS","checks":17', '"decision":"FAIL","checks":17')
        .replace('- payment: not applicable, signer QA, 2026-05-31T19:05:00+08:00', '- payment:')
    );

    const failing = runReleaseLogCheck(failingLogPath);
    assert.equal(failing.status, 1);
    assert.equal(failing.summary.decision, 'FAIL');
    assert.match(failing.summary.failures.join('\n'), /release:gate JSON must have decision PASS/);
    assert.match(failing.summary.failures.join('\n'), /payment manual approval entry must be signed/);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('release log dry-run example is complete and passes verification without real secrets', () => {
  const samplePath = 'docs/release-log-dry-run-example.md';
  assert.ok(existsSync(path.join(rootDir, samplePath)), 'dry-run release log example is missing');

  const sample = readProjectFile(samplePath);
  assert.match(sample, /dry run/i);
  assert.match(sample, /no real secrets/i);

  const result = runReleaseLogCheck(samplePath);
  assert.equal(result.status, 0);
  assert.equal(result.summary.decision, 'PASS');
  assert.equal(result.summary.failures.length, 0);
  assert.ok(result.summary.checks >= 30);
});

test('release dry-run command executes strict production gate and release log verification', () => {
  assert.ok(existsSync(path.join(rootDir, 'scripts/release-dry-run.mjs')), 'release dry-run script is missing');

  const packageJson = JSON.parse(readProjectFile('package.json')) as { scripts: Record<string, string> };
  assert.equal(packageJson.scripts['release:dry-run'], 'node scripts/release-dry-run.mjs');

  const runbook = readProjectFile('docs/release-runbook.md');
  assert.match(runbook, /npm run release:dry-run/);
  assert.match(runbook, /strict production gate/i);

  const result = runReleaseDryRun();
  assert.equal(result.status, 0);
  assert.equal(result.summary.decision, 'PASS');
  assert.equal(result.summary.dryRun, true);
  assert.equal(result.summary.releaseGate.decision, 'PASS');
  assert.equal(result.summary.releaseGate.gateMode, 'production');
  assert.equal(result.summary.releaseGate.failures.length, 0);
  assert.equal(result.summary.releaseLog.decision, 'PASS');
  assert.match(result.summary.releaseLog.checkedFile, /docs\/release-log-dry-run-example\.md$/);
  assert.equal(result.summary.releaseLog.failures.length, 0);
  assert.equal(result.summary.failures.length, 0);
});

test('wechat launch readiness is documented without requiring production credentials for MVP', () => {
  const envExample = readProjectFile('.env.example');
  const deployCheck = readProjectFile('scripts/deploy-check.mjs');
  const runbook = readProjectFile('docs/release-runbook.md');

  for (const required of [
    'WECHAT_OAUTH_APP_ID',
    'WECHAT_OAUTH_APP_SECRET',
    'WECHAT_OAUTH_REDIRECT_URI',
    'WECHAT_OAUTH_CALLBACK_DOMAIN',
    'WECHAT_MINI_PROGRAM_APP_ID',
    'WECHAT_MINI_PROGRAM_APP_SECRET',
    'NEXT_PUBLIC_WECHAT_MINI_PROGRAM_ID',
    'NEXT_PUBLIC_WECHAT_STORE_URL',
    'WECHAT_PAY_APP_ID',
    'WECHAT_PAY_MERCHANT_ID',
  ]) {
    assert.match(envExample, new RegExp(`^${required}=`, 'm'));
    assert.match(deployCheck, new RegExp(required));
  }

  assert.doesNotMatch(
    deployCheck,
    /process\.env\.WECHAT_OAUTH_APP_SECRET/,
    'MVP deploy check should verify the WeChat readiness contract, not require real credentials'
  );

  for (const required of [
    '微信登录上线闸门',
    '微信商城 / 小程序上线闸门',
    'OAuth 主体',
    '回调域名',
    '隐私政策',
    '备案',
    '类目资质',
    '客服',
    '退换货',
    '跨境标准差异',
    '不得启用站内支付',
    '不得自动上架',
    '不得自动发送营销信息',
  ]) {
    assert.match(runbook, new RegExp(required));
  }
});

test('production release gate blocks weak secrets and unapproved live integrations', () => {
  assert.ok(existsSync(path.join(rootDir, 'scripts/release-gate.mjs')), 'release-gate script is missing');

  const packageJson = JSON.parse(readProjectFile('package.json')) as { scripts: Record<string, string> };
  assert.equal(packageJson.scripts['release:gate'], 'node scripts/release-gate.mjs');
  assert.match(packageJson.scripts['release:verify'], /release:gate/);

  const envExample = readProjectFile('.env.example');
  for (const required of [
    'RONGWANG_RELEASE_TARGET=local-preview',
    'ALLOW_WECHAT_LOGIN_PRODUCTION=false',
    'ALLOW_WECHAT_STORE_PRODUCTION=false',
    'ALLOW_PAYMENT_PRODUCTION=false',
    'ALLOW_AUTOMATED_MARKETING_SEND=false',
    'ALLOW_AUTO_LISTING_PUBLISH=false',
  ]) {
    assert.match(envExample, new RegExp(`^${required}$`, 'm'));
  }

  const releaseGate = readProjectFile('scripts/release-gate.mjs');
  for (const required of [
    'NEXT_PUBLIC_SITE_URL must be an https URL for production release',
    'RONGWANG_ADMIN_TOKEN must be at least 32 characters',
    'APP_SECRET must be at least 32 characters',
    'JWT_SECRET must be at least 32 characters',
    'must not use placeholder secret values',
    'must not use low-diversity secret values',
    'APP_SECRET and JWT_SECRET must be different',
    'RONGWANG_ADMIN_TOKEN must not reuse APP_SECRET or JWT_SECRET',
    'RONGWANG_RELEASE_TARGET',
    'ALLOW_WECHAT_LOGIN_PRODUCTION',
    'ALLOW_WECHAT_STORE_PRODUCTION',
    'ALLOW_PAYMENT_PRODUCTION',
    'ALLOW_AUTOMATED_MARKETING_SEND',
    'ALLOW_AUTO_LISTING_PUBLISH',
    'manual approval',
  ]) {
    assert.match(releaseGate, new RegExp(required));
  }

  const runbook = readProjectFile('docs/release-runbook.md');
  for (const required of [
    'npm run release:gate',
    'ALLOW_WECHAT_LOGIN_PRODUCTION',
    'ALLOW_WECHAT_STORE_PRODUCTION',
    'ALLOW_PAYMENT_PRODUCTION',
    'ALLOW_AUTOMATED_MARKETING_SEND',
    'ALLOW_AUTO_LISTING_PUBLISH',
  ]) {
    assert.match(runbook, new RegExp(required));
  }
});

test('release gate executes local and production decisions with explicit JSON mode', () => {
  const localPreview = runReleaseGate({});
  assert.equal(localPreview.status, 0);
  assert.equal(localPreview.summary.decision, 'PASS');
  assert.equal(localPreview.summary.inspectedEnvironment.gateMode, 'local-preview');

  const productionBaseEnv = {
    RONGWANG_RELEASE_TARGET: 'production',
    NEXT_PUBLIC_SITE_URL: 'https://rongwang.hk',
    RONGWANG_ADMIN_TOKEN: 'rwAdm_2026_X7mQ2pL9sV4hN8cT3yB6kR5',
    APP_SECRET: 'rwApp_Z9vL3qR8mT2cH7xP5nK1aD4fG6',
    JWT_SECRET: 'rwJwt_M4pR8tY2vB6nQ9xL3cH7sK5dF1',
    ALLOW_WECHAT_LOGIN_PRODUCTION: 'false',
    ALLOW_WECHAT_STORE_PRODUCTION: 'false',
    ALLOW_PAYMENT_PRODUCTION: 'false',
    ALLOW_AUTOMATED_MARKETING_SEND: 'false',
    ALLOW_AUTO_LISTING_PUBLISH: 'false',
  };

  const productionReady = runReleaseGate(productionBaseEnv);
  assert.equal(productionReady.status, 0);
  assert.equal(productionReady.summary.decision, 'PASS');
  assert.equal(productionReady.summary.inspectedEnvironment.gateMode, 'production');

  const weakSecrets = runReleaseGate({
    ...productionBaseEnv,
    RONGWANG_ADMIN_TOKEN: 'placeholder-secret-placeholder-secret',
    APP_SECRET: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    JWT_SECRET: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  });
  assert.equal(weakSecrets.status, 1);
  assert.equal(weakSecrets.summary.decision, 'FAIL');
  assert.match(weakSecrets.summary.failures.join('\n'), /placeholder secret values/);
  assert.match(weakSecrets.summary.failures.join('\n'), /low-diversity secret values/);
  assert.match(weakSecrets.summary.failures.join('\n'), /APP_SECRET and JWT_SECRET must be different/);

  const unsafeWechatOpen = runReleaseGate({
    ...productionBaseEnv,
    ALLOW_WECHAT_LOGIN_PRODUCTION: 'true',
  });
  assert.equal(unsafeWechatOpen.status, 1);
  assert.equal(unsafeWechatOpen.summary.decision, 'FAIL');
  assert.ok(unsafeWechatOpen.summary.failures.includes('ALLOW_WECHAT_LOGIN_PRODUCTION must remain false until manual approval'));
});

test('latest price sheet compliance notes avoid public risky terms', () => {
  const latestPriceProducts = readProjectFile('src/data/latest-price-products.ts');

  for (const riskyTerm of ['治疗', '治愈', '保证见效', '医生推荐', '临床证明', '降三高']) {
    assert.doesNotMatch(latestPriceProducts, new RegExp(riskyTerm));
  }
});
