import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.env.SMOKE_PORT || 4312);
const baseUrl = `http://127.0.0.1:${port}`;
const nextCli = path.resolve("node_modules", "next", "dist", "bin", "next");

const server = spawn(
  process.execPath,
  [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: baseUrl,
      ADMIN_AUTH_TOKEN: "smoke-admin",
      FEATURE_AI_PROVIDER: "false",
      FEATURE_ANALYTICS_PERSISTENCE: "false",
      FEATURE_DB_RECOMMENDATION_RULES: "false",
      FEATURE_MARKETING_AUTOMATION: "true",
      FEATURE_MARKETING_AUTOPILOT: "true",
      MARKETING_AUTO_PUBLISH_GEOFLOW: "false",
      MARKETING_AUTOPILOT_EXECUTE: "false",
      DATABASE_URL: "",
      DIRECT_URL: "",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
      REDIS_REST_URL: "",
      REDIS_REST_TOKEN: "",
      REDIS_URL: "",
      REDIS_TOKEN: "",
    },
  },
);

let logs = "";
let exitCode = null;

server.stdout.on("data", (chunk) => {
  logs += chunk.toString();
});

server.stderr.on("data", (chunk) => {
  logs += chunk.toString();
});

server.on("exit", (code) => {
  exitCode = code;
});

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(options.timeout ?? 5000),
  });
}

async function waitForServer() {
  const deadline = Date.now() + 30000;
  let lastError;

  while (Date.now() < deadline) {
    if (exitCode !== null) {
      throw new Error(`next start exited early with code ${exitCode}\n${logs}`);
    }

    try {
      const response = await fetchWithTimeout(baseUrl, { timeout: 1500 });
      if (response.status < 500) {
        return;
      }
      lastError = new Error(`Unexpected status while waiting: ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for next start: ${lastError?.message ?? "unknown"}\n${logs}`);
}

async function getText(pathname, options = {}) {
  const response = await fetchWithTimeout(`${baseUrl}${pathname}`, options);
  const text = await response.text();
  return { response, text };
}

function assertRedirect(response, expectedPath, expectedSearch = "") {
  assert.equal(response.status, 307);
  const location = response.headers.get("location");
  assert.ok(location, "Expected redirect location header");
  const url = new URL(location, baseUrl);
  assert.equal(url.pathname, expectedPath);
  assert.equal(url.search, expectedSearch);
}

async function postJson(pathname, body, options = {}) {
  const response = await fetchWithTimeout(`${baseUrl}${pathname}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
  return { response, json: await response.json() };
}

async function createAdminSession(token) {
  const response = await fetchWithTimeout(`${baseUrl}/api/admin/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
  });
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie");
  assert.ok(cookie, "Expected admin session cookie");
  return cookie.split(";")[0];
}

async function getJson(pathname) {
  const response = await fetchWithTimeout(`${baseUrl}${pathname}`);
  return { response, json: await response.json() };
}

async function postEventStream(pathname, body) {
  const response = await fetchWithTimeout(`${baseUrl}${pathname}`, {
    method: "POST",
    headers: {
      accept: "text/event-stream",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return { response, text: await response.text() };
}

const standardProfile = {
  age: 36,
  gender: "male",
  symptoms: ["容易疲劳", "熬夜后不适"],
  duration: "1 到 4 周",
  lifestyle: {
    sleep: "经常熬夜或睡眠不足",
    alcohol: false,
    smoking: false,
    exercise: "每周 1 到 2 次",
  },
  goal: "改善白天精力",
  medications: "",
  allergies: "",
};

async function stopServer() {
  if (server.exitCode !== null) {
    return;
  }

  server.kill();
  await Promise.race([
    once(server, "exit"),
    delay(5000).then(() => {
      if (server.exitCode === null) {
        server.kill("SIGKILL");
      }
    }),
  ]);
}

async function runSmokeChecks() {
  await waitForServer();

  {
    const { response, text } = await getText("/");
    assert.equal(response.status, 200);
    assert.match(text, /3 分钟 AI 健康评估/);
    assert.match(text, /\/tools\/sleep-score/);
  }

  {
    const { response, json } = await getJson("/api/health");
    assert.equal(response.status, 200);
    assert.equal(json.ok, true);
    assert.equal(json.service, "rongwang-health-platform");
  }

  {
    const { response, text } = await getText("/ai-consult?focus=sleep");
    assert.equal(response.status, 200);
    assert.match(text, /AI 健康咨询 \| 荣旺健康/);
  }

  {
    const { response, text } = await getText("/tools/female-health-check");
    assert.equal(response.status, 200);
    assert.match(text, /AI/);
    assert.match(text, /女性健康支持自测/);
    assert.match(text, /计算自测结果/);
  }

  {
    const { response } = await getText("/quiz?pre=stress", { redirect: "manual" });
    assertRedirect(response, "/ai-consult");
  }

  {
    const { response } = await getText("/quiz?focus=sleep", { redirect: "manual" });
    assertRedirect(response, "/ai-consult", "?focus=sleep");
  }

  {
    const { response } = await getText("/admin", { redirect: "manual" });
    assertRedirect(response, "/admin/login");
  }

  {
    const adminCookie = await createAdminSession("smoke-admin");
    const { response, text } = await getText("/admin", {
      headers: { cookie: adminCookie },
    });
    assert.equal(response.status, 200);
    assert.match(text, /Operations Dashboard/);

    const marketing = await getText("/admin/marketing", {
      headers: { cookie: adminCookie },
    });
    const { response: marketingResponse, text: marketingText } = marketing;
    assert.equal(marketingResponse.status, 200);
    assert.match(marketingText, /Marketing Automation/);
  }

  {
    const { response, text } = await getText("/admin/login");
    assert.equal(response.status, 200);
    assert.match(text, /Secure admin login/);
  }

  {
    const { response, json } = await getJson("/api/marketing/automation");
    assert.equal(response.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.capabilities.assessmentFirst, true);
  }

  {
    const { response, json } = await getJson("/api/marketing/autopilot");
    assert.equal(response.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.capabilities.geoDeepIntegration, true);
    assert.equal(json.capabilities.growthPlaybooks, true);
  }

  {
    const { response, json } = await postJson("/api/marketing/automation", {
      objective: "assessment_conversion",
      audience: "smoke users",
      solution: "sleep",
      keyword: "sleep support",
      campaignSlug: "smoke-marketing",
      channels: ["seo_article", "email"],
    }, {
      headers: { "x-admin-token": "smoke-admin" },
    });
    assert.equal(response.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.mode, "dry_run");
    assert.equal(json.plan.geoFlow.tasks.length, 1);
  }

  {
    const { response, json } = await postJson("/api/marketing/autopilot", {
      objective: "seo_growth",
      audience: "smoke users",
      solution: "female-health",
      keyword: "female health support",
      campaignSlug: "smoke-autopilot",
      channels: ["seo_article", "email"],
    }, {
      headers: { "x-admin-token": "smoke-admin" },
    });
    assert.equal(response.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.mode, "dry_run");
    assert.equal(json.run.focusSolution, "female-health");
    assert.equal(json.run.playbooks.some((entry) => entry.playbook.id === "aeo_geo_cluster"), true);
  }

  {
    const { response, text } = await getText("/product-map/msr-nadh-tipsynox?source=smoke&solution=liver");
    assert.equal(response.status, 200);
    assert.match(text, /购买中转页/);
  }

  {
    const { response, json } = await postJson("/api/ai/consult", { profile: standardProfile });
    assert.equal(response.status, 200);
    assert.ok(json.consultationId);
    assert.equal(json.safety.commerceAllowed, true);
    assert.notEqual(json.result.riskLevel, "urgent");
  }

  {
    const { response, text } = await postEventStream("/api/ai/consult/stream", { profile: standardProfile });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/event-stream/);
    assert.match(text, /event: step/);
    assert.match(text, /event: done/);
  }

  {
    const { response, json } = await postJson("/api/ai/consult", {
      profile: {
        ...standardProfile,
        symptoms: ["胸痛", "呼吸困难"],
        goal: "确认胸痛和呼吸困难风险",
      },
    });
    assert.equal(response.status, 200);
    assert.equal(json.result.riskLevel, "urgent");
    assert.equal(json.safety.commerceAllowed, false);
    assert.deepEqual(json.recommendations, []);
  }

  {
    const { response, json } = await postJson("/api/pdd/click", {
      productId: "msr-nadh-tipsynox",
      sessionId: "smoke-session",
      consultationId: "smoke-consultation",
      source: "smoke",
      solutionSlug: "liver",
      destinationUrl: "https://example.com/product",
      ref: "smoke",
      utm: {
        source: "smoke",
        medium: "test",
        campaign: "runtime",
      },
    });
    assert.equal(response.status, 200);
    assert.deepEqual(json, { ok: true });
  }

  console.log("[smoke] runtime checks passed");
}

try {
  await runSmokeChecks();
} catch (error) {
  console.error("[smoke] runtime checks failed");
  console.error(error);
  process.exitCode = 1;
} finally {
  await stopServer();
}
