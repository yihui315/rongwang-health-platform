import type { Product } from "@/lib/data/products";
import { buildProductRecommendation, type ProductRecommendation } from "@/lib/health/recommendations";
import type { HealthConsultationResult } from "@/schemas/ai-result";
import type { HealthProfile } from "@/schemas/health";
import type { RecommendationCondition, RecommendationRuleRecord } from "@/schemas/recommendation-rule";

function includesAnyText(source: string[], needles: string[] | undefined) {
  if (!needles?.length) {
    return true;
  }

  const normalizedSource = source.map((item) => item.toLowerCase());
  return needles.some((needle) => {
    const normalizedNeedle = needle.toLowerCase();
    return normalizedSource.some((item) => item.includes(normalizedNeedle));
  });
}

function conditionMatches(
  condition: RecommendationCondition,
  result: HealthConsultationResult,
  profile: HealthProfile,
) {
  if (condition.solutionTypes?.length && !condition.solutionTypes.includes(result.recommendedSolutionType)) {
    return false;
  }

  if (condition.riskLevels?.length && !condition.riskLevels.includes(result.riskLevel)) {
    return false;
  }

  if (condition.genders?.length && !condition.genders.includes(profile.gender)) {
    return false;
  }

  if (typeof condition.minAge === "number" && profile.age < condition.minAge) {
    return false;
  }

  if (typeof condition.maxAge === "number" && profile.age > condition.maxAge) {
    return false;
  }

  if (!includesAnyText(profile.symptoms, condition.symptomIncludes)) {
    return false;
  }

  if (!includesAnyText([profile.goal], condition.goalIncludes)) {
    return false;
  }

  if (condition.lifestyle) {
    const { lifestyle } = condition;

    if (typeof lifestyle.alcohol === "boolean" && profile.lifestyle.alcohol !== lifestyle.alcohol) {
      return false;
    }

    if (typeof lifestyle.smoking === "boolean" && profile.lifestyle.smoking !== lifestyle.smoking) {
      return false;
    }

    if (!includesAnyText([profile.lifestyle.sleep], lifestyle.sleepIncludes)) {
      return false;
    }

    if (!includesAnyText([profile.lifestyle.exercise], lifestyle.exerciseIncludes)) {
      return false;
    }
  }

  return true;
}

export function doesRecommendationRuleMatch(
  rule: RecommendationRuleRecord,
  result: HealthConsultationResult,
  profile: HealthProfile,
) {
  if (!rule.active || result.riskLevel === "urgent") {
    return false;
  }

  return conditionMatches(rule.condition, result, profile);
}

function findRuleProduct(catalog: Product[], productId: string) {
  return catalog.find((product) => product.slug === productId || product.sku === productId);
}

export function getRecommendationsFromRules(
  catalog: Product[],
  rules: RecommendationRuleRecord[],
  result: HealthConsultationResult,
  profile: HealthProfile,
  limit = 3,
): ProductRecommendation[] {
  if (result.riskLevel === "urgent") {
    return [];
  }

  const seen = new Set<string>();
  const recommendations: ProductRecommendation[] = [];

  for (const rule of [...rules].sort((left, right) => left.priority - right.priority)) {
    if (!doesRecommendationRuleMatch(rule, result, profile)) {
      continue;
    }

    for (const productId of rule.productIds) {
      const product = findRuleProduct(catalog, productId);
      if (!product || seen.has(product.slug)) {
        continue;
      }

      seen.add(product.slug);
      recommendations.push(buildProductRecommendation(product, result, profile));

      if (recommendations.length >= limit) {
        return recommendations;
      }
    }
  }

  return recommendations;
}
