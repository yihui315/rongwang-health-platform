import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("public navigation exposes one assessment action and names solution content clearly", () => {
  const header = fs.readFileSync("src/components/layout/Header.tsx", "utf8");
  const miniProgramAssessment = fs.readFileSync("miniprogram/pages/assessment/index.wxml", "utf8");

  assert.match(header, /label: "AI评估"/);
  assert.match(header, /label: "健康方案"/);
  assert.match(header, /label: "官网商城"/);
  assert.doesNotMatch(header, /评估入口/);
  assert.doesNotMatch(header, /问题方案/);
  assert.doesNotMatch(miniProgramAssessment, /评估入口|入口说明/);
  assert.match(miniProgramAssessment, /AI 评估链接/);
});
