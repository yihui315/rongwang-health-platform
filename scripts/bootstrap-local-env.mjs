import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
const rotateAdminToken = process.argv.includes("--rotate-admin-token");

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const equalIndex = trimmed.indexOf("=");
  if (equalIndex === -1) {
    return null;
  }

  return trimmed.slice(0, equalIndex).trim();
}

function quoteEnvValue(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function generateAdminToken() {
  return crypto.randomBytes(32).toString("base64url");
}

const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const lines = existing ? existing.split(/\r?\n/) : [];
const keys = new Set(lines.map(parseEnvLine).filter(Boolean));
const additions = [];

function appendIfMissing(key, value = "") {
  if (keys.has(key)) {
    return;
  }

  additions.push(`${key}=${value ? quoteEnvValue(value) : ""}`);
  keys.add(key);
}

if (rotateAdminToken) {
  const rotated = lines.map((line) => {
    if (parseEnvLine(line) === "ADMIN_AUTH_TOKEN") {
      return `ADMIN_AUTH_TOKEN=${quoteEnvValue(generateAdminToken())}`;
    }
    return line;
  });

  if (!keys.has("ADMIN_AUTH_TOKEN")) {
    rotated.push(`ADMIN_AUTH_TOKEN=${quoteEnvValue(generateAdminToken())}`);
  }

  fs.writeFileSync(envPath, `${rotated.join("\n").replace(/\n*$/, "")}\n`, "utf8");
  console.log("[env:bootstrap] ADMIN_AUTH_TOKEN rotated in .env.local");
  process.exit(0);
}

appendIfMissing("ADMIN_AUTH_TOKEN", generateAdminToken());
appendIfMissing("DATABASE_URL");
appendIfMissing("DIRECT_URL");
appendIfMissing("NEXT_PUBLIC_SUPABASE_URL");
appendIfMissing("NEXT_PUBLIC_SUPABASE_ANON_KEY");
appendIfMissing("SUPABASE_SERVICE_ROLE_KEY");
appendIfMissing("UPSTASH_REDIS_REST_URL");
appendIfMissing("UPSTASH_REDIS_REST_TOKEN");
appendIfMissing("DEEPSEEK_API_KEY");
appendIfMissing("DEEPSEEK_BASE_URL", "https://api.deepseek.com");
appendIfMissing("DEEPSEEK_MODEL", "deepseek-v4-flash");
appendIfMissing("AI_PROVIDER", "deepseek");
appendIfMissing("AI_PROMPT_VERSION", "health-consult-v1");

if (additions.length === 0) {
  console.log("[env:bootstrap] .env.local already contains the required keys");
  process.exit(0);
}

const next = [
  existing.replace(/\n*$/, ""),
  "",
  "# Rongwang production readiness keys",
  ...additions,
  "",
].filter((line, index) => index !== 0 || line.length > 0).join("\n");

fs.writeFileSync(envPath, next, "utf8");
console.log(`[env:bootstrap] added ${additions.length} missing keys to .env.local`);
console.log("[env:bootstrap] secret values were not printed");
