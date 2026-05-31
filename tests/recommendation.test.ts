import assert from "node:assert/strict";
import { test } from "node:test";

import { healthScenarios } from "../src/data/health-scenarios";
import {
  getPrimaryProductForScenario,
  getProductById,
  getProductsForScenario,
  getScenarioLabel,
} from "../src/lib/recommendation/scenario-products";

const requiredSlugs = [
  "sleep-support",
  "brain-focus",
  "digestive-support",
  "joint-bone",
  "liver-metabolism",
  "immune-support",
  "men-health",
  "women-health",
];

test("homepage fast funnel exposes at least eight direct scenario entries", () => {
  const slugs = healthScenarios.map((scenario) => scenario.slug);

  for (const slug of requiredSlugs) {
    assert.ok(slugs.includes(slug), `${slug} scenario is missing`);
  }
  assert.ok(healthScenarios.every((scenario) => scenario.href === `/solutions/${scenario.slug}`));
  assert.ok(healthScenarios.every((scenario) => scenario.ctaLabel === "查看方案与产品"));
});

test("each required scenario returns products or a safe empty state without throwing", () => {
  for (const slug of requiredSlugs) {
    const products = getProductsForScenario(slug);
    assert.ok(Array.isArray(products), `${slug} should return an array`);
    assert.ok(products.length >= 1, `${slug} should have at least one safe placeholder product`);
    assert.equal(getPrimaryProductForScenario(slug)?.scenarioSlugs.includes(slug), true);
  }
});

test("recommendations sort by priority and product lookup is stable", () => {
  const products = getProductsForScenario("sleep-support");

  assert.ok(products.length > 0);
  assert.ok(products.every((product, index) => index === 0 || products[index - 1].priority >= product.priority));
  assert.equal(getProductById(products[0].id)?.id, products[0].id);
  assert.equal(getScenarioLabel("sleep-support"), "睡眠与压力");
  assert.equal(getScenarioLabel("unknown-slug"), "健康场景");
});
