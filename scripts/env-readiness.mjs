import fs from "node:fs";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const productionProfile = args.has("--production");
const probeAll = args.has("--probe");
const probeDb = probeAll || args.has("--probe-db");
const probeRedis = probeAll || args.has("--probe-redis");
const probeOpenAiFlag = args.has("--probe-openai");
const probeDeepSeekFlag = args.has("--probe-deepseek");
const probeMiniMaxFlag = args.has("--probe-minimax");
const envFileArg = process.argv.find((arg) => arg.startsWith("--rw-env-file=") || arg.startsWith("--env-file="));

const root = process.cwd();
const envFiles = envFileArg ? [envFileArg.slice(envFileArg.indexOf("=") + 1)] : [".env", ".env.local"];

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
  const equalIndex = normalized.indexOf("=");
  if (equalIndex === -1) {
    return null;
  }

  const key = normalized.slice(0, equalIndex).trim();
  let value = normalized.slice(equalIndex + 1).trim();

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

function loadEnv() {
  const loaded = [];
  const env = {};

  for (const file of envFiles) {
    const filePath = path.isAbsolute(file) ? file : path.join(root, file);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    loaded.push(file);
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        continue;
      }

      const [key, value] = parsed;
      env[key] = value;
    }
  }

  return {
    loaded,
    env: {
      ...env,
      ...process.env,
    },
  };
}

function isPlaceholder(value) {
  if (!value) {
    return true;
  }

  const lower = value.toLowerCase();
  return (
    lower.includes("your-") ||
    lower.includes("replace-with") ||
    lower.includes("xxx") ||
    lower.includes("example.com") ||
    lower === "changeme"
  );
}

function isConfigured(env, key) {
  return !isPlaceholder(env[key]);
}

function hasAnyConfiguredPair(env, pairs) {
  return pairs.some(([first, second]) => isConfigured(env, first) && isConfigured(env, second));
}

function formatKey(env, key) {
  return `${key}: ${isConfigured(env, key) ? "present" : "missing"}`;
}

function printGroup(title, lines) {
  console.log(`\n[env] ${title}`);
  for (const line of lines) {
    console.log(`  - ${line}`);
  }
}

async function probeDatabase(env) {
  if (!isConfigured(env, "DATABASE_URL")) {
    throw new Error("DATABASE_URL is missing");
  }

  process.env.DATABASE_URL = env.DATABASE_URL;
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const productCount = await prisma.product.count().catch(() => null);
    return productCount === null ? "query ok; product table unavailable" : `query ok; product rows=${productCount}`;
  } finally {
    await prisma.$disconnect();
  }
}

function getRedisRestPair(env) {
  const pairs = [
    ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    ["REDIS_REST_URL", "REDIS_REST_TOKEN"],
  ];

  return pairs.find(([urlKey, tokenKey]) => isConfigured(env, urlKey) && isConfigured(env, tokenKey));
}

async function probeRedisRest(env) {
  const pair = getRedisRestPair(env);
  if (!pair) {
    throw new Error("Redis REST credentials are missing");
  }

  const [urlKey, tokenKey] = pair;
  const url = env[urlKey].replace(/\/$/, "");
  const headers = {
    authorization: `Bearer ${env[tokenKey]}`,
  };
  const pingResponse = await fetch(`${url}/ping`, {
    headers: {
      ...headers,
    },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (pingResponse?.ok) {
    return "ping ok";
  }

  const pipelineResponse = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      ...headers,
      "content-type": "application/json",
    },
    body: JSON.stringify([["PING"]]),
    signal: AbortSignal.timeout(8000),
  });

  if (!pipelineResponse.ok) {
    const pingStatus = pingResponse ? `; /ping status ${pingResponse.status}` : "";
    throw new Error(`Redis REST ping failed with status ${pipelineResponse.status}${pingStatus}`);
  }

  const payload = await pipelineResponse.json().catch(() => null);
  const result = Array.isArray(payload) ? payload[0] : null;
  if (result?.error) {
    throw new Error(`Redis REST pipeline ping failed: ${result.error}`);
  }

  if (result?.result !== "PONG") {
    throw new Error("Redis REST pipeline ping returned an unexpected result");
  }

  return "pipeline ping ok";
}

async function probeOpenAiModels(env) {
  if (!isConfigured(env, "OPENAI_API_KEY")) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const baseUrl = (isConfigured(env, "OPENAI_BASE_URL") ? env.OPENAI_BASE_URL : "https://api.openai.com/v1").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`OpenAI models probe failed with status ${response.status}`);
  }

  return "models endpoint ok";
}

function getDeepSeekModel(env) {
  const configuredModel = env.DEEPSEEK_MODEL || env.AI_MODEL;
  if (configuredModel?.startsWith("deepseek-")) {
    return configuredModel;
  }
  return "deepseek-v4-flash";
}

function getMiniMaxModel(env) {
  return env.MINIMAX_MODEL || env.AI_MODEL || "abab6.5s-chat";
}

async function probeDeepSeekChat(env) {
  if (!isConfigured(env, "DEEPSEEK_API_KEY")) {
    throw new Error("DEEPSEEK_API_KEY is missing");
  }

  const baseUrl = (isConfigured(env, "DEEPSEEK_BASE_URL") ? env.DEEPSEEK_BASE_URL : "https://api.deepseek.com").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: getDeepSeekModel(env),
      messages: [
        { role: "system", content: "Reply with a short health-check token only." },
        { role: "user", content: "ping" },
      ],
      thinking: { type: "disabled" },
      temperature: 0,
      max_tokens: 32,
      stream: false,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`DeepSeek chat probe failed with status ${response.status}: ${text.slice(0, 160)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek chat probe returned an empty response");
  }

  return `chat ok; model=${data.model || getDeepSeekModel(env)}`;
}

async function probeMiniMaxChat(env) {
  if (!isConfigured(env, "MINIMAX_API_KEY")) {
    throw new Error("MINIMAX_API_KEY is missing");
  }

  const baseUrl = (isConfigured(env, "MINIMAX_BASE_URL") ? env.MINIMAX_BASE_URL : "https://api.minimax.chat").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.MINIMAX_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: getMiniMaxModel(env),
      messages: [
        { role: "system", content: "Reply with a short health-check token only." },
        { role: "user", content: "ping" },
      ],
      temperature: 0,
      max_tokens: 32,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`MiniMax chat probe failed with status ${response.status}: ${text.slice(0, 160)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("MiniMax chat probe returned an empty response");
  }

  return `chat ok; model=${data.model || getMiniMaxModel(env)}`;
}

async function runProbe(label, fn, errors) {
  try {
    const result = await fn();
    console.log(`[env:probe] ${label}: ${result}`);
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
    console.log(`[env:probe] ${label}: failed`);
  }
}

const { loaded, env } = loadEnv();
const errors = [];
const warnings = [];

console.log(`[env] loaded files: ${loaded.length > 0 ? loaded.join(", ") : "none"}`);
console.log(`[env] profile: ${productionProfile ? "production" : "local"}`);

printGroup("core", [
  formatKey(env, "NEXT_PUBLIC_SITE_URL"),
  formatKey(env, "ADMIN_AUTH_TOKEN"),
  formatKey(env, "AUTH_ID_HASH_SALT"),
]);

printGroup("database", [
  formatKey(env, "DATABASE_URL"),
  formatKey(env, "DIRECT_URL"),
  formatKey(env, "NEXT_PUBLIC_SUPABASE_URL"),
  formatKey(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  formatKey(env, "SUPABASE_SERVICE_ROLE_KEY"),
]);

printGroup("redis", [
  formatKey(env, "UPSTASH_REDIS_REST_URL"),
  formatKey(env, "UPSTASH_REDIS_REST_TOKEN"),
  formatKey(env, "REDIS_REST_URL"),
  formatKey(env, "REDIS_REST_TOKEN"),
  formatKey(env, "REDIS_URL"),
  formatKey(env, "REDIS_TOKEN"),
]);

printGroup("ai", [
  formatKey(env, "OPENAI_API_KEY"),
  formatKey(env, "OPENAI_BASE_URL"),
  formatKey(env, "DEEPSEEK_API_KEY"),
  formatKey(env, "DEEPSEEK_BASE_URL"),
  formatKey(env, "DEEPSEEK_MODEL"),
  formatKey(env, "MINIMAX_API_KEY"),
  formatKey(env, "MINIMAX_BASE_URL"),
  formatKey(env, "MINIMAX_MODEL"),
  formatKey(env, "AI_PROVIDER"),
  formatKey(env, "AI_MODEL"),
  formatKey(env, "AI_PROMPT_VERSION"),
]);

printGroup("optional integrations", [
  formatKey(env, "STRIPE_SECRET_KEY"),
  formatKey(env, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  formatKey(env, "GEOFLOW_API_URL"),
  formatKey(env, "GEOFLOW_API_TOKEN"),
  formatKey(env, "GEOFLOW_WEBHOOK_SECRET"),
]);

printGroup("marketing automation", [
  formatKey(env, "FEATURE_MARKETING_AUTOMATION"),
  formatKey(env, "FEATURE_MARKETING_AUTOPILOT"),
  formatKey(env, "FEATURE_MARKETING_CONTENT_AI"),
  formatKey(env, "FEATURE_MARKETING_EMAIL_AI"),
  formatKey(env, "FEATURE_MARKETING_LANDING_AI"),
  formatKey(env, "MARKETING_CONTENT_RATE_LIMIT"),
  formatKey(env, "MARKETING_AUTOMATION_RATE_LIMIT"),
  formatKey(env, "MARKETING_AUTOPILOT_RATE_LIMIT"),
  formatKey(env, "MARKETING_EMAIL_RATE_LIMIT"),
  formatKey(env, "MARKETING_LANDING_RATE_LIMIT"),
  formatKey(env, "MARKETING_AUTO_PUBLISH_GEOFLOW"),
  formatKey(env, "MARKETING_AUTOPILOT_EXECUTE"),
  formatKey(env, "GEOFLOW_DEFAULT_TITLE_LIBRARY_ID"),
  formatKey(env, "GEOFLOW_DEFAULT_PROMPT_ID"),
  formatKey(env, "GEOFLOW_DEFAULT_AI_MODEL_ID"),
]);

if (!isConfigured(env, "NEXT_PUBLIC_SITE_URL")) {
  errors.push("NEXT_PUBLIC_SITE_URL is required");
}

const aiProvider = env.AI_PROVIDER?.trim().toLowerCase();
const usesDeepSeek = aiProvider === "deepseek";
const usesMiniMax = aiProvider === "minimax";
const hasOpenAiKey = isConfigured(env, "OPENAI_API_KEY");
const hasDeepSeekKey = isConfigured(env, "DEEPSEEK_API_KEY");
const hasMiniMaxKey = isConfigured(env, "MINIMAX_API_KEY");
const probeOpenAi = probeOpenAiFlag || (probeAll && hasOpenAiKey);
const probeDeepSeek = probeDeepSeekFlag || (probeAll && hasDeepSeekKey);
const probeMiniMax = probeMiniMaxFlag || (probeAll && hasMiniMaxKey);

if (productionProfile) {
  if (!isConfigured(env, "ADMIN_AUTH_TOKEN")) {
    errors.push("ADMIN_AUTH_TOKEN is required for production admin routes");
  }
  if (!isConfigured(env, "DATABASE_URL")) {
    errors.push("DATABASE_URL is required for production persistence");
  }
  if (!isConfigured(env, "AUTH_ID_HASH_SALT")) {
    errors.push("AUTH_ID_HASH_SALT is required for production identity hashing");
  }
  if (usesDeepSeek && !hasDeepSeekKey) {
    errors.push("DEEPSEEK_API_KEY is required when AI_PROVIDER=deepseek");
  } else if (usesMiniMax && !hasMiniMaxKey) {
    errors.push("MINIMAX_API_KEY is required when AI_PROVIDER=minimax");
  } else if (!hasOpenAiKey && !hasDeepSeekKey && !hasMiniMaxKey) {
    errors.push("OPENAI_API_KEY, DEEPSEEK_API_KEY, or MINIMAX_API_KEY is required for production AI provider mode");
  }
  if (!hasAnyConfiguredPair(env, [
    ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    ["REDIS_REST_URL", "REDIS_REST_TOKEN"],
    ["REDIS_URL", "REDIS_TOKEN"],
  ])) {
    errors.push("Redis credentials are required for production cross-instance rate limiting");
  }
  if (!isConfigured(env, "GEOFLOW_API_URL") || !isConfigured(env, "GEOFLOW_API_TOKEN")) {
    warnings.push("GEOFlow credentials missing; article routes and sitemap will use static CMS fallback");
  }
  if (!isConfigured(env, "GEOFLOW_WEBHOOK_SECRET")) {
    warnings.push("GEOFLOW_WEBHOOK_SECRET missing; CMS webhook signature verification will be disabled");
  }
  if (env.MARKETING_AUTO_PUBLISH_GEOFLOW === "true") {
    for (const key of [
      "GEOFLOW_API_URL",
      "GEOFLOW_API_TOKEN",
      "GEOFLOW_DEFAULT_TITLE_LIBRARY_ID",
      "GEOFLOW_DEFAULT_PROMPT_ID",
      "GEOFLOW_DEFAULT_AI_MODEL_ID",
    ]) {
      if (!isConfigured(env, key)) {
        errors.push(`${key} is required when MARKETING_AUTO_PUBLISH_GEOFLOW=true`);
      }
    }
  }
  if (env.MARKETING_AUTOPILOT_EXECUTE === "true" && env.MARKETING_AUTO_PUBLISH_GEOFLOW !== "true") {
    errors.push("MARKETING_AUTO_PUBLISH_GEOFLOW must be true before MARKETING_AUTOPILOT_EXECUTE=true");
  }
  if (probeAll) {
    for (const key of [
      "GEOFLOW_API_URL",
      "GEOFLOW_API_TOKEN",
      "GEOFLOW_DEFAULT_TITLE_LIBRARY_ID",
      "GEOFLOW_DEFAULT_PROMPT_ID",
      "GEOFLOW_DEFAULT_AI_MODEL_ID",
    ]) {
      if (!isConfigured(env, key)) {
        errors.push(`${key} is required for production GEOFlow probe`);
      }
    }
  }
} else {
  if (!isConfigured(env, "DATABASE_URL")) {
    warnings.push("DATABASE_URL missing; app will use static/fallback data where supported");
  }
  if (!hasOpenAiKey && !hasDeepSeekKey && !hasMiniMaxKey) {
    warnings.push("OPENAI_API_KEY, DEEPSEEK_API_KEY, and MINIMAX_API_KEY missing; AI provider calls should stay behind fallback/feature flags");
  }
  if (!hasAnyConfiguredPair(env, [
    ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    ["REDIS_REST_URL", "REDIS_REST_TOKEN"],
    ["REDIS_URL", "REDIS_TOKEN"],
  ])) {
    warnings.push("Redis credentials missing; local in-memory rate limiting fallback will be used");
  }
}

for (const warning of warnings) {
  console.log(`[env:warn] ${warning}`);
}

if (probeDb) {
  await runProbe("database", () => probeDatabase(env), errors);
}
if (probeRedis) {
  await runProbe("redis", () => probeRedisRest(env), errors);
}
if (probeOpenAi) {
  await runProbe("openai", () => probeOpenAiModels(env), errors);
}
if (probeDeepSeek) {
  await runProbe("deepseek", () => probeDeepSeekChat(env), errors);
}
if (probeMiniMax) {
  await runProbe("minimax", () => probeMiniMaxChat(env), errors);
}

if (errors.length > 0) {
  console.log("\n[env] readiness failed");
  for (const error of errors) {
    console.log(`  - ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("\n[env] readiness check passed");
}
