import { getHealthScenario, healthScenarios } from '@/src/data/health-scenarios';
import { pddProducts, type PddProduct } from '@/src/data/pdd-products';

export function getProductsForScenario(scenarioSlug: string): PddProduct[] {
  return pddProducts
    .filter((product) => product.scenarioSlugs.includes(scenarioSlug))
    .sort((left, right) => right.priority - left.priority);
}

export function getPrimaryProductForScenario(scenarioSlug: string): PddProduct | null {
  return getProductsForScenario(scenarioSlug)[0] ?? null;
}

export function getProductById(id: string): PddProduct | null {
  return pddProducts.find((product) => product.id === id || product.slug === id) ?? null;
}

export function getScenarioLabel(slug: string): string {
  return getHealthScenario(slug)?.label ?? '健康场景';
}

export function getScenarioSlugForProduct(product: PddProduct): string {
  return product.scenarioSlugs.find((slug) => healthScenarios.some((scenario) => scenario.slug === slug)) ?? 'sleep-support';
}
