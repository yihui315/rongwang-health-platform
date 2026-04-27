import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFreeToolCompletionEvent,
  calculateFreeToolResult,
  freeToolSlugs,
  getFreeToolBySlug,
  listFreeTools,
} from "@/lib/marketing/free-tools";

test("free health tools are assessment-first and never product-first", () => {
  const tools = listFreeTools();

  assert.equal(tools.length >= 6, true);
  assert.equal(freeToolSlugs.includes("female-health-check"), true);

  for (const tool of tools) {
    assert.equal(tool.primaryCta.href.startsWith("/ai-consult"), true);
    assert.equal(tool.primaryCta.href.includes("/products"), false);
    assert.equal(tool.primaryCta.href.includes("/product-map"), false);
    assert.equal(tool.primaryCta.href.includes("/checkout"), false);
    assert.equal(tool.questions.length >= 4, true);
    assert.match(tool.disclaimer, /不构成医学诊断/);
    assert.equal(tool.scoreBands.some((band) => band.careFirst), true);
  }
});

test("female health free tool maps to canonical female health consult focus", () => {
  const tool = getFreeToolBySlug("female-health-check");

  assert.ok(tool);
  assert.equal(tool.solutionSlug, "female-health");
  assert.equal(tool.primaryCta.href, "/ai-consult?focus=female-health");
  assert.equal(tool.solutionHref, "/solutions/female-health");
});

test("free tool scoring returns education-only care-first result for high scores", () => {
  const tool = getFreeToolBySlug("sleep-score");
  assert.ok(tool);

  const result = calculateFreeToolResult(
    tool,
    Object.fromEntries(tool.questions.map((question) => [question.id, 2])),
  );

  assert.equal(result.band.careFirst, true);
  assert.equal(result.primaryCta.href, "/ai-consult?focus=sleep");
  assert.match(result.nextStep, /医生|药师|AI 评估/);
});

test("free tool completion event is attribution-ready and assessment-first", () => {
  const tool = getFreeToolBySlug("sleep-score");
  assert.ok(tool);

  const result = calculateFreeToolResult(
    tool,
    Object.fromEntries(tool.questions.map((question) => [question.id, 1])),
  );
  const event = buildFreeToolCompletionEvent(tool, result, { source: "tools-page" });

  assert.equal(event.name, "tool_completed");
  assert.equal(event.source, "tools-page");
  assert.equal(event.solutionSlug, "sleep");
  assert.equal(event.metadata?.toolSlug, "sleep-score");
  assert.equal(event.metadata?.score, result.score);
  assert.equal(event.metadata?.scoreBand, result.band.id);
  assert.equal(event.metadata?.primaryCtaHref, "/ai-consult?focus=sleep");
  assert.equal(String(event.metadata?.primaryCtaHref).includes("/products"), false);
  assert.equal(String(event.metadata?.primaryCtaHref).includes("/checkout"), false);
});

test("free tool completion event carries session, ref and UTM attribution", () => {
  const tool = getFreeToolBySlug("female-health-check");
  assert.ok(tool);

  const result = calculateFreeToolResult(
    tool,
    Object.fromEntries(tool.questions.map((question) => [question.id, 0])),
  );
  const event = buildFreeToolCompletionEvent(tool, result, {
    source: "tools-page",
    sessionId: "session-123",
    ref: "xiaohongshu",
    utm: {
      source: "xhs",
      medium: "organic",
      campaign: "female-health-tool",
    },
  });

  assert.equal(event.sessionId, "session-123");
  assert.equal(event.metadata?.ref, "xiaohongshu");
  assert.deepEqual(event.metadata?.utm, {
    source: "xhs",
    medium: "organic",
    campaign: "female-health-tool",
  });
});
