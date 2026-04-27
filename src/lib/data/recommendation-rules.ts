import { getPrisma } from "@/lib/prisma";
import { listProducts } from "@/lib/data/products";
import { solutionPlanMap } from "@/lib/health/recommendations";
import { recommendationRuleSchema, type RecommendationCondition, type RecommendationRuleRecord } from "@/schemas/recommendation-rule";
import type { SolutionType } from "@/schemas/ai-result";

function parseRuleRecord(value: unknown): RecommendationRuleRecord | null {
  const parsed = recommendationRuleSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

async function listRulesFromPrisma(includeInactive = true): Promise<RecommendationRuleRecord[] | null> {
  const prisma = getPrisma();
  if (!prisma) {
    return null;
  }

  try {
    const rows = await prisma.recommendationRule.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    });

    return rows.flatMap((row) => {
      const rule = parseRuleRecord({
        id: row.id,
        name: row.name ?? "Untitled rule",
        condition: row.condition,
        productIds: row.productIds,
        priority: row.priority,
        active: row.active,
        note: row.note ?? undefined,
        metadata: row.metadata ?? undefined,
      });

      return rule ? [rule] : [];
    });
  } catch {
    return null;
  }
}

async function buildStaticFallbackRules(): Promise<RecommendationRuleRecord[]> {
  const catalog = await listProducts();

  return (Object.keys(solutionPlanMap) as SolutionType[]).flatMap((solutionType, index) => {
    const targetPlans = solutionPlanMap[solutionType];
    const productIds = catalog
      .filter((product) => product.plans.some((plan) => targetPlans.includes(plan)))
      .map((product) => product.slug);

    if (productIds.length === 0) {
      return [];
    }

    return [
      {
        id: `static-${solutionType}`,
        name: `Static ${solutionType} fallback`,
        condition: {
          solutionTypes: [solutionType],
          riskLevels: ["low", "medium", "high"],
        },
        productIds,
        priority: 100 + index * 10,
        active: true,
        note: "Static fallback rule generated from the legacy solution-to-plan map.",
      } satisfies RecommendationRuleRecord,
    ];
  });
}

export async function listRecommendationRules(includeInactive = true): Promise<RecommendationRuleRecord[]> {
  return (await listRulesFromPrisma(includeInactive)) ?? (await buildStaticFallbackRules());
}

export async function listActiveRecommendationRules(): Promise<RecommendationRuleRecord[]> {
  return listRecommendationRules(false);
}

export interface RecommendationRuleUpdateInput {
  name?: string;
  condition?: RecommendationCondition;
  productIds?: string[];
  priority?: number;
  active?: boolean;
  note?: string | null;
}

export async function updateRecommendationRuleForAdmin(
  id: string,
  input: RecommendationRuleUpdateInput,
): Promise<RecommendationRuleRecord | null> {
  const prisma = getPrisma();
  if (!prisma) {
    return null;
  }

  try {
    const row = await prisma.recommendationRule.update({
      where: { id },
      data: {
        name: input.name,
        condition: input.condition,
        productIds: input.productIds,
        priority: input.priority,
        active: input.active,
        note: input.note,
      },
    });

    return parseRuleRecord({
      id: row.id,
      name: row.name ?? "Untitled rule",
      condition: row.condition,
      productIds: row.productIds,
      priority: row.priority,
      active: row.active,
      note: row.note ?? undefined,
      metadata: row.metadata ?? undefined,
    });
  } catch {
    return null;
  }
}
