import { randomUUID } from 'node:crypto';

import { getPostgresPool } from '@/src/lib/data/postgres-client';
import { resolveDataBackend, retentionExpiresAt } from '@/src/lib/data/data-backend';
import {
  buildStoredLead,
  createLead as createJsonLead,
  getLeadById as getJsonLeadById,
  listLeads as listJsonLeads,
  type LeadInput,
  type StoredLead,
} from '@/src/lib/contact/lead-store';
import {
  getHealthReport as getJsonHealthReport,
  listHealthReports as listJsonHealthReports,
  saveHealthReport as saveJsonHealthReport,
  updateHealthReportStatus as updateJsonHealthReportStatus,
  type StoredHealthReport,
} from '@/src/lib/health-report/report-store';
import type { HealthReport } from '@/src/agents/generate-health-report';

function rowToLead(row: Record<string, unknown>): StoredLead {
  const consent = (row.consent ?? {}) as StoredLead['consent'];
  return {
    id: String(row.id),
    name: String(row.name),
    contact: String(row.contact),
    concern: String(row.concern),
    scenarioSlug: row.scenario_slug ? String(row.scenario_slug) : null,
    source: String(row.source) as StoredLead['source'],
    consent,
    retentionExpiresAt: new Date(String(row.retention_expires_at)).toISOString(),
    stopContactRequested: Boolean(row.stop_contact_requested),
    status: String(row.status) as StoredLead['status'],
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function rowToHealthReport(row: Record<string, unknown>): StoredHealthReport {
  return {
    id: String(row.id),
    reportVersion: String(row.report_version) as StoredHealthReport['reportVersion'],
    leadId: String(row.lead_id),
    name: String(row.name),
    contact: String(row.contact),
    scenarioSlug: String(row.scenario_slug),
    scenarioLabel: String(row.scenario_label),
    overallScore: Number(row.overall_score),
    riskLevel: String(row.risk_level) as StoredHealthReport['riskLevel'],
    redFlags: (row.red_flags ?? []) as StoredHealthReport['redFlags'],
    manualReviewRequired: Boolean(row.manual_review_required),
    sections: (row.sections ?? []) as StoredHealthReport['sections'],
    nutritionDirections: (row.nutrition_directions ?? []) as StoredHealthReport['nutritionDirections'],
    nextActions: (row.next_actions ?? []) as StoredHealthReport['nextActions'],
    disclaimers: (row.disclaimers ?? []) as StoredHealthReport['disclaimers'],
    audit: (row.audit ?? {}) as StoredHealthReport['audit'],
    status: String(row.status) as StoredHealthReport['status'],
    reviewNotes: row.review_notes ? String(row.review_notes) : null,
    reviewer: row.reviewer ? String(row.reviewer) : null,
    reviewedAt: row.reviewed_at ? new Date(String(row.reviewed_at)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

async function createPostgresLead(input: LeadInput): Promise<StoredLead> {
  const createdAt = new Date();
  const lead = buildStoredLead(input, `lead_${randomUUID()}`, createdAt.toISOString());
  const consentId = `consent_${randomUUID()}`;
  const expiresAt = retentionExpiresAt(createdAt);
  const pool = getPostgresPool();

  await pool.query(
    `INSERT INTO leads
      (id, name, contact, concern, scenario_slug, source, status, stop_contact_requested, retention_expires_at, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (id) DO UPDATE SET
      name=EXCLUDED.name,
      contact=EXCLUDED.contact,
      concern=EXCLUDED.concern,
      scenario_slug=EXCLUDED.scenario_slug,
      source=EXCLUDED.source,
      updated_at=EXCLUDED.updated_at`,
    [
      lead.id,
      lead.name,
      lead.contact,
      lead.concern,
      lead.scenarioSlug,
      lead.source,
      lead.status,
      lead.stopContactRequested,
      expiresAt,
      createdAt,
      createdAt,
    ]
  );

  await pool.query(
    `INSERT INTO consent_records
      (id, lead_id, privacy_accepted, terms_accepted, sensitive_health_data_accepted, marketing_contact_accepted, version, page, accepted_at, retention_expires_at, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (id) DO NOTHING`,
    [
      consentId,
      lead.id,
      lead.consent.privacyAccepted,
      lead.consent.termsAccepted,
      lead.consent.sensitiveHealthDataAccepted,
      lead.consent.marketingContactAccepted,
      lead.consent.version,
      lead.consent.page,
      lead.consent.acceptedAt,
      lead.consent.retentionExpiresAt,
      createdAt,
      createdAt,
    ]
  );

  return lead;
}

export async function createLead(input: LeadInput): Promise<StoredLead> {
  if (resolveDataBackend() === 'postgres') {
    return createPostgresLead(input);
  }

  return createJsonLead(input);
}

export async function listLeads(): Promise<StoredLead[]> {
  if (resolveDataBackend() === 'json') {
    return listJsonLeads();
  }

  const result = await getPostgresPool().query(`
    SELECT l.*, COALESCE(to_jsonb(c.*), '{}'::jsonb) AS consent
    FROM leads l
    LEFT JOIN LATERAL (
      SELECT privacy_accepted AS "privacyAccepted",
             terms_accepted AS "termsAccepted",
             sensitive_health_data_accepted AS "sensitiveHealthDataAccepted",
             marketing_contact_accepted AS "marketingContactAccepted",
             version,
             page,
             accepted_at AS "acceptedAt",
             retention_expires_at AS "retentionExpiresAt"
      FROM consent_records
      WHERE lead_id = l.id
      ORDER BY accepted_at DESC
      LIMIT 1
    ) c ON TRUE
    ORDER BY l.created_at DESC
  `);
  return result.rows.map(rowToLead);
}

export async function getLeadById(leadId: string): Promise<StoredLead | null> {
  if (resolveDataBackend() === 'json') {
    return getJsonLeadById(leadId);
  }

  const result = await getPostgresPool().query(
    `
      SELECT l.*, COALESCE(to_jsonb(c.*), '{}'::jsonb) AS consent
      FROM leads l
      LEFT JOIN LATERAL (
        SELECT privacy_accepted AS "privacyAccepted",
               terms_accepted AS "termsAccepted",
               sensitive_health_data_accepted AS "sensitiveHealthDataAccepted",
               marketing_contact_accepted AS "marketingContactAccepted",
               version,
               page,
               accepted_at AS "acceptedAt",
               retention_expires_at AS "retentionExpiresAt"
        FROM consent_records
        WHERE lead_id = l.id
        ORDER BY accepted_at DESC
        LIMIT 1
      ) c ON TRUE
      WHERE l.id = $1
    `,
    [leadId]
  );
  return result.rows[0] ? rowToLead(result.rows[0]) : null;
}

export async function saveHealthReport(report: HealthReport): Promise<StoredHealthReport> {
  if (resolveDataBackend() === 'json') {
    return saveJsonHealthReport(report);
  }

  const createdAt = new Date();
  const stored: StoredHealthReport = {
    ...report,
    status: report.manualReviewRequired ? 'pending_manual_review' : 'generated',
    reviewNotes: null,
    reviewer: null,
    reviewedAt: null,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  };

  await getPostgresPool().query(
    `INSERT INTO health_reports
      (id, lead_id, report_version, scenario_slug, scenario_label, risk_level, overall_score, red_flags, manual_review_required,
       sections, nutrition_directions, next_actions, disclaimers, audit, status, review_notes, reviewer, reviewed_at,
       retention_expires_at, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
     ON CONFLICT (id) DO UPDATE SET
      status=EXCLUDED.status,
      updated_at=EXCLUDED.updated_at`,
    [
      stored.id,
      stored.leadId,
      stored.reportVersion,
      stored.scenarioSlug,
      stored.scenarioLabel,
      stored.riskLevel,
      stored.overallScore,
      JSON.stringify(stored.redFlags),
      stored.manualReviewRequired,
      JSON.stringify(stored.sections),
      JSON.stringify(stored.nutritionDirections),
      JSON.stringify(stored.nextActions),
      JSON.stringify(stored.disclaimers),
      JSON.stringify(stored.audit),
      stored.status,
      stored.reviewNotes,
      stored.reviewer,
      stored.reviewedAt,
      retentionExpiresAt(createdAt),
      createdAt,
      createdAt,
    ]
  );

  return stored;
}

export async function listHealthReports(): Promise<StoredHealthReport[]> {
  if (resolveDataBackend() === 'json') {
    return listJsonHealthReports();
  }

  const result = await getPostgresPool().query(`
    SELECT hr.*, l.name, l.contact
    FROM health_reports hr
    JOIN leads l ON l.id = hr.lead_id
    ORDER BY hr.created_at DESC
  `);
  return result.rows.map(rowToHealthReport);
}

export async function getHealthReport(reportId: string): Promise<StoredHealthReport | null> {
  if (resolveDataBackend() === 'json') {
    return getJsonHealthReport(reportId);
  }

  const result = await getPostgresPool().query(
    `
      SELECT hr.*, l.name, l.contact
      FROM health_reports hr
      JOIN leads l ON l.id = hr.lead_id
      WHERE hr.id = $1
    `,
    [reportId]
  );
  return result.rows[0] ? rowToHealthReport(result.rows[0]) : null;
}

export async function updateHealthReportStatus(input: {
  reportId: string;
  status: StoredHealthReport['status'];
  reviewNotes?: string | null;
  reviewer?: string | null;
}): Promise<StoredHealthReport | null> {
  if (resolveDataBackend() === 'json') {
    return updateJsonHealthReportStatus(input);
  }

  const updatedAt = new Date();
  const result = await getPostgresPool().query(
    `
      UPDATE health_reports
      SET status=$2, review_notes=$3, reviewer=$4, reviewed_at=$5, updated_at=$5
      WHERE id=$1
      RETURNING *
    `,
    [input.reportId, input.status, input.reviewNotes ?? null, input.reviewer ?? 'admin', updatedAt]
  );
  if (!result.rows[0]) return null;
  return getHealthReport(input.reportId);
}
