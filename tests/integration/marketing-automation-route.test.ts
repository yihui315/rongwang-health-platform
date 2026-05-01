import test from "node:test";
import assert from "node:assert/strict";
import {
  GET as getMarketingAutomation,
  POST as postMarketingAutomation,
} from "@/app/api/marketing/automation/route";

async function withMarketingAutomationEnv<T>(fn: () => Promise<T>) {
  const previous = {
    adminToken: process.env.ADMIN_AUTH_TOKEN,
    featureMarketingAutomation: process.env.FEATURE_MARKETING_AUTOMATION,
    rateLimit: process.env.MARKETING_AUTOMATION_RATE_LIMIT,
    rateWindow: process.env.MARKETING_AUTOMATION_RATE_WINDOW_MS,
  };

  process.env.ADMIN_AUTH_TOKEN = "automation-admin";
  process.env.FEATURE_MARKETING_AUTOMATION = "true";
  process.env.MARKETING_AUTOMATION_RATE_LIMIT = "2";
  process.env.MARKETING_AUTOMATION_RATE_WINDOW_MS = "60000";

  try {
    return await fn();
  } finally {
    process.env.ADMIN_AUTH_TOKEN = previous.adminToken;
    process.env.FEATURE_MARKETING_AUTOMATION = previous.featureMarketingAutomation;
    process.env.MARKETING_AUTOMATION_RATE_LIMIT = previous.rateLimit;
    process.env.MARKETING_AUTOMATION_RATE_WINDOW_MS = previous.rateWindow;
  }
}

function marketingAutomationRequest(options: {
  token?: string;
  ip?: string;
  execute?: boolean;
}) {
  const headers = new Headers({ "content-type": "application/json" });
  if (options.token) {
    headers.set("x-admin-token", options.token);
  }
  if (options.ip) {
    headers.set("x-forwarded-for", options.ip);
  }

  return new Request("http://localhost/api/marketing/automation", {
    method: "POST",
    headers,
    body: JSON.stringify({
      objective: "seo_growth",
      audience: "long-term fatigue and unstable sleep office workers",
      solution: "sleep",
      keyword: "sleep support plan",
      campaignSlug: "sleep-seo-test",
      channels: ["seo_article", "wechat"],
      execute: options.execute,
    }),
  });
}

test("GET /api/marketing/automation returns automation capabilities", async () => {
  const response = await getMarketingAutomation();
  assert.equal(response.status, 200);

  const payload = await response.json();
  assert.equal(payload.success, true);
  assert.equal(payload.capabilities.assessmentFirst, true);
  assert.equal(Array.isArray(payload.capabilities.channels), true);
  assert.equal(typeof payload.geoFlow.configured, "boolean");
});

test("POST /api/marketing/automation rejects unauthenticated planning requests", async () => {
  await withMarketingAutomationEnv(async () => {
    const response = await postMarketingAutomation(
      marketingAutomationRequest({ ip: "198.51.100.20" }),
    );

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { success: false, error: "admin_required" });
  });
});

test("POST /api/marketing/automation returns an authorized dry-run campaign plan by default", async () => {
  await withMarketingAutomationEnv(async () => {
    const response = await postMarketingAutomation(
      marketingAutomationRequest({
        token: "automation-admin",
        ip: "198.51.100.21",
      }),
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.success, true);
    assert.equal(payload.mode, "dry_run");
    assert.equal(payload.plan.solutionSlug, "sleep");
    assert.match(payload.plan.primaryCta.href, /focus=sleep/);
    assert.equal(payload.plan.geoFlow.tasks.length, 1);
    const wechatAsset = payload.plan.assets.find((asset: { channel: string }) => asset.channel === "wechat");
    assert.equal(wechatAsset.wechatArticle.kind, "official_account_article");
    assert.match(wechatAsset.wechatArticle.markdown, /\/ai-consult\?focus=sleep/);
    assert.doesNotMatch(wechatAsset.wechatArticle.markdown, /\/products|\/checkout|\/product-map/);
    assert.equal(payload.wechatPublication.length, 1);
    assert.equal(payload.wechatPublication[0].status, "draft_only");
    assert.equal(payload.wechatPublication[0].publishAllowed, false);
  });
});

test("POST /api/marketing/automation rate limits authorized planning requests", async () => {
  await withMarketingAutomationEnv(async () => {
    const ip = "198.51.100.22";
    const first = await postMarketingAutomation(
      marketingAutomationRequest({ token: "automation-admin", ip }),
    );
    const second = await postMarketingAutomation(
      marketingAutomationRequest({ token: "automation-admin", ip }),
    );
    const third = await postMarketingAutomation(
      marketingAutomationRequest({ token: "automation-admin", ip }),
    );

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
    assert.deepEqual(await third.json(), { success: false, error: "rate_limited" });
  });
});
