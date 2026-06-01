import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { evaluateOutboundSendGate } from '../src/lib/automation/outbound-queue';
import { resolveDataBackend, sensitiveHealthRetentionDays } from '../src/lib/data/data-backend';

const rootDir = process.cwd();

function readProjectFile(relativePath: string): string {
  return readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function parseJsonSummary(stdout: string, stderr: string) {
  const output = `${stdout}\n${stderr}`;
  const jsonStart = output.lastIndexOf('\n{');
  const jsonText = jsonStart === -1 ? output.trim() : output.slice(jsonStart + 1).trim();
  return JSON.parse(jsonText) as {
    decision: 'PASS' | 'FAIL';
    mode: 'offline' | 'postgres';
    checkedTables: string[];
    failures: string[];
  };
}

test('assessment automation schema and environment contract are explicit', () => {
  const schema = readProjectFile('database/schema.sql');
  const envExample = readProjectFile('.env.example');
  const packageJson = JSON.parse(readProjectFile('package.json')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  for (const table of [
    'leads',
    'consent_records',
    'health_reports',
    'marketing_plans',
    'outbound_queue',
    'send_events',
    'audit_events',
  ]) {
    assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }

  assert.match(schema, /retention_expires_at TIMESTAMP/);
  assert.match(schema, /gate_snapshot JSONB/);
  assert.match(schema, /stop_contact_requested BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(envExample, /^RONGWANG_DATA_BACKEND=json$/m);
  assert.match(envExample, /^SENSITIVE_HEALTH_RETENTION_DAYS=180$/m);
  assert.ok(packageJson.dependencies?.pg);
  assert.ok(packageJson.devDependencies?.['@types/pg']);
});

test('postgres schema check is wired for release verification', () => {
  const packageJson = JSON.parse(readProjectFile('package.json')) as {
    scripts?: Record<string, string>;
  };

  assert.equal(packageJson.scripts?.['db:schema-check'], 'node scripts/postgres-schema-check.mjs');
  assert.match(packageJson.scripts?.['release:verify'] || '', /db:schema-check/);

  const result = spawnSync(process.execPath, ['scripts/postgres-schema-check.mjs'], {
    cwd: rootDir,
    env: {
      ...process.env,
      RUN_POSTGRES_SCHEMA_CHECK: 'false',
      DATABASE_URL: '',
    },
    encoding: 'utf8',
  });
  const summary = parseJsonSummary(result.stdout, result.stderr);

  assert.equal(result.status, 0);
  assert.equal(summary.decision, 'PASS');
  assert.equal(summary.mode, 'offline');
  for (const table of ['leads', 'consent_records', 'health_reports', 'marketing_plans', 'outbound_queue']) {
    assert.ok(summary.checkedTables.includes(table));
  }
  assert.deepEqual(summary.failures, []);
});

test('postgres assessment smoke is explicit and safe by default', () => {
  const packageJson = JSON.parse(readProjectFile('package.json')) as {
    scripts?: Record<string, string>;
  };

  assert.equal(packageJson.scripts?.['db:postgres-smoke'], 'tsx scripts/postgres-assessment-smoke.mjs');

  const result = spawnSync(process.execPath, ['scripts/postgres-assessment-smoke.mjs'], {
    cwd: rootDir,
    env: {
      ...process.env,
      RUN_POSTGRES_ASSESSMENT_SMOKE: 'false',
      DATABASE_URL: '',
    },
    encoding: 'utf8',
  });
  const summary = JSON.parse(result.stdout.trim()) as {
    decision: 'PASS' | 'SKIP' | 'FAIL';
    mode: 'skipped' | 'postgres';
    failures: string[];
    nextStep: string;
  };

  assert.equal(result.status, 0);
  assert.equal(summary.decision, 'SKIP');
  assert.equal(summary.mode, 'skipped');
  assert.deepEqual(summary.failures, []);
  assert.match(summary.nextStep, /RUN_POSTGRES_ASSESSMENT_SMOKE=true/);
});

test('postgres smoke cleanup requires explicit destructive confirmation', () => {
  const packageJson = JSON.parse(readProjectFile('package.json')) as {
    scripts?: Record<string, string>;
  };

  assert.equal(packageJson.scripts?.['db:postgres-smoke-cleanup'], 'node scripts/postgres-smoke-cleanup.mjs');

  const result = spawnSync(process.execPath, ['scripts/postgres-smoke-cleanup.mjs'], {
    cwd: rootDir,
    env: {
      ...process.env,
      RUN_POSTGRES_SMOKE_CLEANUP: 'false',
      CONFIRM_POSTGRES_SMOKE_CLEANUP: '',
      DATABASE_URL: '',
    },
    encoding: 'utf8',
  });
  const summary = JSON.parse(result.stdout.trim()) as {
    decision: 'SKIP' | 'PASS' | 'FAIL';
    mode: 'skipped' | 'postgres';
    destructive: boolean;
    failures: string[];
    nextStep: string;
  };

  assert.equal(result.status, 0);
  assert.equal(summary.decision, 'SKIP');
  assert.equal(summary.mode, 'skipped');
  assert.equal(summary.destructive, false);
  assert.deepEqual(summary.failures, []);
  assert.match(summary.nextStep, /CONFIRM_POSTGRES_SMOKE_CLEANUP=delete-smoke-records/);
});

test('lead capture API uses the configured assessment data backend', () => {
  const routeSource = readProjectFile('app/api/leads/route.ts');
  const assessmentStoreSource = readProjectFile('src/lib/assessment/assessment-store.ts');

  assert.match(routeSource, /@\/src\/lib\/assessment\/assessment-store/);
  assert.doesNotMatch(routeSource, /import \{ createLead, listLeads[^}]*\} from '@\/src\/lib\/contact\/lead-store'/);
  assert.match(routeSource, /await createLead/);
  assert.match(routeSource, /await listLeads/);
  assert.doesNotMatch(assessmentStoreSource, /const lead = createJsonLead\(input\)/);
  assert.match(assessmentStoreSource, /buildStoredLead/);
  assert.match(assessmentStoreSource, /const lead = buildStoredLead\(input/);
});

test('data backend selection is explicit and defaults to local JSON in tests', () => {
  assert.equal(resolveDataBackend({ NODE_ENV: 'test' }), 'json');
  assert.equal(resolveDataBackend({ RONGWANG_DATA_BACKEND: 'json' }), 'json');
  assert.equal(resolveDataBackend({ RONGWANG_DATA_BACKEND: 'postgres' }), 'postgres');
  assert.throws(() => resolveDataBackend({ RONGWANG_DATA_BACKEND: 'sqlite' }), /RONGWANG_DATA_BACKEND/);
  assert.equal(sensitiveHealthRetentionDays({}), 180);
  assert.equal(sensitiveHealthRetentionDays({ SENSITIVE_HEALTH_RETENTION_DAYS: '15' }), 15);
  assert.throws(() => sensitiveHealthRetentionDays({ SENSITIVE_HEALTH_RETENTION_DAYS: '0' }), /retention/i);
});

test('outbound queue keeps real WeChat sending blocked until every gate passes', () => {
  const baseInput = {
    channel: 'wechat_private' as const,
    reportStatus: 'approved' as const,
    planStatus: 'approved' as const,
    riskLevel: 'medium' as const,
    messageIntent: 'education' as const,
    consent: {
      privacyAccepted: true,
      termsAccepted: true,
      sensitiveHealthDataAccepted: true,
      marketingContactAccepted: true,
      stopContactRequested: false,
    },
    env: {
      ALLOW_AUTOMATED_MARKETING_SEND: 'false',
      WECHAT_PRIVATE_SEND_PROVIDER: 'manual-wechat-bridge',
    },
  };

  const defaultBlocked = evaluateOutboundSendGate(baseInput);
  assert.equal(defaultBlocked.allowed, false);
  assert.ok(defaultBlocked.reasons.includes('automated_marketing_disabled'));
  assert.equal(defaultBlocked.gateSnapshot.autoSendEnabled, false);

  const missingConsent = evaluateOutboundSendGate({
    ...baseInput,
    env: {
      ALLOW_AUTOMATED_MARKETING_SEND: 'true',
      WECHAT_PRIVATE_SEND_PROVIDER: 'manual-wechat-bridge',
    },
    consent: {
      ...baseInput.consent,
      marketingContactAccepted: false,
    },
  });
  assert.equal(missingConsent.allowed, false);
  assert.ok(missingConsent.reasons.includes('marketing_contact_consent_missing'));

  const highRiskPromotion = evaluateOutboundSendGate({
    ...baseInput,
    riskLevel: 'high',
    messageIntent: 'promotion',
    env: {
      ALLOW_AUTOMATED_MARKETING_SEND: 'true',
      WECHAT_PRIVATE_SEND_PROVIDER: 'manual-wechat-bridge',
    },
  });
  assert.equal(highRiskPromotion.allowed, false);
  assert.ok(highRiskPromotion.reasons.includes('high_risk_promotion_blocked'));

  const allowed = evaluateOutboundSendGate({
    ...baseInput,
    env: {
      ALLOW_AUTOMATED_MARKETING_SEND: 'true',
      WECHAT_PRIVATE_SEND_PROVIDER: 'manual-wechat-bridge',
    },
  });
  assert.equal(allowed.allowed, true);
  assert.deepEqual(allowed.reasons, []);
  assert.equal(allowed.gateSnapshot.providerConfigured, true);
});
