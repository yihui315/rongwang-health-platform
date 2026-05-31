import assert from "node:assert/strict";
import { test } from "node:test";

import {
  describeDraftLayoutGroupResult,
  describeDraftLayoutResult,
  resolveTextLayoutPolicy,
} from "../src/lib/text-layout-policy";

test("text layout policy reserves the target line box before browser measurement", () => {
  const policy = resolveTextLayoutPolicy(null, { lineHeight: 24, maxLines: 3 });

  assert.equal(policy.state, "unmeasured");
  assert.equal(policy.isOverflowing, false);
  assert.equal(policy.lineCount, 0);
  assert.equal(policy.targetHeight, 72);
});

test("text layout policy marks measured copy that fits the target lines", () => {
  const policy = resolveTextLayoutPolicy({ lineCount: 2, height: 48 }, { lineHeight: 24, maxLines: 3 });

  assert.equal(policy.state, "fit");
  assert.equal(policy.isOverflowing, false);
  assert.equal(policy.lineCount, 2);
  assert.equal(policy.targetHeight, 72);
});

test("text layout policy distinguishes a near miss from content that needs clamping", () => {
  const tight = resolveTextLayoutPolicy({ lineCount: 4, height: 96 }, { lineHeight: 24, maxLines: 3 });
  const clamped = resolveTextLayoutPolicy({ lineCount: 6, height: 144 }, { lineHeight: 24, maxLines: 3 });

  assert.equal(tight.state, "tight");
  assert.equal(tight.isOverflowing, true);
  assert.equal(clamped.state, "clamped");
  assert.equal(clamped.isOverflowing, true);
});

test("draft layout result gives operators actionable preview copy", () => {
  const unmeasured = describeDraftLayoutResult(resolveTextLayoutPolicy(null, { lineHeight: 24, maxLines: 3 }));
  const fit = describeDraftLayoutResult(resolveTextLayoutPolicy({ lineCount: 2, height: 48 }, { lineHeight: 24, maxLines: 3 }));
  const tight = describeDraftLayoutResult(resolveTextLayoutPolicy({ lineCount: 4, height: 96 }, { lineHeight: 24, maxLines: 3 }));
  const clamped = describeDraftLayoutResult(resolveTextLayoutPolicy({ lineCount: 6, height: 144 }, { lineHeight: 24, maxLines: 3 }));

  assert.equal(unmeasured.tone, "neutral");
  assert.match(unmeasured.label, /等待测量/);
  assert.equal(fit.tone, "success");
  assert.match(fit.label, /预计 2 行/);
  assert.equal(tight.tone, "warning");
  assert.match(tight.label, /建议压缩/);
  assert.equal(clamped.tone, "danger");
  assert.match(clamped.label, /必须压缩/);
});

test("draft layout group result summarizes a batch of operator review copy", () => {
  const fit = resolveTextLayoutPolicy({ lineCount: 2, height: 48 }, { lineHeight: 24, maxLines: 3 });
  const tight = resolveTextLayoutPolicy({ lineCount: 4, height: 96 }, { lineHeight: 24, maxLines: 3 });
  const clamped = resolveTextLayoutPolicy({ lineCount: 6, height: 144 }, { lineHeight: 24, maxLines: 3 });

  const pending = describeDraftLayoutGroupResult([fit], 3);
  const allFit = describeDraftLayoutGroupResult([fit, fit, fit], 3);
  const needsTrim = describeDraftLayoutGroupResult([fit, tight, fit], 3);
  const mustTrim = describeDraftLayoutGroupResult([fit, tight, clamped], 3);

  assert.equal(pending.tone, "neutral");
  assert.match(pending.label, /已测量 1\/3 条/);
  assert.equal(allFit.tone, "success");
  assert.match(allFit.label, /3 条草稿均适配/);
  assert.equal(needsTrim.tone, "warning");
  assert.match(needsTrim.label, /1 条建议压缩/);
  assert.equal(mustTrim.tone, "danger");
  assert.match(mustTrim.label, /1 条必须压缩/);
  assert.equal(mustTrim.overflowCount, 2);
});
