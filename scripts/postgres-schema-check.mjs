import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

const rootDir = process.cwd();
const schemaPath = resolve(rootDir, 'database/schema.sql');
const schemaSql = readFileSync(schemaPath, 'utf8');
const checks = [];

const requiredTables = [
  'leads',
  'consent_records',
  'health_reports',
  'marketing_plans',
  'outbound_queue',
  'send_events',
  'audit_events',
];

const requiredSchemaPatterns = [
  { name: 'sensitive retention columns exist', pattern: /retention_expires_at TIMESTAMP NOT NULL/ },
  { name: 'lead stop contact flag exists', pattern: /stop_contact_requested BOOLEAN NOT NULL DEFAULT FALSE/ },
  { name: 'outbound queue gate snapshot exists', pattern: /gate_snapshot JSONB DEFAULT '\{\}'::jsonb/ },
  { name: 'outbound queue blocked reasons exist', pattern: /blocked_reasons JSONB DEFAULT '\[\]'::jsonb/ },
  { name: 'marketing review history exists', pattern: /review_history JSONB DEFAULT '\[\]'::jsonb/ },
  { name: 'leads source index exists', pattern: /idx_leads_source_created_at/ },
  { name: 'outbound queue status index exists', pattern: /idx_outbound_queue_status_channel/ },
];

function addCheck(name, ok, detail = '') {
  checks.push({ name, ok: Boolean(ok), detail });
}

function shouldRunPostgresCheck() {
  return process.env.RUN_POSTGRES_SCHEMA_CHECK?.toLowerCase() === 'true';
}

function printSummary(extra = {}) {
  const failures = checks.filter((check) => !check.ok);
  for (const check of checks) {
    const detail = check.detail ? ` - ${check.detail}` : '';
    console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name}${detail}`);
  }

  console.log(
    JSON.stringify(
      {
        decision: failures.length === 0 ? 'PASS' : 'FAIL',
        mode: shouldRunPostgresCheck() ? 'postgres' : 'offline',
        checkedTables: requiredTables,
        checks: checks.length,
        failures: failures.map((check) => check.name),
        ...extra,
      },
      null,
      2
    )
  );

  if (failures.length > 0) {
    process.exit(1);
  }
}

for (const table of requiredTables) {
  addCheck(`schema creates ${table}`, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`).test(schemaSql));
}

for (const { name, pattern } of requiredSchemaPatterns) {
  addCheck(name, pattern.test(schemaSql));
}

if (!shouldRunPostgresCheck()) {
  printSummary({
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL?.trim()),
    nextStep: 'Set RUN_POSTGRES_SCHEMA_CHECK=true with DATABASE_URL to execute schema against Postgres.',
  });
  process.exit(0);
}

if (!process.env.DATABASE_URL?.trim()) {
  addCheck('DATABASE_URL is configured for postgres schema execution', false, 'set DATABASE_URL before RUN_POSTGRES_SCHEMA_CHECK=true');
  printSummary({ databaseUrlConfigured: false });
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  await pool.query(schemaSql);
  const tableResult = await pool.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1)
      ORDER BY table_name
    `,
    [requiredTables]
  );
  const presentTables = new Set(tableResult.rows.map((row) => String(row.table_name)));

  for (const table of requiredTables) {
    addCheck(`postgres table exists: ${table}`, presentTables.has(table));
  }

  printSummary({
    databaseUrlConfigured: true,
    verifiedTables: [...presentTables],
  });
} catch (error) {
  addCheck('postgres schema execution succeeds', false, error instanceof Error ? error.message : 'unknown error');
  printSummary({
    databaseUrlConfigured: true,
  });
} finally {
  await pool.end();
}
