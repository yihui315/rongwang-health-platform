import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getMemoryStore, isMemoryStoreEnabled } from "@/lib/data/memory-store";
import type { MarketingCampaignPlan } from "@/lib/marketing/automation";

export type OutboundQueueStatus = "blocked" | "ready" | "sent" | "failed" | "cancelled";

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
  createdAt: string;
  updatedAt: string;
}

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function nowIso() {
  return new Date().toISOString();
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
