import { analyticsEventNames, type AnalyticsEvent } from "@/lib/analytics";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getSupabase } from "@/lib/supabase";

export interface AnalyticsEventListItem extends AnalyticsEvent {
  id: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  total: number;
  byName: Record<(typeof analyticsEventNames)[number], number>;
  bySource: Array<{ key: string; count: number }>;
  completionRate: number;
  recommendationClickRate: number;
  pddRedirectRate: number;
  toolToAssessmentRate: number;
  recent: AnalyticsEventListItem[];
}

function emptyNameCounts(): AnalyticsSummary["byName"] {
  return Object.fromEntries(analyticsEventNames.map((name) => [name, 0])) as AnalyticsSummary["byName"];
}

function safeRate(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }

  return Number((numerator / denominator).toFixed(4));
}

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function countBy<T, K extends keyof T>(rows: T[], key: K) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = String(row[key] || "unknown");
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([entryKey, count]) => ({ key: entryKey, count }))
    .sort((left, right) => right.count - left.count);
}

export function summarizeAnalyticsEvents(rows: AnalyticsEventListItem[]): AnalyticsSummary {
  const byName = emptyNameCounts();

  for (const row of rows) {
    byName[row.name] += 1;
  }

  return {
    total: rows.length,
    byName,
    bySource: countBy(rows, "source"),
    completionRate: safeRate(byName.assessment_completed, byName.assessment_started),
    recommendationClickRate: safeRate(byName.recommendation_clicked, byName.assessment_completed),
    pddRedirectRate: safeRate(byName.pdd_redirect_clicked, byName.recommendation_clicked),
    toolToAssessmentRate: safeRate(byName.assessment_started, byName.tool_completed),
    recent: rows.slice(0, 20),
  };
}

async function saveToPrisma(event: AnalyticsEvent) {
  const prisma = getPrisma();
  if (!prisma) {
    return false;
  }

  try {
    await prisma.analyticsEvent.create({
      data: {
        name: event.name,
        sessionId: event.sessionId ?? null,
        consultationId: event.consultationId ?? null,
        source: event.source ?? null,
        solutionSlug: event.solutionSlug ?? null,
        productId: event.productId ?? null,
        metadata: event.metadata ? toJson(event.metadata) : undefined,
      },
    });
    return true;
  } catch {
    return false;
  }
}

async function saveToSupabase(event: AnalyticsEvent) {
  try {
    await getSupabase().from("analytics_events").insert({
      name: event.name,
      session_id: event.sessionId ?? null,
      consultation_id: event.consultationId ?? null,
      source: event.source ?? null,
      solution_slug: event.solutionSlug ?? null,
      product_id: event.productId ?? null,
      metadata: event.metadata ?? null,
    });
  } catch {
    // Analytics must never block user-facing flows.
  }
}

export async function saveAnalyticsEvent(event: AnalyticsEvent) {
  const saved = await saveToPrisma(event);
  if (!saved) {
    await saveToSupabase(event);
  }
}

async function listFromPrisma(limit: number): Promise<AnalyticsEventListItem[] | null> {
  const prisma = getPrisma();
  if (!prisma) {
    return null;
  }

  try {
    const rows = await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.flatMap((row) => {
      if (!(analyticsEventNames as readonly string[]).includes(row.name)) {
        return [];
      }

      return [
        {
          id: row.id,
          name: row.name as AnalyticsEventListItem["name"],
          sessionId: row.sessionId ?? undefined,
          consultationId: row.consultationId ?? undefined,
          source: row.source ?? undefined,
          solutionSlug: row.solutionSlug ?? undefined,
          productId: row.productId ?? undefined,
          metadata: row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
            ? (row.metadata as Record<string, unknown>)
            : undefined,
          createdAt: row.createdAt.toISOString(),
        },
      ];
    });
  } catch {
    return null;
  }
}

async function listFromSupabase(limit: number): Promise<AnalyticsEventListItem[]> {
  try {
    const { data } = await getSupabase().from("analytics_events").select("*");
    const rows = (Array.isArray(data) ? data : []) as Array<Record<string, unknown>>;

    return rows.slice(0, limit).flatMap((row) => {
      const name = String(row.name ?? "");
      if (!(analyticsEventNames as readonly string[]).includes(name)) {
        return [];
      }

      return [
        {
          id: String(row.id ?? ""),
          name: name as AnalyticsEventListItem["name"],
          sessionId: typeof row.session_id === "string" ? row.session_id : undefined,
          consultationId: typeof row.consultation_id === "string" ? row.consultation_id : undefined,
          source: typeof row.source === "string" ? row.source : undefined,
          solutionSlug: typeof row.solution_slug === "string" ? row.solution_slug : undefined,
          productId: typeof row.product_id === "string" ? row.product_id : undefined,
          metadata: row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
            ? (row.metadata as Record<string, unknown>)
            : undefined,
          createdAt: String(row.created_at ?? ""),
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function listAnalyticsEvents(limit = 200): Promise<AnalyticsEventListItem[]> {
  return (await listFromPrisma(limit)) ?? (await listFromSupabase(limit));
}

export async function getAnalyticsSummary(limit = 500) {
  return summarizeAnalyticsEvents(await listAnalyticsEvents(limit));
}
