import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getMemoryStore, isMemoryStoreEnabled } from "@/lib/data/memory-store";
import type { MarketingCampaignPlan } from "@/lib/marketing/automation";

export type OutboundQueueStatus = "blocked" | "ready" | "sent" | "failed" | "cancelled";
export type OutboundQueueReviewAction = "reviewed_blocked" | "cancelled";

export interface OutboundGateSnapshot {
  marketingPlanStatus: string;
  complianceApproved: boolean;
  automatedMarketingEnabled: boolean;
  channelProviderConfigured: boolean;
  manualApprovalRequired: boolean;
}

export interface OutboundQueueEntryView {
  id: string;
  marketingPlanId: string;
  leadId: string | null;
  channel: string;
  destination: string | null;
  status: OutboundQueueStatus;
  blockedReasons: string[];
  gateSnapshot: OutboundGateSnapshot;
  payload: unknown;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OutboundQueueReviewRecord {
  action: OutboundQueueReviewAction;
  actor: string;
  note: string;
  at: string;
  previousStatus: OutboundQueueStatus;
  nextStatus: OutboundQueueStatus;
  blockedReasons: string[];
}

export type OutboundQueueReviewDecisionResult =
  | { entry: OutboundQueueEntryView; error?: never; status?: never }
  | { entry?: never; error: "not_found" | "storage_unavailable" | "status_conflict"; status?: OutboundQueueStatus };

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return { ...(metadata as Record<string, unknown>) };
}

function getReviewHistory(metadata: Record<string, unknown>): OutboundQueueReviewRecord[] {
  return Array.isArray(metadata.reviewHistory)
    ? (metadata.reviewHistory as OutboundQueueReviewRecord[])
    : [];
}

function auditActionForReview(action: OutboundQueueReviewAction) {
  return action === "cancelled" ? "outbound_queue_cancelled" : "outbound_queue_reviewed";
}

function isReviewActionAllowedForStatus(action: OutboundQueueReviewAction, status: OutboundQueueStatus) {
  if (action === "reviewed_blocked") {
    return status === "blocked";
  }

  return status === "blocked" || status === "ready";
}

function hasChannelProvider(channel: string) {
  if (channel === "wechat") {
    return Boolean(process.env.WECHAT_APPID && process.env.WECHAT_SECRET);
  }

  if (channel === "email") {
    return Boolean(process.env.MARKETING_EMAIL_PROVIDER);
  }

  return false;
}

export function createOutboundGateSnapshot(input: {
  planStatus?: string;
  complianceApproved: boolean;
  channel: string;
}): OutboundGateSnapshot {
  return {
    marketingPlanStatus: input.planStatus ?? "pending_manual_review",
    complianceApproved: input.complianceApproved,
    automatedMarketingEnabled: process.env.ALLOW_AUTOMATED_MARKETING_SEND === "true",
    channelProviderConfigured: hasChannelProvider(input.channel),
    manualApprovalRequired: true,
  };
}

export function blockedReasonsForGate(snapshot: OutboundGateSnapshot) {
  return [
    snapshot.marketingPlanStatus === "approved" ? null : "marketing_plan_not_approved",
    snapshot.complianceApproved ? null : "compliance_not_approved",
    snapshot.automatedMarketingEnabled ? null : "automated_marketing_disabled",
    snapshot.channelProviderConfigured ? null : "channel_provider_not_configured",
    snapshot.manualApprovalRequired ? "manual_send_review_required" : null,
  ].filter((reason): reason is string => Boolean(reason));
}

export function buildOutboundQueueDrafts(input: {
  marketingPlanId: string;
  plan: MarketingCampaignPlan;
  leadId?: string | null;
  destination?: string | null;
}): Array<Omit<OutboundQueueEntryView, "id" | "createdAt" | "updatedAt">> {
  return input.plan.assets.map((asset) => {
    const gateSnapshot = createOutboundGateSnapshot({
      planStatus: "pending_manual_review",
      complianceApproved: input.plan.compliance.approved && asset.compliance.approved,
      channel: asset.channel,
    });
    const blockedReasons = blockedReasonsForGate(gateSnapshot);

    return {
      marketingPlanId: input.marketingPlanId,
      leadId: input.leadId ?? null,
      channel: asset.channel,
      destination: input.destination ?? null,
      status: blockedReasons.length > 0 ? "blocked" : "ready",
      blockedReasons,
      gateSnapshot,
      payload: {
        campaignSlug: input.plan.campaignSlug,
        title: asset.title,
        brief: asset.brief,
        href: asset.href,
        primaryCta: asset.primaryCta,
        contentOutline: asset.contentOutline,
      },
      metadata: {},
    };
  });
}

function mapQueueRow(row: {
  id: string;
  marketingPlanId: string;
  leadId?: string | null;
  channel: string;
  destination?: string | null;
  status: string;
  blockedReasons: string[];
  gateSnapshot: unknown;
  payload: unknown;
  metadata?: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
}): OutboundQueueEntryView {
  return {
    id: row.id,
    marketingPlanId: row.marketingPlanId,
    leadId: row.leadId ?? null,
    channel: row.channel,
    destination: row.destination ?? null,
    status: row.status as OutboundQueueStatus,
    blockedReasons: row.blockedReasons,
    gateSnapshot: row.gateSnapshot as OutboundGateSnapshot,
    payload: row.payload,
    metadata: normalizeMetadata(row.metadata),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export async function saveOutboundQueueDrafts(
  drafts: Array<Omit<OutboundQueueEntryView, "id" | "createdAt" | "updatedAt">>,
): Promise<OutboundQueueEntryView[]> {
  if (drafts.length === 0) {
    return [];
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const saved = await Promise.all(drafts.map((draft) => prisma.outboundQueueEntry.create({
        data: {
          marketingPlanId: draft.marketingPlanId,
          leadId: draft.leadId,
          channel: draft.channel,
          destination: draft.destination,
          status: draft.status,
          blockedReasons: draft.blockedReasons,
          gateSnapshot: toJson(draft.gateSnapshot),
          payload: toJson(draft.payload),
          metadata: toJson(draft.metadata),
        },
      })));
      return saved.map(mapQueueRow);
    } catch {
      return [];
    }
  }

  if (!isMemoryStoreEnabled()) {
    return [];
  }

  const store = getMemoryStore();
  return drafts.map((draft) => {
    const id = `outbound_${store.outboundQueue.size + 1}`;
    const row = {
      ...draft,
      id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.outboundQueue.set(id, row);
    return row;
  });
}

export async function listOutboundQueue(limit = 100): Promise<OutboundQueueEntryView[]> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.outboundQueueEntry.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(mapQueueRow);
    } catch {
      return [];
    }
  }

  if (!isMemoryStoreEnabled()) {
    return [];
  }

  return Array.from(getMemoryStore().outboundQueue.values())
    .map((row) => mapQueueRow(row as never))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function recordOutboundQueueReviewDecision(input: {
  id: string;
  action: OutboundQueueReviewAction;
  actor?: string;
  note: string;
}): Promise<OutboundQueueReviewDecisionResult> {
  const prisma = getPrisma();
  const actor = input.actor?.trim() || "admin";
  const reviewedAt = nowIso();

  if (prisma) {
    try {
      const row = await prisma.outboundQueueEntry.findUnique({ where: { id: input.id } });
      if (!row) {
        return { error: "not_found" };
      }

      const previousStatus = row.status as OutboundQueueStatus;
      if (!isReviewActionAllowedForStatus(input.action, previousStatus)) {
        return { error: "status_conflict", status: previousStatus };
      }

      const nextStatus: OutboundQueueStatus = input.action === "cancelled" ? "cancelled" : previousStatus;
      const metadata = normalizeMetadata(row.metadata);
      const review: OutboundQueueReviewRecord = {
        action: input.action,
        actor,
        note: input.note,
        at: reviewedAt,
        previousStatus,
        nextStatus,
        blockedReasons: row.blockedReasons,
      };
      const nextMetadata = {
        ...metadata,
        reviewHistory: [...getReviewHistory(metadata), review],
      };

      const [updated] = await prisma.$transaction([
        prisma.outboundQueueEntry.update({
          where: { id: input.id },
          data: {
            status: nextStatus,
            metadata: toJson(nextMetadata),
          },
        }),
        prisma.auditEvent.create({
          data: {
            actor,
            action: auditActionForReview(input.action),
            targetType: "outbound_queue_entry",
            targetId: input.id,
            metadata: toJson({
              review,
              marketingPlanId: row.marketingPlanId,
              channel: row.channel,
              sendEventCreated: false,
            }),
          },
        }),
      ]);

      return { entry: mapQueueRow(updated) };
    } catch {
      return { error: "storage_unavailable" };
    }
  }

  if (!isMemoryStoreEnabled()) {
    return { error: "storage_unavailable" };
  }

  const store = getMemoryStore();
  const row = store.outboundQueue.get(input.id);
  if (!row) {
    return { error: "not_found" };
  }

  const mapped = mapQueueRow(row as never);
  if (!isReviewActionAllowedForStatus(input.action, mapped.status)) {
    return { error: "status_conflict", status: mapped.status };
  }

  const nextStatus: OutboundQueueStatus = input.action === "cancelled" ? "cancelled" : mapped.status;
  const review: OutboundQueueReviewRecord = {
    action: input.action,
    actor,
    note: input.note,
    at: reviewedAt,
    previousStatus: mapped.status,
    nextStatus,
    blockedReasons: mapped.blockedReasons,
  };
  const nextMetadata = {
    ...mapped.metadata,
    reviewHistory: [...getReviewHistory(mapped.metadata), review],
  };
  const updatedRow = {
    ...row,
    status: nextStatus,
    metadata: nextMetadata,
    updatedAt: reviewedAt,
  };
  store.outboundQueue.set(input.id, updatedRow);

  const auditId = `audit_${store.auditEvents.size + 1}`;
  store.auditEvents.set(auditId, {
    id: auditId,
    actor,
    action: auditActionForReview(input.action),
    targetType: "outbound_queue_entry",
    targetId: input.id,
    metadata: {
      review,
      marketingPlanId: mapped.marketingPlanId,
      channel: mapped.channel,
      sendEventCreated: false,
    },
    createdAt: reviewedAt,
  });

  return { entry: mapQueueRow(updatedRow as never) };
}
