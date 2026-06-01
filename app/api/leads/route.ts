import { NextResponse } from 'next/server';

import { requireAdminRequest } from '@/src/lib/auth/admin-guard';
import { type LeadConsentInput, type LeadSource } from '@/src/lib/contact/lead-store';
import { createLead, listLeads } from '@/src/lib/assessment/assessment-store';

const leadSources = new Set<LeadSource>(['ai_consult', 'contact', 'product_consult', 'customer_journey_smoke']);

function parseSource(value: unknown): LeadSource {
  const source = String(value || 'ai_consult');
  return leadSources.has(source as LeadSource) ? (source as LeadSource) : 'ai_consult';
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
    const lead = await createLead({
      name: String(body?.name || ''),
      contact: String(body?.contact || ''),
      concern: String(body?.concern || ''),
      scenarioSlug: body?.scenarioSlug ? String(body.scenarioSlug) : null,
      source: parseSource(body?.source),
      consent: parseConsent(body?.consent),
    });

    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Lead submission failed',
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
  });
}
