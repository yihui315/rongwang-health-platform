import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const releaseLogPath = process.env.RELEASE_LOG_PATH || process.argv[2] || 'docs/release-log-template.md';
const checkedFile = resolve(process.cwd(), releaseLogPath);
const failures = [];
const checks = [];

function addCheck(name, ok, detail = '') {
  checks.push({ name, ok: Boolean(ok), detail });
  if (!ok) failures.push(detail || name);
}

function lineValue(text, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^- ${escapedLabel}:[ \\t]*([^\\n]*)$`, 'm'));
  return match?.[1]?.trim() || '';
}

function isFilled(value) {
  return Boolean(value) && !/^(-|todo|tbd|待填|待确认)$/i.test(value);
}

function isConfirmed(value) {
  return /confirmed|approved|not needed|not applicable|completed|pass|已确认|已同意|不适用|无需|通过/i.test(value);
}

function isSigned(value) {
  return /(approved|rejected|not applicable)/i.test(value) && /signer\s+[^,\n]+/i.test(value) && /\d{4}-\d{2}-\d{2}/.test(value);
}

function extractJsonAfterHeading(text, heading) {
  const headingIndex = text.indexOf(heading);
  if (headingIndex === -1) return null;

  const afterHeading = text.slice(headingIndex + heading.length);
  const match = afterHeading.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function hasEmptyFailures(summary) {
  return Array.isArray(summary?.failures) && summary.failures.length === 0;
}

if (!existsSync(checkedFile)) {
  failures.push(`Release log file not found: ${checkedFile}`);
} else {
  const text = readFileSync(checkedFile, 'utf8');

  for (const label of [
    'Release commit',
    'Release branch',
    'Release timestamp',
    'Operator',
    'Reviewer',
    'Target site',
    'Release package path',
    'Previous release id',
  ]) {
    const value = lineValue(text, label);
    addCheck(`${label} is filled`, isFilled(value), `${label} must be filled`);
  }

  for (const label of [
    '`RONGWANG_RELEASE_TARGET=production`',
    '`NEXT_PUBLIC_SITE_URL=https://rongwang.hk`',
    '`RONGWANG_ADMIN_TOKEN` stored in secret manager, not in this log',
    '`APP_SECRET` stored in secret manager, not in this log',
    '`JWT_SECRET` stored in secret manager, not in this log',
    '`ALLOW_WECHAT_LOGIN_PRODUCTION=false`',
    '`ALLOW_WECHAT_STORE_PRODUCTION=false`',
    '`ALLOW_PAYMENT_PRODUCTION=false`',
    '`ALLOW_AUTOMATED_MARKETING_SEND=false`',
    '`ALLOW_AUTO_LISTING_PUBLISH=false`',
  ]) {
    const value = lineValue(text, label);
    addCheck(`${label} is confirmed`, isConfirmed(value), `${label} must be confirmed`);
  }

  const deployCheck = extractJsonAfterHeading(text, '### `deploy:check JSON`');
  addCheck('deploy:check JSON exists', Boolean(deployCheck), 'deploy:check JSON must be present and valid JSON');
  addCheck('deploy:check JSON decision PASS', deployCheck?.decision === 'PASS', 'deploy:check JSON must have decision PASS');
  addCheck('deploy:check JSON gateMode ready', deployCheck?.gateMode === 'ready', 'deploy:check JSON must have gateMode ready');
  addCheck('deploy:check JSON failures empty', hasEmptyFailures(deployCheck), 'deploy:check JSON failures must be empty');

  const releaseGate = extractJsonAfterHeading(text, '### `release:gate JSON`');
  addCheck('release:gate JSON exists', Boolean(releaseGate), 'release:gate JSON must be present and valid JSON');
  addCheck('release:gate JSON decision PASS', releaseGate?.decision === 'PASS', 'release:gate JSON must have decision PASS');
  addCheck(
    'release:gate JSON production mode',
    releaseGate?.inspectedEnvironment?.gateMode === 'production',
    'release:gate JSON must have inspectedEnvironment.gateMode production'
  );
  addCheck('release:gate JSON failures empty', hasEmptyFailures(releaseGate), 'release:gate JSON failures must be empty');

  const complianceScan = extractJsonAfterHeading(text, '### `compliance:scan JSON`');
  addCheck('compliance:scan JSON exists', Boolean(complianceScan), 'compliance:scan JSON must be present and valid JSON');
  addCheck('compliance:scan JSON decision PASS', complianceScan?.decision === 'PASS', 'compliance:scan JSON must have decision PASS');
  addCheck(
    'compliance:scan JSON scanned files',
    Number(complianceScan?.scannedFiles || 0) > 0,
    'compliance:scan JSON must include scannedFiles greater than zero'
  );

  for (const label of [
    'WeChat login',
    'WeChat store',
    'mini program',
    'payment',
    'automated marketing send',
    'auto listing publish',
    'health report approval',
    'marketing draft approval',
    'product copy publication',
    'channel listing publication',
  ]) {
    const value = lineValue(text, label);
    addCheck(`${label} manual approval signed`, isSigned(value), `${label} manual approval entry must be signed`);
  }

  for (const label of [
    'Product pages preserve `本品不能替代药物`',
    'Cross-border pages preserve `本商品符合原产国标准` and the standard-difference notice',
    'AI health reports remain `pending_manual_review` when risk is elevated',
    'Marketing workflows remain `draft_only` and `manual_approval_required`',
    'No treatment, cure, guaranteed-effect, or disease claim was introduced',
  ]) {
    const value = lineValue(text, label);
    addCheck(`${label} confirmed`, isConfirmed(value), `${label} must be confirmed`);
  }

  const fastFunnel = extractJsonAfterHeading(text, '### `release:smoke JSON` fast funnel');
  addCheck('fast funnel smoke JSON exists', Boolean(fastFunnel), 'release:smoke fast funnel JSON must be present and valid JSON');
  addCheck('fast funnel smoke decision PASS', fastFunnel?.decision === 'PASS', 'release:smoke fast funnel JSON must have decision PASS');
  addCheck('fast funnel smokeMode', fastFunnel?.smokeMode === 'fast-funnel', 'release:smoke fast funnel JSON must have smokeMode fast-funnel');
  addCheck('fast funnel failures empty', hasEmptyFailures(fastFunnel), 'release:smoke fast funnel failures must be empty');

  const acceptance = extractJsonAfterHeading(text, '### `release:smoke JSON` acceptance');
  addCheck('acceptance smoke JSON exists', Boolean(acceptance), 'release:smoke acceptance JSON must be present and valid JSON');
  addCheck('acceptance smoke decision PASS', acceptance?.decision === 'PASS', 'release:smoke acceptance JSON must have decision PASS');
  addCheck(
    'acceptance smoke scenario count',
    Number(acceptance?.homepageScenarioCardsCount || 0) >= 8,
    'release:smoke acceptance JSON must have homepageScenarioCardsCount at least 8'
  );
  addCheck(
    'acceptance smoke product count',
    Number(acceptance?.productCardsFound || 0) >= 4,
    'release:smoke acceptance JSON must have productCardsFound at least 4'
  );
  addCheck(
    'acceptance tracking hook',
    acceptance?.trackingHookDetected === true,
    'release:smoke acceptance JSON must have trackingHookDetected true'
  );
  addCheck('acceptance failures empty', hasEmptyFailures(acceptance), 'release:smoke acceptance failures must be empty');

  const customerSmoke = extractJsonAfterHeading(text, '### `customer:smoke JSON`');
  addCheck('customer smoke JSON exists', Boolean(customerSmoke), 'customer:smoke JSON must be present and valid JSON');
  addCheck('customer smoke decision PASS', customerSmoke?.decision === 'PASS', 'customer:smoke JSON must have decision PASS');
  addCheck('customer smokeMode', customerSmoke?.smokeMode === 'customer-journey', 'customer:smoke JSON must have smokeMode customer-journey');
  addCheck('customer smoke failures empty', hasEmptyFailures(customerSmoke), 'customer:smoke failures must be empty');

  for (const label of [
    'Home page loads',
    '`/products` loads approved products only',
    '`/ai-consult` accepts a test consultation into manual review',
    '`/workspace` redirects unauthorized users to login',
    '`/workspace` is reachable after admin login',
    '`/compliance` shows required statements',
    '`/api/mock/*` write routes reject unauthorized requests',
  ]) {
    const value = lineValue(text, label);
    addCheck(`${label} confirmed`, isConfirmed(value), `${label} must be confirmed`);
  }

  for (const label of [
    'Rollback decision',
    'Rollback trigger if any',
    'Previous release id used',
    'Rollback operator',
    'Recovery smoke command',
    'Recovery smoke result',
  ]) {
    const value = lineValue(text, label);
    addCheck(`${label} filled`, isFilled(value), `${label} must be filled`);
  }
}

console.log(
  JSON.stringify(
    {
      decision: failures.length === 0 ? 'PASS' : 'FAIL',
      checkedFile,
      checks: checks.length,
      failures,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  process.exit(1);
}
