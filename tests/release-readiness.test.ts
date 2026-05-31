import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const rootDir = process.cwd();

function readProjectFile(relativePath: string): string {
  return readFileSync(path.join(rootDir, relativePath), 'utf8');
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

test('latest price sheet compliance notes avoid public risky terms', () => {
  const latestPriceProducts = readProjectFile('src/data/latest-price-products.ts');

  for (const riskyTerm of ['治疗', '治愈', '保证见效', '医生推荐', '临床证明', '降三高']) {
    assert.doesNotMatch(latestPriceProducts, new RegExp(riskyTerm));
  }
});
