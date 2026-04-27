import test from "node:test";
import assert from "node:assert/strict";
import {
  GET as getMarketingAutopilot,
  POST as postMarketingAutopilot,
} from "@/app/api/marketing/autopilot/route";

async function withIsolatedEnv<T>(fn: () => Promise<T>) {
  const previous = {
    databaseUrl: process.env.DATABASE_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    adminToken: process.env.ADMIN_AUTH_TOKEN,
    featureMarketingAutomation: process.env.FEATURE_MARKETING_AUTOMATION,
    featureMarketingAutopilot: process.env.FEATURE_MARKETING_AUTOPILOT,
    marketingAutopilotExecute: process.env.MARKETING_AUTOPILOT_EXECUTE,
    rateLimit: process.env.MARKETING_AUTOPILOT_RATE_LIMIT,
    rateWindow: process.env.MARKETING_AUTOPILOT_RATE_WINDOW_MS,
  };

  delete process.env.DATABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.ADMIN_AUTH_TOKEN = "route-admin";
  process.env.FEATURE_MARKETING_AUTOMATION = "true";
  process.env.FEATURE_MARKETING_AUTOPILOT = "true";
  process.env.MARKETING_AUTOPILOT_EXECUTE = "false";
  process.env.MARKETING_AUTOPILOT_RATE_LIMIT = "2";
  process.env.MARKETING_AUTOPILOT_RATE_WINDOW_MS = "60000";

  try {
    return await fn();
  } finally {
    process.env.DATABASE_URL = previous.databaseUrl;
    process.env.NEXT_PUBLIC_SUPABASE_URL = previous.supabaseUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previous.supabaseKey;
    process.env.SUPABASE_SERVICE_ROLE_KEY = previous.supabaseServiceKey;
    process.env.ADMIN_AUTH_TOKEN = previous.adminToken;
    process.env.FEATURE_MARKETING_AUTOMATION = previous.featureMarketingAutomation;
    process.env.FEATURE_MARKETING_AUTOPILOT = previous.featureMarketingAutopilot;
    process.env.MARKETING_AUTOPILOT_EXECUTE = previous.marketingAutopilotExecute;
    process.env.MARKETING_AUTOPILOT_RATE_LIMIT = previous.rateLimit;
    process.env.MARKETING_AUTOPILOT_RATE_WINDOW_MS = previous.rateWindow;
  }
}

function marketingAutopilotRequest(options: {
  token?: string;
  ip?: string;
  solution?: string;
  execute?: boolean;
}) {
  const headers = new Headers({ "content-type": "application/json" });
  if (options.token) {
    headers.set("x-admin-token", options.token);
  }
  if (options.ip) {
    headers.set("x-forwarded-for", options.ip);
  }

  return new Request("http://localhost/api/marketing/autopilot", {
    method: "POST",
    headers,
    body: JSON.stringify({
      objective: "seo_growth",
      audience: "health education content visitors",
      solution: options.solution ?? "sleep",
      keyword: "sleep support plan",
      execute: options.execute,
    }),
  });
}

test("GET /api/marketing/autopilot returns GEO and AI marketing capabilities", async () => {
  await withIsolatedEnv(async () => {
    const response = await getMarketingAutopilot();
    assert.equal(response.status, 200);

    const payload = await response.json();
    assert.equal(payload.success, true);
    assert.equal(payload.capabilities.geoDeepIntegration, true);
    assert.equal(payload.capabilities.growthPlaybooks, true);
    assert.equal(payload.capabilities.defaultMode, "dry_run");
    assert.equal(payload.capabilities.playbooks.includes("free_tool"), true);
    assert.equal(typeof payload.geoFlow.configured, "boolean");
  });
});

test("POST /api/marketing/autopilot rejects unauthenticated planning requests", async () => {
  await withIsolatedEnv(async () => {
    const response = await postMarketingAutopilot(
      marketingAutopilotRequest({ ip: "203.0.113.40" }),
    );

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { success: false, error: "admin_required" });
  });
});

test("POST /api/marketing/autopilot returns an authorized dry-run run by default", async () => {
  await withIsolatedEnv(async () => {
    const response = await postMarketingAutopilot(
      marketingAutopilotRequest({
        token: "route-admin",
        ip: "203.0.113.41",
      }),
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.success, true);
    assert.equal(payload.mode, "dry_run");
    assert.equal(payload.run.focusSolution, "sleep");
    assert.equal(payload.run.campaigns[0].primaryCta.href.startsWith("/ai-consult?focus=sleep"), true);
    assert.equal(
      payload.run.playbooks.some(
        (entry: { playbook: { id: string } }) => entry.playbook.id === "aeo_geo_cluster",
      ),
      true,
    );
  });
});

test("POST /api/marketing/autopilot rate limits authorized planning requests", async () => {
  await withIsolatedEnv(async () => {
    const ip = "203.0.113.42";
    const first = await postMarketingAutopilot(
      marketingAutopilotRequest({ token: "route-admin", ip }),
    );
    const second = await postMarketingAutopilot(
      marketingAutopilotRequest({ token: "route-admin", ip }),
    );
    const third = await postMarketingAutopilot(
      marketingAutopilotRequest({ token: "route-admin", ip }),
    );

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
    assert.deepEqual(await third.json(), { success: false, error: "rate_limited" });
  });
});

test("POST /api/marketing/autopilot still requires admin authorization for execute mode", async () => {
  await withIsolatedEnv(async () => {
    const response = await postMarketingAutopilot(
      marketingAutopilotRequest({
        ip: "203.0.113.43",
        solution: "female-health",
        execute: true,
      }),
    );

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { success: false, error: "admin_required" });
  });
});
