import test from "node:test";
import assert from "node:assert/strict";
import { getFeatureFlagSnapshot, isFeatureEnabled } from "@/lib/feature-flags";

test("feature flags use safe defaults when env is unset", () => {
  const previous = process.env.FEATURE_AI_PROVIDER;
  delete process.env.FEATURE_AI_PROVIDER;

  assert.equal(isFeatureEnabled("aiProvider"), true);

  process.env.FEATURE_AI_PROVIDER = previous;
});

test("feature flags parse false-like env values", () => {
  const previous = process.env.FEATURE_AI_PROVIDER;
  process.env.FEATURE_AI_PROVIDER = "false";

  assert.equal(isFeatureEnabled("aiProvider"), false);

  process.env.FEATURE_AI_PROVIDER = previous;
});

test("feature flag snapshot exposes all rollout switches", () => {
  const snapshot = getFeatureFlagSnapshot();

  assert.equal(typeof snapshot.aiProvider, "boolean");
  assert.equal(typeof snapshot.dbRecommendationRules, "boolean");
  assert.equal(typeof snapshot.analyticsPersistence, "boolean");
  assert.equal(typeof snapshot.marketingAutomation, "boolean");
  assert.equal(typeof snapshot.marketingAutopilot, "boolean");
  assert.equal(typeof snapshot.marketingContentAi, "boolean");
});
