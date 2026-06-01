import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getMemoryStore, isMemoryStoreEnabled } from "@/lib/data/memory-store";
import { getRetentionExpiresAt } from "@/lib/data/retention";
import type { MarketingCampaignPlan } from "@/lib/marketing/automation";
import {
  buildOutboundQueueDrafts,
  saveOutboundQueueDrafts,
  type OutboundQueueEntryView,
} from "@/lib/marketing/outbound-queue";

export interface StoredMarketingPlan {
  id: string;
  campaignSlug: string;
  objective: string;
  audience: string;
  keyword: string;
  solutionSlug: string | null;
  channels: string[];
  status: string;
  plan: MarketingCampaignPlan;
  outboundQueue: OutboundQueueEntryView[];
  createdAt: string;
  updatedAt: string;
}

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function nowIso() {
  return new Date().toISOString();
}

function mapStoredPlan(row: {
  id: string;
  campaignSlug: string;
  objective: string;
  audience: string;
  keyword: string;
  solutionSlug?: string | null;
  channels: string[];
  status: string;
  planJson: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
}, outboundQueue: OutboundQueueEntryView[] = []): StoredMarketingPlan {
  return {
    id: row.id,
    campaignSlug: row.campaignSlug,
    objective: row.objective,
    audience: row.audience,
    keyword: row.keyword,
    solutionSlug: row.solutionSlug ?? null,
    channels: row.channels,
    status: row.status,
    plan: row.planJson as MarketingCampaignPlan,
    outboundQueue,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export async function saveMarketingPlanDraft(input: {
  plan: MarketingCampaignPlan;
  leadId?: string | null;
  destination?: string | null;
}): Promise<StoredMarketingPlan> {
  const status = "pending_manual_review";
  const prisma = getPrisma();

  if (prisma) {
    const saved = await prisma.marketingPlan.create({
      data: {
        campaignSlug: input.plan.campaignSlug,
        objective: input.plan.objective,
        audience: input.plan.audience,
        keyword: input.plan.keyword,
        solutionSlug: input.plan.solutionSlug,
        channels: input.plan.assets.map((asset) => asset.channel),
        status,
        planJson: toJson(input.plan),
        complianceJson: toJson(input.plan.compliance),
        reviewHistory: toJson([{ status, at: new Date().toISOString(), actor: "system" }]),
        retentionExpiresAt: getRetentionExpiresAt(),
      },
    });
    const outboundQueue = await saveOutboundQueueDrafts(buildOutboundQueueDrafts({
      marketingPlanId: saved.id,
      plan: input.plan,
      leadId: input.leadId,
      destination: input.destination,
    }));
    return mapStoredPlan(saved, outboundQueue);
  }

  const fallbackId = `marketing_plan_${Date.now()}`;
  const row = {
    id: fallbackId,
    campaignSlug: input.plan.campaignSlug,
    objective: input.plan.objective,
    audience: input.plan.audience,
    keyword: input.plan.keyword,
    solutionSlug: input.plan.solutionSlug,
    channels: input.plan.assets.map((asset) => asset.channel),
    status,
    planJson: input.plan,
    complianceJson: input.plan.compliance,
    reviewHistory: [{ status, at: nowIso(), actor: "system" }],
    retentionExpiresAt: getRetentionExpiresAt().toISOString(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  if (isMemoryStoreEnabled()) {
    getMemoryStore().marketingPlans.set(fallbackId, row);
  }

  const outboundQueue = await saveOutboundQueueDrafts(buildOutboundQueueDrafts({
    marketingPlanId: fallbackId,
    plan: input.plan,
    leadId: input.leadId,
    destination: input.destination,
  }));
  return mapStoredPlan(row, outboundQueue);
}
