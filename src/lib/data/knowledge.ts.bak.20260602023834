import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export type KnowledgeStatus = "draft" | "reviewed" | "retired";

export interface HealthKnowledgeEntryRecord {
  id: string;
  slug: string;
  title: string;
  category: string;
  audience: string | null;
  summary: string;
  body: string;
  evidenceLevel: string | null;
  status: KnowledgeStatus;
  redFlags: string[];
  contraindications: string[];
  tags: string[];
  sourceTitle: string | null;
  productLinks: Array<{
    productSlug: string;
    relationType: string;
    note: string | null;
  }>;
  updatedAt: string;
}

export const defaultKnowledgeSources = [
  {
    id: "source-rw-review-v1",
    title: "Rongwang reviewed health education baseline",
    sourceType: "internal_review",
    publisher: "Rongwang Health",
    citation: "Internal reviewed education copy for MVP launch.",
    status: "reviewed",
  },
] as const;

export const defaultKnowledgeEntries: HealthKnowledgeEntryRecord[] = [
  {
    id: "kb-fatigue-red-flags",
    slug: "fatigue-red-flags",
    title: "疲劳评估的就医信号",
    category: "risk_safety",
    audience: "general_adult",
    summary: "持续加重、伴随胸痛、呼吸困难、黑便、明显体重下降等情况，应优先线下就医。",
    body: "AI 评估只能做风险分层和教育提醒。出现急性胸痛、呼吸困难、晕厥、黑便、持续发热、明显体重下降或症状快速加重时，不应优先进入补充剂购买路径。",
    evidenceLevel: "clinical_safety",
    status: "reviewed",
    redFlags: ["胸痛", "呼吸困难", "晕厥", "黑便", "明显体重下降", "持续发热"],
    contraindications: [],
    tags: ["fatigue", "red_flag", "assessment"],
    sourceTitle: "Rongwang reviewed health education baseline",
    productLinks: [],
    updatedAt: new Date("2026-04-29T00:00:00.000Z").toISOString(),
  },
  {
    id: "kb-magnesium-sleep-education",
    slug: "magnesium-sleep-education",
    title: "镁与睡眠放松教育",
    category: "otc_education",
    audience: "general_adult",
    summary: "镁相关产品只能作为睡前放松和营养支持方向，不能替代失眠诊疗。",
    body: "睡眠问题需要先排查作息、压力、咖啡因、酒精和药物因素。镁类补充剂可以作为营养支持教育方向，但肾功能异常、正在使用相关药物或孕期/哺乳期人群应先咨询专业人士。",
    evidenceLevel: "education",
    status: "reviewed",
    redFlags: ["长期严重失眠", "情绪危机", "白天嗜睡影响驾驶"],
    contraindications: ["严重肾功能异常", "孕期或哺乳期未咨询医生", "正在使用需监测电解质的药物"],
    tags: ["sleep", "magnesium", "otc"],
    sourceTitle: "Rongwang reviewed health education baseline",
    productLinks: [
      {
        productSlug: "msr-nadh-tipsynox",
        relationType: "education",
        note: "仅用于睡眠方向教育解释，商品选择仍由规则库决定。",
      },
    ],
    updatedAt: new Date("2026-04-29T00:00:00.000Z").toISOString(),
  },
  {
    id: "kb-coq10-fatigue-draft",
    slug: "coq10-fatigue-draft",
    title: "CoQ10 与疲劳教育草稿",
    category: "otc_education",
    audience: "general_adult",
    summary: "草稿内容不得进入用户侧 AI 文案。",
    body: "该条目保留为审核状态测试样例。",
    evidenceLevel: "draft",
    status: "draft",
    redFlags: [],
    contraindications: [],
    tags: ["fatigue", "coq10", "draft"],
    sourceTitle: "Rongwang reviewed health education baseline",
    productLinks: [],
    updatedAt: new Date("2026-04-29T00:00:00.000Z").toISOString(),
  },
];

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function mapKnowledgeEntry(row: {
  id: string;
  slug: string;
  title: string;
  category: string;
  audience?: string | null;
  summary: string;
  body: string;
  evidenceLevel?: string | null;
  status: string;
  redFlags: string[];
  contraindications: string[];
  tags: string[];
  updatedAt: Date | string;
  source?: { title: string } | null;
  productLinks?: Array<{ productSlug: string; relationType: string; note?: string | null }>;
}): HealthKnowledgeEntryRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    audience: row.audience ?? null,
    summary: row.summary,
    body: row.body,
    evidenceLevel: row.evidenceLevel ?? null,
    status: row.status as KnowledgeStatus,
    redFlags: row.redFlags,
    contraindications: row.contraindications,
    tags: row.tags,
    sourceTitle: row.source?.title ?? null,
    productLinks: (row.productLinks ?? []).map((link) => ({
      productSlug: link.productSlug,
      relationType: link.relationType,
      note: link.note ?? null,
    })),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export function isReviewedKnowledgeEntry(entry: Pick<HealthKnowledgeEntryRecord, "status">) {
  return entry.status === "reviewed";
}

export function filterPublicKnowledgeEntries(entries: HealthKnowledgeEntryRecord[]) {
  return entries.filter(isReviewedKnowledgeEntry);
}

export function assertKnowledgeDoesNotSelectSku(entry: HealthKnowledgeEntryRecord) {
  return entry.productLinks.every((link) => link.relationType === "education");
}

export async function listKnowledgeEntriesForAdmin(): Promise<HealthKnowledgeEntryRecord[]> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.healthKnowledgeEntry.findMany({
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        include: {
          source: { select: { title: true } },
          productLinks: {
            select: { productSlug: true, relationType: true, note: true },
          },
        },
      });

      if (rows.length > 0) {
        return rows.map(mapKnowledgeEntry);
      }
    } catch {
      // Fall back to reviewed static seed while the database is being provisioned.
    }
  }

  return defaultKnowledgeEntries;
}

export async function listPublicKnowledgeEntries(category?: string) {
  const rows = await listKnowledgeEntriesForAdmin();
  return filterPublicKnowledgeEntries(
    category ? rows.filter((row) => row.category === category) : rows,
  );
}

export async function upsertDefaultKnowledgeSeed(prisma: any) {
  for (const source of defaultKnowledgeSources) {
    await prisma.knowledgeSource.upsert({
      where: { id: source.id },
      update: {
        title: source.title,
        sourceType: source.sourceType,
        publisher: source.publisher,
        citation: source.citation,
        status: source.status,
        reviewedAt: new Date(),
      },
      create: {
        id: source.id,
        title: source.title,
        sourceType: source.sourceType,
        publisher: source.publisher,
        citation: source.citation,
        status: source.status,
        reviewedAt: new Date(),
      },
    });
  }

  for (const entry of defaultKnowledgeEntries) {
    const savedEntry = await prisma.healthKnowledgeEntry.upsert({
      where: { slug: entry.slug },
      update: {
        title: entry.title,
        category: entry.category,
        audience: entry.audience,
        summary: entry.summary,
        body: entry.body,
        evidenceLevel: entry.evidenceLevel,
        status: entry.status,
        redFlags: entry.redFlags,
        contraindications: entry.contraindications,
        tags: entry.tags,
        sourceId: defaultKnowledgeSources[0].id,
        metadata: toJson({ seed: true }),
      },
      create: {
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
        category: entry.category,
        audience: entry.audience,
        summary: entry.summary,
        body: entry.body,
        evidenceLevel: entry.evidenceLevel,
        status: entry.status,
        redFlags: entry.redFlags,
        contraindications: entry.contraindications,
        tags: entry.tags,
        sourceId: defaultKnowledgeSources[0].id,
        metadata: toJson({ seed: true }),
      },
    });

    for (const link of entry.productLinks) {
      await prisma.productKnowledgeLink.upsert({
        where: {
          entryId_productSlug: {
            entryId: savedEntry.id,
            productSlug: link.productSlug,
          },
        },
        update: {
          relationType: link.relationType,
          note: link.note,
        },
        create: {
          entryId: savedEntry.id,
          productSlug: link.productSlug,
          relationType: link.relationType,
          note: link.note,
        },
      });
    }
  }
}
