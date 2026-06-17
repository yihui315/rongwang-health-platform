import test from "node:test";
import assert from "node:assert/strict";
import { scanText } from "../../scripts/compliance-copy-lint.mjs";

test("compliance copy linter catches prohibited marketing claims", () => {
  const findings = scanText("这款产品可以治疗失眠，并且保证清关。");

  assert.equal(findings.length, 1);
  assert.deepEqual(findings[0]?.terms, ["治疗", "治疗失眠", "保证清关"]);
  assert.ok(findings[0]?.alternatives.includes("健康教育"));
  assert.ok(findings[0]?.alternatives.includes("透明履约"));
});

test("compliance copy linter allows safer alternatives", () => {
  const findings = scanText(
    "本页面用于健康教育、风险分层和营养支持方向判断，跨境履约透明且物流可追踪。",
  );

  assert.equal(findings.length, 0);
});

test("compliance copy linter allows boundary disclaimers", () => {
  const findings = scanText(
    "本评估不构成诊断、治疗或处方建议，也不替代医生或药师的专业意见。",
  );

  assert.equal(findings.length, 0);
});

test("compliance copy linter supports intentional allow comments", () => {
  const findings = scanText(
    [
      "// compliance-copy-allow: documenting a forbidden example in compliance docs",
      "禁止使用“抗癌”作为营销文案。",
    ].join("\n"),
  );

  assert.equal(findings.length, 0);
});
