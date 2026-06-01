import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const dryRunReleaseLogPath = 'docs/release-log-dry-run-example.md';

function makeSecret(prefix) {
  return `${prefix}_${randomBytes(24).toString('base64url')}`;
}

function parseJsonSummary(output) {
  const jsonStart = output.lastIndexOf('\n{');
  const jsonText = jsonStart === -1 ? output.trim() : output.slice(jsonStart + 1).trim();
  return JSON.parse(jsonText);
}

function runNodeScript(scriptPath, env) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    env,
    encoding: 'utf8',
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  return {
    status: result.status ?? 1,
    summary: parseJsonSummary(`${result.stdout}\n${result.stderr}`),
  };
}

const dryRunEnv = {
  ...process.env,
  RONGWANG_RELEASE_TARGET: 'production',
  RONGWANG_DATA_BACKEND: 'postgres',
  NEXT_PUBLIC_SITE_URL: 'https://rongwang.hk',
  RONGWANG_ADMIN_TOKEN: makeSecret('rwAdmDryRun'),
  APP_SECRET: makeSecret('rwAppDryRun'),
  JWT_SECRET: makeSecret('rwJwtDryRun'),
  ALLOW_WECHAT_LOGIN_PRODUCTION: 'false',
  ALLOW_WECHAT_STORE_PRODUCTION: 'false',
  ALLOW_PAYMENT_PRODUCTION: 'false',
  ALLOW_AUTOMATED_MARKETING_SEND: 'false',
  ALLOW_AUTO_LISTING_PUBLISH: 'false',
};

console.log('Running strict production release gate with dry-run secrets. Secrets are generated in memory only.');
const releaseGate = runNodeScript('scripts/release-gate.mjs', dryRunEnv);

console.log(`Running release log verification for ${dryRunReleaseLogPath}.`);
const releaseLog = runNodeScript('scripts/release-log-check.mjs', {
  ...process.env,
  RELEASE_LOG_PATH: dryRunReleaseLogPath,
});

const failures = [];
if (releaseGate.status !== 0 || releaseGate.summary.decision !== 'PASS') {
  failures.push('strict production release gate failed');
}
if (releaseGate.summary.inspectedEnvironment?.gateMode !== 'production') {
  failures.push('strict production release gate did not run in production mode');
}
if (releaseLog.status !== 0 || releaseLog.summary.decision !== 'PASS') {
  failures.push('release log dry-run example verification failed');
}

console.log(
  JSON.stringify(
    {
      decision: failures.length === 0 ? 'PASS' : 'FAIL',
      dryRun: true,
      releaseGate: {
        decision: releaseGate.summary.decision,
        gateMode: releaseGate.summary.inspectedEnvironment?.gateMode,
        checks: releaseGate.summary.checks,
        failures: releaseGate.summary.failures || [],
      },
      releaseLog: {
        decision: releaseLog.summary.decision,
        checkedFile: releaseLog.summary.checkedFile || resolve(process.cwd(), dryRunReleaseLogPath),
        checks: releaseLog.summary.checks,
        failures: releaseLog.summary.failures || [],
      },
      failures,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  process.exit(1);
}
