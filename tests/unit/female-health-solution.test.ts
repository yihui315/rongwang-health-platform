import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalSolutionSlugs,
  normalizeSolutionSlug,
  solutionSlugToType,
  solutionTypeToSlug,
} from "@/lib/health/mappings";
import { solutionGuides, getSolutionGuideBySlug } from "@/lib/health/solutions";
import { solutionTypeSchema } from "@/schemas/ai-result";

test("female health is a canonical AI-first solution route", () => {
  assert.ok(canonicalSolutionSlugs.includes("female-health"));
  assert.equal(solutionTypeSchema.parse("female_health"), "female_health");
  assert.equal(solutionTypeToSlug("female_health"), "female-health");
  assert.equal(solutionSlugToType("female-health"), "female_health");
  assert.equal(normalizeSolutionSlug("female_health"), "female-health");
  assert.equal(normalizeSolutionSlug("women-health"), "female-health");
});

test("female health guide has enough educational page content", () => {
  const guide = getSolutionGuideBySlug("female-health");

  assert.ok(guide);
  assert.equal(guide.solutionType, "female_health");
  assert.equal(guide.slug, "female-health");
  assert.match(guide.title, /女性健康/);
  assert.ok(guide.commonSymptoms.length >= 4);
  assert.ok(guide.commonCauses.length >= 4);
  assert.ok(guide.seekCareSignals.length >= 4);
  assert.ok(guide.baselinePlan.length >= 4);
  assert.ok(guide.supplementDirections.length >= 3);
  assert.ok(guide.otcDirections.length >= 1);
  assert.equal(solutionGuides.some((item) => item.slug === "female-health"), true);
});
