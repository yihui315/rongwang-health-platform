import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const existingBaseUrl = process.env.ACCEPTANCE_BASE_URL;
const port = Number(process.env.ACCEPTANCE_PORT || 4317);
const baseUrl = existingBaseUrl || `http://127.0.0.1:${port}`;
const nextCli = path.resolve("node_modules", "next", "dist", "bin", "next");
const suspiciousCodepoints = new Set([
  0x20ac,
  0x30e7,
  0x30e9,
  0x30bd,
  0x93b6,
  0x93b8,
  0x93b9,
  0x93c3,
  0x93c4,
  0x93c8,
  0x93cc,
  0x934b,
  0x934f,
  0x9354,
  0x9358,
  0x935f,
  0x9365,
  0x9412,
  0x9424,
  0x942b,
  0x947d,
  0x95ab,
  0x95b0,
  0x95c0,
  0xff46,
  0xfffd,
]);

const pageChecks = [
  "/",
  "/api/health",
  "/api/marketing/automation",
  "/api/marketing/autopilot",
  "/ai-consult",
  "/ai-consult?focus=sleep",
  "/assessment/sleep",
  "/assessment/fatigue",
  "/assessment/liver",
  "/assessment/immune",
  "/assessment/male-health",
  "/assessment/female-health",
  "/tools/sleep-score",
  "/tools/female-health-check",
  "/solutions/sleep",
  "/solutions/fatigue",
  "/solutions/liver",
  "/solutions/immune",
  "/solutions/male-health",
  "/solutions/female-health",
  "/products",
  "/products/msr-nadh-tipsynox",
  "/plans/sleep",
  "/plans/stress",
  "/cart",
  "/checkout",
  "/articles",
  "/llms.txt",
  "/robots.txt",
  "/subscription",
  "/family",
  "/admin/login",
  "/product-map/msr-nadh-tipsynox?source=acceptance&solution=sleep",
];

const redirectChecks = [
  { path: "/quiz?focus=sleep", pathname: "/ai-consult", search: "?focus=sleep" },
  { path: "/quiz?pre=stress", pathname: "/ai-consult", search: "" },
  { path: "/admin", pathname: "/admin/login", search: "" },
];

let server = null;
let logs = "";
let exitCode = null;

if (!existingBaseUrl) {
  server = spawn(
    process.execPath,
    [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        NEXT_PUBLIC_SITE_URL: baseUrl,
        ADMIN_AUTH_TOKEN: "acceptance-admin",
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

  server.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });

  server.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });

  server.on("exit", (code) => {
    exitCode = code;
  });
}

function hasMojibakeLikeText(text) {
  for (const char of text) {
    const codepoint = char.codePointAt(0);
    if (suspiciousCodepoints.has(codepoint) || (codepoint >= 0xe000 && codepoint <= 0xf8ff)) {
      return true;
    }
  }
  return false;
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(options.timeout ?? 8000),
  });
}

async function waitForServer() {
  if (existingBaseUrl) {
    return;
  }

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

async function stopServer() {
  if (!server || server.exitCode !== null) {
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

function assertRedirect(response, expectedPathname, expectedSearch) {
  assert.ok([301, 302, 307, 308].includes(response.status), `expected redirect, got ${response.status}`);
  const location = response.headers.get("location");
  assert.ok(location, "expected location header");
  const url = new URL(location, baseUrl);
  assert.equal(url.pathname, expectedPathname);
  assert.equal(url.search, expectedSearch);
}

async function checkPage(pathname) {
  const response = await fetchWithTimeout(`${baseUrl}${pathname}`);
  const text = await response.text();

  assert.equal(response.status, 200, `${pathname} should return 200`);
  assert.equal(hasMojibakeLikeText(text), false, `${pathname} contains high-confidence mojibake markers`);
}

async function checkRedirect({ path: pathname, pathname: expectedPathname, search }) {
  const response = await fetchWithTimeout(`${baseUrl}${pathname}`, { redirect: "manual" });
  assertRedirect(response, expectedPathname, search);
}

async function main() {
  await waitForServer();

  for (const pathname of pageChecks) {
    await checkPage(pathname);
  }

  for (const check of redirectChecks) {
    await checkRedirect(check);
  }

  console.log(`[acceptance] ${pageChecks.length} pages and ${redirectChecks.length} redirects passed at ${baseUrl}`);
}

try {
  await main();
} catch (error) {
  console.error("[acceptance] failed");
  console.error(error);
  process.exitCode = 1;
} finally {
  await stopServer();
}
