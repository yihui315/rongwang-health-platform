import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export type LeadSource = 'ai_consult' | 'contact' | 'product_consult' | 'customer_journey_smoke';

export type LeadConsentInput = {
  privacyAccepted?: boolean;
  termsAccepted?: boolean;
  version?: string;
  page?: string;
};

export type StoredLeadConsent = {
  privacyAccepted: boolean;
  termsAccepted: boolean;
  version: string;
  page: string;
  acceptedAt: string;
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

function normalizeConsent(input: LeadConsentInput | null | undefined, acceptedAt: string): StoredLeadConsent {
  return {
    privacyAccepted: Boolean(input?.privacyAccepted),
    termsAccepted: Boolean(input?.termsAccepted),
    version: input?.version?.trim() || 'unrecorded',
    page: input?.page?.trim() || 'unknown',
    acceptedAt,
  };
}

export function createLead(input: LeadInput): StoredLead {
  const validationError = validateLeadInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const createdAt = new Date().toISOString();
  const lead: StoredLead = {
    id: `lead_${randomUUID()}`,
    name: input.name.trim(),
    contact: input.contact.trim(),
    concern: input.concern.trim(),
    scenarioSlug: input.scenarioSlug?.trim() || null,
    source: input.source ?? 'ai_consult',
    consent: normalizeConsent(input.consent, createdAt),
    status: 'new',
    createdAt,
    updatedAt: createdAt,
  };
  const leads = readLeads();
  leads.unshift(lead);
  persistLeads(leads);
  return lead;
}

export function listLeads(): StoredLead[] {
  return readLeads();
}

export function resetLeadsForTest(): void {
  persistLeads([]);
}
