import test from "node:test";
import assert from "node:assert/strict";
import { getAiConsultHrefForValue } from "@/lib/health/consult-entry";

test("canonical health focus values preserve the consult focus query", () => {
  assert.equal(getAiConsultHrefForValue("sleep"), "/ai-consult?focus=sleep");
  assert.equal(getAiConsultHrefForValue("male_health"), "/ai-consult?focus=male-health");
  assert.equal(getAiConsultHrefForValue("female_health"), "/ai-consult?focus=female-health");
  assert.equal(getAiConsultHrefForValue("women-health"), "/ai-consult?focus=female-health");
  assert.equal(getAiConsultHrefForValue("sleep-support"), "/ai-consult?focus=sleep");
});

test("non-canonical legacy plan values enter consult without focus", () => {
  assert.equal(getAiConsultHrefForValue("stress"), "/ai-consult");
  assert.equal(getAiConsultHrefForValue("beauty"), "/ai-consult");
  assert.equal(getAiConsultHrefForValue("cardio"), "/ai-consult");
});
