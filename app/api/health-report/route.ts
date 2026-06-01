import { NextResponse } from 'next/server';

import { generateHealthReport, type HealthReportAnswers } from '@/src/agents/generate-health-report';
import { type LeadConsentInput, type LeadSource } from '@/src/lib/contact/lead-store';
import { getHealthScenario } from '@/src/data/health-scenarios';
import { requireAdminRequest } from '@/src/lib/auth/admin-guard';
import {
  createLead,
  listHealthReports,
  listLeads,
  saveHealthReport,
  updateHealthReportStatus,
} from '@/src/lib/assessment/assessment-store';

const leadSources = new Set<LeadSource>(['ai_consult', 'contact', 'product_consult', 'customer_journey_smoke']);

function parseSource(value: unknown): LeadSource {
  const source = String(value || 'ai_consult');
  return leadSources.has(source as LeadSource) ? (source as LeadSource) : 'ai_consult';
}

function parseNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function parseAnswers(value: unknown): HealthReportAnswers {
  const source = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  return {
    sleepHours: parseNumber(source.sleepHours),
    stressLevel: parseNumber(source.stressLevel),
    symptomDurationDays: parseNumber(source.symptomDurationDays),
    medicationUse: source.medicationUse ? String(source.medicationUse) : '',
    pregnancyOrBreastfeeding: Boolean(source.pregnancyOrBreastfeeding),
  };
}

function parseConsent(value: unknown): LeadConsentInput | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const source = value as Record<string, unknown>;
  return {
    privacyAccepted: Boolean(source.privacyAccepted),
    termsAccepted: Boolean(source.termsAccepted),
    sensitiveHealthDataAccepted: Boolean(source.sensitiveHealthDataAccepted ?? source.privacyAccepted),
    marketingContactAccepted: Boolean(source.marketingContactAccepted),
    version: source.version ? String(source.version) : undefined,
    page: source.page ? String(source.page) : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scenarioSlug = String(body?.scenarioSlug || 'sleep-support');
    const scenario = getHealthScenario(scenarioSlug);
    const answers = parseAnswers(body?.answers);
    const lead = await createLead({
      name: String(body?.name || ''),
      contact: String(body?.contact || ''),
      concern: String(body?.concern || scenario?.label || scenarioSlug),
      scenarioSlug,
      source: parseSource(body?.source),
      consent: parseConsent(body?.consent),
    });

    const report = await saveHealthReport(
      generateHealthReport({
        leadId: lead.id,
        name: lead.name,
        contact: lead.contact,
        scenarioSlug,
        answers,
      })
    );

    return NextResponse.json({ ok: true, lead, report });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Health report generation failed',
      },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({
    ok: true,
    leads: await listLeads(),
    reports: await listHealthReports(),
  });
}

export async function PATCH(request: Request) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const report = await updateHealthReportStatus({
      reportId: String(body?.reportId || ''),
      status: String(body?.status || 'pending_manual_review') as 'generated' | 'pending_manual_review' | 'approved' | 'rejected',
      reviewNotes: body?.reviewNotes ? String(body.reviewNotes) : null,
      reviewer: body?.reviewer ? String(body.reviewer) : 'admin',
    });

    if (!report) {
      return NextResponse.json({ ok: false, error: 'Health report not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, report });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Health report update failed',
      },
      { status: 400 }
    );
  }
}
