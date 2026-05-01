import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("WeChat operations runbook documents installed skills, PDD fallback, and auto-publish guardrails", () => {
  const runbook = fs.readFileSync("docs/wechat-ops-runbook.md", "utf8");
  const miniProgramPlan = fs.readFileSync("docs/wechat-miniprogram-mvp.md", "utf8");
  const adminMarketing = fs.readFileSync("src/app/admin/marketing/page.tsx", "utf8");

  assert.match(runbook, /miniprogram-development/);
  assert.match(runbook, /auth-wechat-miniprogram/);
  assert.match(runbook, /wechatpay-basic-payment/);
  assert.match(runbook, /WECHAT_AUTO_PUBLISH=false/);
  assert.match(runbook, /PDD_SHORT_LINK_MODE/);
  assert.match(miniProgramPlan, /PDD_MINIPROGRAM_APPID/);
  assert.match(miniProgramPlan, /navigateToMiniProgram/);
  assert.match(adminMarketing, /PDD Redirect/);
  assert.match(adminMarketing, /wechatPublication/);
});
