import pg from 'pg';

const smokeSource = 'customer_journey_smoke';
const smokeContactPrefix = 'postgres-smoke-';
const smokeConsentVersion = 'postgres-smoke-2026-06';
const confirmationPhrase = 'delete-smoke-records';

function shouldRunCleanup() {
  return process.env.RUN_POSTGRES_SMOKE_CLEANUP?.toLowerCase() === 'true';
}

function hasDestructiveConfirmation() {
  return process.env.CONFIRM_POSTGRES_SMOKE_CLEANUP === confirmationPhrase;
}

function printSummary(summary) {
  console.log(JSON.stringify(summary, null, 2));
}

if (!shouldRunCleanup()) {
  printSummary({
    decision: 'SKIP',
    mode: 'skipped',
    destructive: false,
    checks: 0,
    deleted: {},
    failures: [],
    nextStep:
      'Set RUN_POSTGRES_SMOKE_CLEANUP=true and CONFIRM_POSTGRES_SMOKE_CLEANUP=delete-smoke-records with DATABASE_URL to delete Postgres smoke records.',
  });
  process.exit(0);
}

if (!hasDestructiveConfirmation()) {
  printSummary({
    decision: 'FAIL',
    mode: 'postgres',
    destructive: false,
    checks: 0,
    deleted: {},
    failures: [`CONFIRM_POSTGRES_SMOKE_CLEANUP must equal ${confirmationPhrase}`],
  });
  process.exit(1);
}

if (!process.env.DATABASE_URL?.trim()) {
  printSummary({
    decision: 'FAIL',
    mode: 'postgres',
    destructive: false,
    checks: 0,
    deleted: {},
    failures: ['DATABASE_URL is required when RUN_POSTGRES_SMOKE_CLEANUP=true'],
  });
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const deleted = {};
const failures = [];

try {
  const leadIdsResult = await pool.query(
    `
      SELECT DISTINCT l.id
      FROM leads l
      LEFT JOIN consent_records c ON c.lead_id = l.id
      WHERE l.source = $1
        AND l.contact LIKE $2
        AND (c.version = $3 OR c.version IS NULL)
    `,
    [smokeSource, `${smokeContactPrefix}%`, smokeConsentVersion]
  );
  const leadIds = leadIdsResult.rows.map((row) => String(row.id));

  if (leadIds.length > 0) {
    const outbound = await pool.query(
      'DELETE FROM outbound_queue WHERE lead_id = ANY($1::text[]) RETURNING id',
      [leadIds]
    );
    deleted.outbound_queue = outbound.rowCount ?? 0;

    const plans = await pool.query('DELETE FROM marketing_plans WHERE lead_id = ANY($1::text[]) RETURNING id', [leadIds]);
    deleted.marketing_plans = plans.rowCount ?? 0;

    const reports = await pool.query('DELETE FROM health_reports WHERE lead_id = ANY($1::text[]) RETURNING id', [leadIds]);
    deleted.health_reports = reports.rowCount ?? 0;

    const consent = await pool.query('DELETE FROM consent_records WHERE lead_id = ANY($1::text[]) RETURNING id', [leadIds]);
    deleted.consent_records = consent.rowCount ?? 0;

    const leads = await pool.query('DELETE FROM leads WHERE id = ANY($1::text[]) RETURNING id', [leadIds]);
    deleted.leads = leads.rowCount ?? 0;
  } else {
    deleted.outbound_queue = 0;
    deleted.marketing_plans = 0;
    deleted.health_reports = 0;
    deleted.consent_records = 0;
    deleted.leads = 0;
  }

  printSummary({
    decision: 'PASS',
    mode: 'postgres',
    destructive: true,
    checks: 1,
    matchedLeads: leadIds.length,
    deleted,
    failures,
    safetyFilter: {
      source: smokeSource,
      contactPrefix: smokeContactPrefix,
      consentVersion: smokeConsentVersion,
    },
  });
} catch (error) {
  failures.push(error instanceof Error ? error.message : 'unknown error');
  printSummary({
    decision: 'FAIL',
    mode: 'postgres',
    destructive: true,
    checks: 1,
    deleted,
    failures,
  });
  process.exit(1);
} finally {
  await pool.end();
}
