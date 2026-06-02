import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("admin dashboard exposes outbound queue manual review", () => {
  const adminPage = fs.readFileSync("src/app/admin/page.tsx", "utf8");

  assert.match(adminPage, /Outbound Queue/);
  assert.match(adminPage, /\/admin\/outbound-queue/);
  assert.match(adminPage, /blocked outbound sends/i);
});

test("outbound queue admin page is a read-only manual review surface", () => {
  const page = fs.readFileSync("src/app/admin/outbound-queue/page.tsx", "utf8");

  assert.match(page, /listOutboundQueue/);
  assert.match(page, /Manual review required/);
  assert.match(page, /Review history/);
  assert.match(page, /ALLOW_AUTOMATED_MARKETING_SEND/);
  assert.match(page, /automated_marketing_disabled/);
  assert.doesNotMatch(page, /sendNow|approveAndSend|markAsSent|fetch\(/);
});
