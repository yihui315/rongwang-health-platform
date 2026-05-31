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

function hasPlaceholderSecretValue(name) {
  const value = env(name).toLowerCase();
  return [
    'changeme',
    'change-me',
    'example',
    'placeholder',
    'secret',
    'password',
    'test',
    'verify-local-token',
    '0123456789abcdef',
    'abcdef0123456789',
  ].some((placeholder) => value.includes(placeholder));
}

function hasLowDiversitySecretValue(name) {
  const value = env(name);
  const uniqueCharacters = new Set(value).size;
  const repeatedRun = /(.)\1{7,}/.test(value);
  return uniqueCharacters < 12 || repeatedRun;
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

for (const key of ['RONGWANG_ADMIN_TOKEN', 'APP_SECRET', 'JWT_SECRET']) {
  addCheck(
    `${key} must not use placeholder secret values`,
    !productionGateEnabled || !hasPlaceholderSecretValue(key),
    'generate a fresh private value for production'
  );

  addCheck(
    `${key} must not use low-diversity secret values`,
    !productionGateEnabled || !hasLowDiversitySecretValue(key),
    'avoid repeated or predictable strings'
  );
}

addCheck(
  'APP_SECRET and JWT_SECRET must be different',
  !productionGateEnabled || env('APP_SECRET') !== env('JWT_SECRET'),
  'use separate production secrets'
);

addCheck(
  'RONGWANG_ADMIN_TOKEN must not reuse APP_SECRET or JWT_SECRET',
  !productionGateEnabled ||
    (env('RONGWANG_ADMIN_TOKEN') !== env('APP_SECRET') && env('RONGWANG_ADMIN_TOKEN') !== env('JWT_SECRET')),
  'admin token must be dedicated to admin access'
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
