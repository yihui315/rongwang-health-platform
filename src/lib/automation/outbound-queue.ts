import { randomUUID } from 'node:crypto';

import type { HealthRiskLevel } from '@/src/agents/generate-health-report';

export type OutboundChannel = 'wechat_private' | 'sms' | 'email' | 'content_remarketing';
export type OutboundMessageIntent = 'education' | 'consult' | 'promotion';
export type OutboundQueueStatus = 'blocked' | 'queued' | 'cancelled' | 'sent' | 'failed';

export type OutboundConsentState = {
  privacyAccepted: boolean;
  termsAccepted: boolean;
  sensitiveHealthDataAccepted?: boolean;
  marketingContactAccepted?: boolean;
  stopContactRequested?: boolean;
};

export type OutboundSendGateInput = {
  channel: OutboundChannel;
  reportStatus: 'generated' | 'pending_manual_review' | 'approved' | 'rejected';
  planStatus: 'pending_manual_review' | 'approved' | 'rejected' | 'generated';
  riskLevel: HealthRiskLevel;
  messageIntent: OutboundMessageIntent;
  consent: OutboundConsentState;
  env?: Record<string, string | undefined>;
};

export type OutboundGateSnapshot = {
  channel: OutboundChannel;
  reportApproved: boolean;
  planApproved: boolean;
  privacyAccepted: boolean;
  termsAccepted: boolean;
  sensitiveHealthDataAccepted: boolean;
  marketingContactAccepted: boolean;
  stopContactRequested: boolean;
  autoSendEnabled: boolean;
  providerConfigured: boolean;
  highRiskPromotionBlocked: boolean;
};

export type OutboundSendGateResult = {
  allowed: boolean;
  reasons: string[];
  gateSnapshot: OutboundGateSnapshot;
};

export type OutboundQueueEntry = {
  id: string;
  leadId: string;
  reportId: string;
  marketingPlanId: string;
  channel: OutboundChannel;
  messageIntent: OutboundMessageIntent;
  payload: Record<string, unknown>;
  gateSnapshot: OutboundGateSnapshot;
  status: OutboundQueueStatus;
  blockedReasons: string[];
  scheduledFor?: string | null;
  sentAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
};

function isEnabled(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

function providerEnvName(channel: OutboundChannel): string {
  if (channel === 'wechat_private') return 'WECHAT_PRIVATE_SEND_PROVIDER';
  if (channel === 'sms') return 'SMS_SEND_PROVIDER';
  if (channel === 'email') return 'EMAIL_SEND_PROVIDER';
  return 'CONTENT_REMARKETING_PROVIDER';
}

export function evaluateOutboundSendGate(input: OutboundSendGateInput): OutboundSendGateResult {
  const env = input.env ?? process.env;
  const autoSendEnabled = isEnabled(env.ALLOW_AUTOMATED_MARKETING_SEND);
  const providerConfigured = Boolean(env[providerEnvName(input.channel)]?.trim());
  const sensitiveHealthDataAccepted = input.consent.sensitiveHealthDataAccepted ?? input.consent.privacyAccepted;
  const marketingContactAccepted = input.consent.marketingContactAccepted ?? false;
  const stopContactRequested = input.consent.stopContactRequested ?? false;
  const highRiskPromotionBlocked = input.riskLevel === 'high' && input.messageIntent === 'promotion';
  const gateSnapshot: OutboundGateSnapshot = {
    channel: input.channel,
    reportApproved: input.reportStatus === 'approved',
    planApproved: input.planStatus === 'approved',
    privacyAccepted: input.consent.privacyAccepted,
    termsAccepted: input.consent.termsAccepted,
    sensitiveHealthDataAccepted,
    marketingContactAccepted,
    stopContactRequested,
    autoSendEnabled,
    providerConfigured,
    highRiskPromotionBlocked,
  };
  const reasons: string[] = [];

  if (!gateSnapshot.reportApproved) reasons.push('report_not_approved');
  if (!gateSnapshot.planApproved) reasons.push('marketing_plan_not_approved');
  if (!gateSnapshot.privacyAccepted) reasons.push('privacy_consent_missing');
  if (!gateSnapshot.termsAccepted) reasons.push('terms_consent_missing');
  if (!gateSnapshot.sensitiveHealthDataAccepted) reasons.push('sensitive_health_consent_missing');
  if (!gateSnapshot.marketingContactAccepted) reasons.push('marketing_contact_consent_missing');
  if (gateSnapshot.stopContactRequested) reasons.push('stop_contact_requested');
  if (!gateSnapshot.autoSendEnabled) reasons.push('automated_marketing_disabled');
  if (!gateSnapshot.providerConfigured) reasons.push('provider_not_configured');
  if (gateSnapshot.highRiskPromotionBlocked) reasons.push('high_risk_promotion_blocked');

  return {
    allowed: reasons.length === 0,
    reasons,
    gateSnapshot,
  };
}

export function createOutboundQueueEntry(input: {
  leadId: string;
  reportId: string;
  marketingPlanId: string;
  channel: OutboundChannel;
  messageIntent: OutboundMessageIntent;
  payload: Record<string, unknown>;
  gate: OutboundSendGateResult;
  scheduledFor?: string | null;
}): OutboundQueueEntry {
  const createdAt = new Date().toISOString();

  return {
    id: `outbound_${randomUUID()}`,
    leadId: input.leadId,
    reportId: input.reportId,
    marketingPlanId: input.marketingPlanId,
    channel: input.channel,
    messageIntent: input.messageIntent,
    payload: input.payload,
    gateSnapshot: input.gate.gateSnapshot,
    status: input.gate.allowed ? 'queued' : 'blocked',
    blockedReasons: input.gate.reasons,
    scheduledFor: input.scheduledFor ?? null,
    sentAt: null,
    failureReason: null,
    createdAt,
    updatedAt: createdAt,
  };
}
