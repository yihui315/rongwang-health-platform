import test from "node:test";
import assert from "node:assert/strict";
import { createAnalyticsEvent } from "@/lib/analytics";

test("analytics events accept the four MVP conversion metrics", () => {
  const eventNames = [
    "assessment_started",
    "assessment_completed",
    "recommendation_clicked",
    "pdd_redirect_clicked",
    "tool_completed",
    "marketing_autopilot_run",
  ] as const;

  for (const name of eventNames) {
    assert.equal(createAnalyticsEvent({ name }).name, name);
  }
});

test("analytics events reject unknown metric names", () => {
  assert.throws(() =>
    createAnalyticsEvent({
      // @ts-expect-error - this intentionally verifies runtime validation.
      name: "unknown_metric",
    }),
  );
});
