import test from "node:test";
import assert from "node:assert/strict";
import { summarizeAnalyticsEvents, type AnalyticsEventListItem } from "@/lib/data/analytics-events";

test("analytics summary counts MVP conversion metrics", () => {
  const rows: AnalyticsEventListItem[] = [
    { id: "1", name: "assessment_started", createdAt: "2026-04-26T00:00:00.000Z", source: "home" },
    { id: "2", name: "assessment_started", createdAt: "2026-04-26T00:01:00.000Z", source: "home" },
    { id: "3", name: "assessment_completed", createdAt: "2026-04-26T00:02:00.000Z", source: "ai-consult" },
    { id: "4", name: "recommendation_clicked", createdAt: "2026-04-26T00:03:00.000Z", source: "ai-consult" },
    { id: "5", name: "pdd_redirect_clicked", createdAt: "2026-04-26T00:04:00.000Z", source: "product-map" },
    { id: "6", name: "tool_completed", createdAt: "2026-04-26T00:05:00.000Z", source: "tools-page" },
    { id: "7", name: "tool_completed", createdAt: "2026-04-26T00:06:00.000Z", source: "tools-page" },
    { id: "8", name: "tool_completed", createdAt: "2026-04-26T00:07:00.000Z", source: "tools-page" },
    { id: "9", name: "tool_completed", createdAt: "2026-04-26T00:08:00.000Z", source: "tools-page" },
  ];

  const summary = summarizeAnalyticsEvents(rows);

  assert.equal(summary.total, 9);
  assert.equal(summary.byName.assessment_started, 2);
  assert.equal(summary.byName.assessment_completed, 1);
  assert.equal(summary.byName.recommendation_clicked, 1);
  assert.equal(summary.byName.pdd_redirect_clicked, 1);
  assert.equal(summary.byName.tool_completed, 4);
  assert.equal(summary.completionRate, 0.5);
  assert.equal(summary.recommendationClickRate, 1);
  assert.equal(summary.pddRedirectRate, 1);
  assert.equal(summary.toolToAssessmentRate, 0.5);
});
