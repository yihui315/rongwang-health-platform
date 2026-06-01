import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { retentionExpiresAt } from '@/src/lib/data/data-backend';

export type LeadSource = 'ai_consult' | 'contact' | 'product_consult' | 'customer_journey_smoke';

export type LeadConsentInput = {
  privacyAccepted?: boolean;
  termsAccepted?: boolean;
  sensitiveHealthDataAccepted?: boolean;
  marketingContactAccepted?: boolean;
  version?: string;
  page?: string;
};

export type StoredLeadConsent = {
  privacyAccepted: boolean;
  termsAccepted: boolean;
  sensitiveHealthDataAccepted: boolean;
  marketingContactAccepted: boolean;
  version: string;
  page: string;
  acceptedAt: string;
  retentionExpiresAt: string;
};

export type LeadInput = {
  name: string;
  contact: string;
  concern: string;
  scenarioSlug?: string | null;
  source?: LeadSource;
  consent?: LeadConsentInput | null;
};

export type StoredLead = Omit<LeadInput, 'consent'> & {
  id: string;
  source: LeadSource;
  consent: StoredLeadConsent;
  retentionExpiresAt: string;
  stopContactRequested: boolean;
  status: 'new';
  createdAt: string;
  updatedAt: string;
};

function getLeadPath(): string {
  return path.join(process.cwd(), '.rongwang-data', 'leads.json');
}

function readLeads(): StoredLead[] {
  const leadPath = getLeadPath();
  if (!existsSync(leadPath)) {
    return [];
  }

  try {
    return JSON.parse(readFileSync(leadPath, 'utf8')) as StoredLead[];
  } catch {
    return [];
  }
}

function persistLeads(leads: StoredLead[]): void {
  const leadPath = getLeadPath();
  mkdirSync(path.dirname(leadPath), { recursive: true });
  writeFileSync(leadPath, `${JSON.stringify(leads, null, 2)}\n`);
}

export function validateLeadInput(input: LeadInput): string | null {
  if (!input.name.trim()) return '请填写称呼';
  if (!input.contact.trim()) return '请填写微信、手机号或 WhatsApp';
  if (!input.concern.trim()) return '请选择或填写健康关注方向';
  if (input.contact.trim().length < 5) return '联系方式过短，请检查后再提交';
  return null;
}

export function normalizeConsent(input: LeadConsentInput | null | undefined, acceptedAt: string): StoredLeadConsent {
  return {
    privacyAccepted: Boolean(input?.privacyAccepted),
    termsAccepted: Boolean(input?.termsAccepted),
    sensitiveHealthDataAccepted: Boolean(input?.sensitiveHealthDataAccepted ?? input?.privacyAccepted),
    marketingContactAccepted: Boolean(input?.marketingContactAccepted),
    version: input?.version?.trim() || 'unrecorded',
    page: input?.page?.trim() || 'unknown',
    acceptedAt,
    retentionExpiresAt: retentionExpiresAt(new Date(acceptedAt)),
  };
}

export function buildStoredLead(input: LeadInput, id = `lead_${randomUUID()}`, createdAt = new Date().toISOString()): StoredLead {
  const validationError = validateLeadInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  return {
    id,
    name: input.name.trim(),
    contact: input.contact.trim(),
    concern: input.concern.trim(),
    scenarioSlug: input.scenarioSlug?.trim() || null,
    source: input.source ?? 'ai_consult',
    consent: normalizeConsent(input.consent, createdAt),
    retentionExpiresAt: retentionExpiresAt(new Date(createdAt)),
    stopContactRequested: false,
    status: 'new',
    createdAt,
    updatedAt: createdAt,
  };
}

export function createLead(input: LeadInput): StoredLead {
  const lead = buildStoredLead(input);
  const leads = readLeads();
  leads.unshift(lead);
  persistLeads(leads);
  return lead;
}

export function listLeads(): StoredLead[] {
  return readLeads();
}

export function getLeadById(leadId: string): StoredLead | null {
  return readLeads().find((lead) => lead.id === leadId) ?? null;
}

export function resetLeadsForTest(): void {
  persistLeads([]);
}
