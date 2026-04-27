import test from "node:test";
import assert from "node:assert/strict";
import { readAttributionCookies } from "@/lib/attribution";

test("attribution cookies expose session, ref, and UTM context", () => {
  const utm = encodeURIComponent(JSON.stringify({
    source: "xiaohongshu",
    medium: "social",
    campaign: "sleep",
  }));
  const result = readAttributionCookies(
    `rw_session=sess_123; rw_ref=creator-a; rw_utm=${utm}`,
  );

  assert.equal(result.sessionId, "sess_123");
  assert.equal(result.ref, "creator-a");
  assert.deepEqual(result.utm, {
    source: "xiaohongshu",
    medium: "social",
    campaign: "sleep",
  });
});

test("invalid UTM cookies do not break attribution parsing", () => {
  const result = readAttributionCookies("rw_session=sess_123; rw_utm=not-json");

  assert.equal(result.sessionId, "sess_123");
  assert.equal(result.utm, undefined);
});
