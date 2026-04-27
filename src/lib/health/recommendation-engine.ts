import { listProducts } from "@/lib/data/products";
import { listActiveRecommendationRules } from "@/lib/data/recommendation-rules";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { getRecommendationsFromCatalog } from "@/lib/health/recommendations";
import { getRecommendationsFromRules } from "@/lib/health/rule-mapper";
import type { HealthConsultationResult } from "@/schemas/ai-result";
import type { HealthProfile } from "@/schemas/health";

function mergeRecommendationLists(
  primary: ReturnType<typeof getRecommendationsFromCatalog>,
  fallback: ReturnType<typeof getRecommendationsFromCatalog>,
  limit: number,
) {
  const seen = new Set(primary.map((item) => item.productSlug));
  const merged = [...primary];

  for (const item of fallback) {
    if (seen.has(item.productSlug)) {
      continue;
    }

    merged.push(item);
    seen.add(item.productSlug);

    if (merged.length >= limit) {
      break;
    }
  }

  return merged.slice(0, limit);
}

export async function getRecommendationsForConsultation(
  result: HealthConsultationResult,
  profile: HealthProfile,
  limit = 3,
) {
  if (result.riskLevel === "urgent") {
    return [];
  }

  const catalog = await listProducts();
  const fallbackRecommendations = getRecommendationsFromCatalog(catalog, result, profile, limit);

  if (!isFeatureEnabled("dbRecommendationRules")) {
    return fallbackRecommendations;
  }

  const rules = await listActiveRecommendationRules();

  if (rules.length === 0) {
    return fallbackRecommendations;
  }

  const ruleRecommendations = getRecommendationsFromRules(catalog, rules, result, profile, limit);
  if (ruleRecommendations.length === 0) {
    return fallbackRecommendations;
  }

  return mergeRecommendationLists(ruleRecommendations, fallbackRecommendations, limit);
}
