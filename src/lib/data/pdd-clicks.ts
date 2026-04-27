import { getPrisma } from "@/lib/prisma";
import { getSupabase } from "@/lib/supabase";

export interface PddClickInput {
  productId: string;
  sessionId?: string;
  consultationId?: string;
  source?: string;
  solutionSlug?: string;
  destinationUrl?: string;
  ref?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export interface PddClickListItem {
  id: string;
  createdAt: string;
  productId?: string;
  productSlug?: string;
  sessionId?: string;
  consultationId?: string;
  source?: string;
  solutionSlug?: string;
  destinationUrl?: string;
  ref?: string;
}

export interface PddClickSummary {
  total: number;
  bySource: Array<{ key: string; count: number }>;
  bySolution: Array<{ key: string; count: number }>;
  recent: PddClickListItem[];
}

async function saveToPrisma(input: PddClickInput) {
  const prisma = getPrisma();
  if (!prisma) {
    return false;
  }

  try {
    await prisma.pddClick.create({
      data: {
        productId: input.productId,
        productSlug: input.productId,
        sessionId: input.sessionId ?? null,
        consultationId: input.consultationId ?? null,
        source: input.source ?? "product-map",
        solutionSlug: input.solutionSlug ?? null,
        destinationUrl: input.destinationUrl ?? null,
        ref: input.ref ?? null,
        utm: input.utm ?? undefined,
      },
    });
    return true;
  } catch {
    return false;
  }
}

async function saveToSupabase(input: PddClickInput) {
  try {
    await getSupabase().from("pdd_clicks").insert({
      product_id: input.productId,
      session_id: input.sessionId ?? null,
      consultation_id: input.consultationId ?? null,
      source: input.source ?? "product-map",
      solution_slug: input.solutionSlug ?? null,
      ref: input.ref ?? null,
      utm: input.utm ?? null,
      destination_url: input.destinationUrl ?? null,
    });
  } catch {
    // Best-effort attribution must never block redirect flow.
  }
}

export async function savePddClick(input: PddClickInput) {
  const saved = await saveToPrisma(input);
  if (!saved) {
    await saveToSupabase(input);
  }
}

function countBy(rows: PddClickListItem[], key: keyof PddClickListItem) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = String(row[key] || "unknown");
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([entryKey, count]) => ({ key: entryKey, count }))
    .sort((left, right) => right.count - left.count);
}

async function listFromPrisma(limit: number): Promise<PddClickListItem[] | null> {
  const prisma = getPrisma();
  if (!prisma) {
    return null;
  }

  try {
    const rows = await prisma.pddClick.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      productId: row.productId ?? undefined,
      productSlug: row.productSlug ?? undefined,
      sessionId: row.sessionId ?? undefined,
      consultationId: row.consultationId ?? undefined,
      source: row.source ?? undefined,
      solutionSlug: row.solutionSlug ?? undefined,
      destinationUrl: row.destinationUrl ?? undefined,
      ref: row.ref ?? undefined,
    }));
  } catch {
    return null;
  }
}

async function listFromSupabase(limit: number): Promise<PddClickListItem[]> {
  try {
    const { data } = await getSupabase().from("pdd_clicks").select("*");
    const rows = (Array.isArray(data) ? data : []) as Array<Record<string, unknown>>;

    return rows.slice(0, limit).map((row) => ({
      id: String(row.id ?? ""),
      createdAt: String(row.created_at ?? ""),
      productId: typeof row.product_id === "string" ? row.product_id : undefined,
      productSlug: typeof row.product_slug === "string" ? row.product_slug : undefined,
      sessionId: typeof row.session_id === "string" ? row.session_id : undefined,
      consultationId: typeof row.consultation_id === "string" ? row.consultation_id : undefined,
      source: typeof row.source === "string" ? row.source : undefined,
      solutionSlug: typeof row.solution_slug === "string" ? row.solution_slug : undefined,
      destinationUrl: typeof row.destination_url === "string" ? row.destination_url : undefined,
      ref: typeof row.ref === "string" ? row.ref : undefined,
    }));
  } catch {
    return [];
  }
}

export async function listPddClicks(limit = 100): Promise<PddClickListItem[]> {
  return (await listFromPrisma(limit)) ?? (await listFromSupabase(limit));
}

export async function getPddClickSummary(limit = 200): Promise<PddClickSummary> {
  const rows = await listPddClicks(limit);
  return {
    total: rows.length,
    bySource: countBy(rows, "source"),
    bySolution: countBy(rows, "solutionSlug"),
    recent: rows.slice(0, 20),
  };
}
