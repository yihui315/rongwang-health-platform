import test from "node:test";
import assert from "node:assert/strict";
import { POST as postMarketingEmail } from "@/app/api/marketing/email/route";
import { POST as postMarketingLanding } from "@/app/api/marketing/landing/route";

async function withLegacyGeneratorEnv<T>(fn: () => Promise<T>) {
  const previous = {
    adminToken: process.env.ADMIN_AUTH_TOKEN,
    featureMarketingAutomation: process.env.FEATURE_MARKETING_AUTOMATION,
    featureMarketingEmailAi: process.env.FEATURE_MARKETING_EMAIL_AI,
    featureMarketingLandingAi: process.env.FEATURE_MARKETING_LANDING_AI,
    emailLimit: process.env.MARKETING_EMAIL_RATE_LIMIT,
    emailWindow: process.env.MARKETING_EMAIL_RATE_WINDOW_MS,
    landingLimit: process.env.MARKETING_LANDING_RATE_LIMIT,
    landingWindow: process.env.MARKETING_LANDING_RATE_WINDOW_MS,
  };

  process.env.ADMIN_AUTH_TOKEN = "legacy-generator-admin";
  process.env.FEATURE_MARKETING_AUTOMATION = "true";
  process.env.FEATURE_MARKETING_EMAIL_AI = "false";
  process.env.FEATURE_MARKETING_LANDING_AI = "false";
  process.env.MARKETING_EMAIL_RATE_LIMIT = "2";
  process.env.MARKETING_EMAIL_RATE_WINDOW_MS = "60000";
  process.env.MARKETING_LANDING_RATE_LIMIT = "2";
  process.env.MARKETING_LANDING_RATE_WINDOW_MS = "60000";

  try {
    return await fn();
  } finally {
    process.env.ADMIN_AUTH_TOKEN = previous.adminToken;
    process.env.FEATURE_MARKETING_AUTOMATION = previous.featureMarketingAutomation;
    process.env.FEATURE_MARKETING_EMAIL_AI = previous.featureMarketingEmailAi;
    process.env.FEATURE_MARKETING_LANDING_AI = previous.featureMarketingLandingAi;
    process.env.MARKETING_EMAIL_RATE_LIMIT = previous.emailLimit;
    process.env.MARKETING_EMAIL_RATE_WINDOW_MS = previous.emailWindow;
    process.env.MARKETING_LANDING_RATE_LIMIT = previous.landingLimit;
    process.env.MARKETING_LANDING_RATE_WINDOW_MS = previous.landingWindow;
  }
}

function emailRequest(options: { token?: string; ip?: string }) {
  const headers = new Headers({ "content-type": "application/json" });
  if (options.token) {
    headers.set("x-admin-token", options.token);
  }
  if (options.ip) {
    headers.set("x-forwarded-for", options.ip);
  }

  return new Request("http://localhost/api/marketing/email", {
    method: "POST",
    headers,
    body: JSON.stringify({
      audience: "sleep support subscribers",
      scenario: "completed assessment without clicking recommendations",
    }),
  });
}

function landingRequest(options: { token?: string; ip?: string }) {
  const headers = new Headers({ "content-type": "application/json" });
  if (options.token) {
    headers.set("x-admin-token", options.token);
  }
  if (options.ip) {
    headers.set("x-forwarded-for", options.ip);
  }

  return new Request("http://localhost/api/marketing/landing", {
    method: "POST",
    headers,
    body: JSON.stringify({
      keyword: "sleep support",
      audience: "health education visitors",
      intent: "inform",
    }),
  });
}

test("POST /api/marketing/email rejects unauthenticated generation requests", async () => {
  await withLegacyGeneratorEnv(async () => {
    const response = await postMarketingEmail(emailRequest({ ip: "192.0.2.30" }) as never);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { success: false, error: "admin_required" });
  });
});

test("POST /api/marketing/email returns authorized fallback when AI is disabled", async () => {
  await withLegacyGeneratorEnv(async () => {
    const response = await postMarketingEmail(
      emailRequest({ token: "legacy-generator-admin", ip: "192.0.2.31" }) as never,
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.source, "fallback");
    assert.equal(payload.email.ctaHref, "/ai-consult");
  });
});

test("POST /api/marketing/landing rejects unauthenticated generation requests", async () => {
  await withLegacyGeneratorEnv(async () => {
    const response = await postMarketingLanding(landingRequest({ ip: "192.0.2.32" }) as never);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { success: false, error: "admin_required" });
  });
});

test("POST /api/marketing/landing returns authorized fallback when AI is disabled", async () => {
  await withLegacyGeneratorEnv(async () => {
    const response = await postMarketingLanding(
      landingRequest({ token: "legacy-generator-admin", ip: "192.0.2.33" }) as never,
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.source, "fallback");
    assert.equal(payload.landing.hero.ctaPrimary.includes("AI"), true);
  });
});
