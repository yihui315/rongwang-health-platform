import test from "node:test";
import assert from "node:assert/strict";
import { GET as llmsGet } from "@/app/llms.txt/route";

test("GET /llms.txt exposes AI-readable site map and health disclaimers", async () => {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://rongwang.hk";

  try {
    const response = llmsGet();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");

    const text = await response.text();
    assert.match(text, /Rongwang Health/);
    assert.match(text, /https:\/\/rongwang\.hk\/ai-consult/);
    assert.match(text, /female-health/);
    assert.match(text, /does not provide medical diagnosis/i);
    assert.match(text, /urgent scenarios/i);
  } finally {
    if (previousSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    }
  }
});
