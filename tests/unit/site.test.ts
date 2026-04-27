import test from "node:test";
import assert from "node:assert/strict";
import { createCanonicalUrl, getSiteUrl } from "@/lib/site";

test("site url removes trailing slash from environment value", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";

  assert.equal(getSiteUrl(), "https://example.com");
  assert.equal(createCanonicalUrl("/ai-consult"), "https://example.com/ai-consult");

  process.env.NEXT_PUBLIC_SITE_URL = previous;
});

test("canonical url defaults to Rongwang production domain", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;

  assert.equal(createCanonicalUrl("solutions/sleep"), "https://rongwang.health/solutions/sleep");

  process.env.NEXT_PUBLIC_SITE_URL = previous;
});
