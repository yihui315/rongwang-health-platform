import test from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "@/lib/health/rate-limit";

test("rate limit allows requests until the configured window limit", async () => {
  const key = `unit:allow:${Date.now()}:${Math.random()}`;

  const first = await checkRateLimit(key, 2, 60_000);
  const second = await checkRateLimit(key, 2, 60_000);

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
});

test("rate limit blocks requests after the configured window limit", async () => {
  const key = `unit:block:${Date.now()}:${Math.random()}`;

  await checkRateLimit(key, 1, 60_000);
  const blocked = await checkRateLimit(key, 1, 60_000);

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.resetAt > Date.now());
});
