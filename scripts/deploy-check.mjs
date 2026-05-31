import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const rootDir = process.cwd();

const checks = [];

function readProjectFile(relativePath) {
  return readFileSync(resolve(rootDir, relativePath), 'utf8');
}

function addCheck(name, ok, detail = '') {
  checks.push({ name, ok: Boolean(ok), detail });
}

function fileContains(relativePath, patterns) {
  if (!existsSync(resolve(rootDir, relativePath))) return false;
  const text = readProjectFile(relativePath);
  return patterns.every((pattern) => pattern.test(text));
}

const requiredRuntimeEnv = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SITE_URL',
  'APP_SECRET',
  'JWT_SECRET',
  'RONGWANG_ADMIN_TOKEN',
  'NEXT_PUBLIC_WHATSAPP_CONTACT',
];

const optionalWeChatLaunchEnv = [
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
];

const envExample = readProjectFile('.env.example');
for (const key of requiredRuntimeEnv) {
  addCheck(`env contract includes ${key}`, new RegExp(`^${key}=`, 'm').test(envExample));
}

for (const key of optionalWeChatLaunchEnv) {
  addCheck(`wechat readiness env contract includes ${key}`, new RegExp(`^${key}=`, 'm').test(envExample));
}

addCheck('release runbook exists', existsSync(resolve(rootDir, 'docs/release-runbook.md')));
addCheck('ops monitoring doc exists', existsSync(resolve(rootDir, 'docs/ops-monitoring.md')));
addCheck('smoke script exists', existsSync(resolve(rootDir, 'scripts/smoke-fast-funnel.mjs')));
addCheck('acceptance script exists', existsSync(resolve(rootDir, 'scripts/acceptance-fast-funnel.mjs')));
addCheck('customer journey smoke script exists', existsSync(resolve(rootDir, 'scripts/customer-journey-smoke.mjs')));
addCheck('compliance scan exists', existsSync(resolve(rootDir, 'scripts/compliance-scan.mjs')));

const packageJson = JSON.parse(readProjectFile('package.json'));
addCheck('release:verify script is wired', /deploy:check/.test(packageJson.scripts?.['release:verify'] || ''));
addCheck('release:smoke script is wired', /acceptance/.test(packageJson.scripts?.['release:smoke'] || ''));
addCheck('customer:smoke script is wired into release:smoke', /customer:smoke/.test(packageJson.scripts?.['release:smoke'] || ''));

const protectedProductionPaths = ['/workspace', '/api/mock'];

addCheck(
  `workspace and mutating mock APIs are protected: ${protectedProductionPaths.join(', ')}`,
  protectedProductionPaths.every((pathname) => readProjectFile('proxy.ts').includes(pathname)) &&
    fileContains('proxy.ts', [/export function proxy/, /Admin authorization required/])
);

addCheck(
  'RONGWANG_ADMIN_TOKEN must be set before production release',
  Boolean(process.env.RONGWANG_ADMIN_TOKEN),
  'RONGWANG_ADMIN_TOKEN must be set to a strong private value in production'
);

addCheck(
  'admin route guard supports cookie and token headers',
  fileContains('src/lib/auth/admin-guard.ts', [/RONGWANG_ADMIN_TOKEN/, /x-admin-token/, /rongwang_admin_token/])
);

addCheck(
  'marketing automation stays draft only',
  fileContains('src/agents/run-campaigns.ts', [/draft_only/, /manual_approval_required/, /不会自动发送/])
);

addCheck(
  'compliance scan keeps health copy boundaries',
  fileContains('scripts/compliance-scan.mjs', [/治疗/, /治愈/, /降三高/])
);

addCheck(
  'release runbook documents rollback and backup',
  fileContains('docs/release-runbook.md', [/production branch/i, /rollback/i, /backup/i, /git archive/])
);

addCheck(
  'release runbook documents WeChat launch gates',
  fileContains('docs/release-runbook.md', [
    /微信登录上线闸门/,
    /微信商城 \/ 小程序上线闸门/,
    /不得启用站内支付/,
    /不得自动上架/,
    /不得自动发送营销信息/,
  ])
);

const failures = checks.filter((check) => !check.ok);
for (const check of checks) {
  const detail = check.detail ? ` - ${check.detail}` : '';
  console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name}${detail}`);
}

console.log(
  JSON.stringify(
    {
      decision: failures.length === 0 ? 'PASS' : 'FAIL',
      checks: checks.length,
      failures: failures.map((check) => check.name),
      nextVerification: [
        'npm run release:verify',
        'RONGWANG_ADMIN_TOKEN=<token> SMOKE_BASE_URL=<url> npm run release:smoke',
      ],
      inspectedFrom: relative(rootDir, rootDir) || '.',
    },
    null,
    2
  )
);

if (failures.length > 0) {
  process.exit(1);
}
