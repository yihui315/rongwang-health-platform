const checks = [];

function addCheck(name, ok, detail = '') {
  checks.push({ name, ok: Boolean(ok), detail });
}

function env(name) {
  return process.env[name] || '';
}

function hasMinimumLength(name, minLength) {
  const value = env(name);
  return value.length >= minLength;
}

function isExplicitlyFalse(name) {
  return env(name).toLowerCase() === 'false';
}

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

const siteUrl = env('NEXT_PUBLIC_SITE_URL');
const releaseTarget = env('RONGWANG_RELEASE_TARGET') || env('RELEASE_TARGET');
const productionGateEnabled = releaseTarget === 'production';

if (!productionGateEnabled) {
  console.log(
    'PASS production release gate is in local preview mode - set RONGWANG_RELEASE_TARGET=production for strict production checks'
  );
}

addCheck(
  'NEXT_PUBLIC_SITE_URL must be an https URL for production release',
  !productionGateEnabled || isHttpsUrl(siteUrl),
  'set NEXT_PUBLIC_SITE_URL=https://rongwang.hk before release'
);

addCheck(
  'RONGWANG_ADMIN_TOKEN must be at least 32 characters',
  !productionGateEnabled || hasMinimumLength('RONGWANG_ADMIN_TOKEN', 32),
  'use a private random token, not a smoke-test value'
);

addCheck(
  'APP_SECRET must be at least 32 characters',
  !productionGateEnabled || hasMinimumLength('APP_SECRET', 32),
  'store only in the production secret manager'
);

addCheck(
  'JWT_SECRET must be at least 32 characters',
  !productionGateEnabled || hasMinimumLength('JWT_SECRET', 32),
  'store only in the production secret manager'
);

for (const key of [
  'ALLOW_WECHAT_LOGIN_PRODUCTION',
  'ALLOW_WECHAT_STORE_PRODUCTION',
  'ALLOW_PAYMENT_PRODUCTION',
  'ALLOW_AUTOMATED_MARKETING_SEND',
  'ALLOW_AUTO_LISTING_PUBLISH',
]) {
  addCheck(
    `${key} must remain false until manual approval`,
    !productionGateEnabled || isExplicitlyFalse(key),
    'manual approval required'
  );
}

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
      inspectedEnvironment: {
        siteUrl,
        releaseTarget: productionGateEnabled ? 'production' : 'local-preview',
        productionIntegrationsRequireManualApproval: true,
      },
    },
    null,
    2
  )
);

if (failures.length > 0) {
  process.exit(1);
}
