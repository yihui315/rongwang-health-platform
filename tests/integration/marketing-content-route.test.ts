import test from "node:test";
import assert from "node:assert/strict";
import { POST as postMarketingContent } from "@/app/api/marketing/content/route";

async function withMarketingContentEnv<T>(fn: () => Promise<T>) {
  const previous = {
    adminToken: process.env.ADMIN_AUTH_TOKEN,
    featureMarketingContentAi: process.env.FEATURE_MARKETING_CONTENT_AI,
    rateLimit: process.env.MARKETING_CONTENT_RATE_LIMIT,
    rateWindow: process.env.MARKETING_CONTENT_RATE_WINDOW_MS,
  };

  process.env.ADMIN_AUTH_TOKEN = "content-admin";
  process.env.FEATURE_MARKETING_CONTENT_AI = "false";
  process.env.MARKETING_CONTENT_RATE_LIMIT = "2";
  process.env.MARKETING_CONTENT_RATE_WINDOW_MS = "60000";

  try {
    return await fn();
  } finally {
    process.env.ADMIN_AUTH_TOKEN = previous.adminToken;
    process.env.FEATURE_MARKETING_CONTENT_AI = previous.featureMarketingContentAi;
    process.env.MARKETING_CONTENT_RATE_LIMIT = previous.rateLimit;
    process.env.MARKETING_CONTENT_RATE_WINDOW_MS = previous.rateWindow;
  }
}

function contentRequest(options: {
  token?: string;
  ip?: string;
  channel?: string;
  topic?: string;
}) {
  const headers = new Headers({ "content-type": "application/json" });
  if (options.token) {
    headers.set("x-admin-token", options.token);
  }
  if (options.ip) {
    headers.set("x-forwarded-for", options.ip);
  }

  return new Request("http://localhost/api/marketing/content", {
    method: "POST",
    headers,
    body: JSON.stringify({
      channel: options.channel ?? "blog",
      topic: options.topic ?? "sleep support",
      count: 1,
    }),
  });
}

test("POST /api/marketing/content rejects unauthenticated requests before AI generation", async () => {
  await withMarketingContentEnv(async () => {
    const response = await postMarketingContent(contentRequest({ ip: "203.0.113.10" }));

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { success: false, error: "admin_required" });
  });
});

test("POST /api/marketing/content allows authorized dry-run fallback generation", async () => {
  await withMarketingContentEnv(async () => {
    const response = await postMarketingContent(
      contentRequest({ token: "content-admin", ip: "203.0.113.11" }),
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.channel, "blog");
    assert.equal(payload.source, "fallback");
    assert.equal(payload.count, 1);
    assert.equal(Array.isArray(payload.items), true);
    assert.equal(payload.items[0].ctaHref.startsWith("/ai-consult"), true);
  });
});

test("POST /api/marketing/content rate limits authorized generation attempts", async () => {
  await withMarketingContentEnv(async () => {
    const ip = "203.0.113.12";
    const first = await postMarketingContent(contentRequest({ token: "content-admin", ip }));
    const second = await postMarketingContent(contentRequest({ token: "content-admin", ip }));
    const third = await postMarketingContent(contentRequest({ token: "content-admin", ip }));

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
    assert.deepEqual(await third.json(), { success: false, error: "rate_limited" });
  });
});

