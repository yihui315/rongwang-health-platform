import test from "node:test";
import assert from "node:assert/strict";
import {
  buildConsultErrorMessage,
  buildInvalidConsultResponseMessage,
} from "@/components/ai/consult-error-state";
import { getConsultStreamSteps } from "@/components/ai/consult-stream-state";

test("consult stream exposes stable analysis steps without final result data", () => {
  const steps = getConsultStreamSteps(1);

  assert.deepEqual(
    steps.map((step) => step.id),
    ["validate", "safety", "analysis", "recommend"],
  );
  assert.equal(steps[0].status, "active");
  assert.equal(steps[1].status, "active");
  assert.equal(steps[2].status, "pending");
});

test("consult errors classify rate limit and server failures for the UI", () => {
  assert.match(buildConsultErrorMessage(429), /频繁/);
  assert.match(buildConsultErrorMessage(500), /AI 服务/);
  assert.match(buildInvalidConsultResponseMessage(), /格式/);
});
