import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.production");
const examplePath = path.join(process.cwd(), ".env.production.example");

function randomSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function quote(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function parseEnv(content) {
  const entries = new Map();
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const [key] = trimmed.split("=", 1);
    entries.set(key, line);
  }
  return entries;
}

if (!fs.existsSync(examplePath)) {
  throw new Error(".env.production.example is missing");
}

if (fs.existsSync(envPath) && !process.argv.includes("--force")) {
  console.log("[env:bootstrap:production] .env.production already exists; use --force to regenerate");
  process.exit(0);
}

const example = fs.readFileSync(examplePath, "utf8");
const entries = parseEnv(example);

const generated = new Map([
  ["ADMIN_AUTH_TOKEN", randomSecret()],
  ["POSTGRES_PASSWORD", randomSecret()],
  ["REDIS_REST_TOKEN", randomSecret()],
  ["GEOFLOW_WEBHOOK_SECRET", randomSecret()],
]);

const postgresDb = process.env.POSTGRES_DB || "rongwang";
const postgresUser = process.env.POSTGRES_USER || "rongwang";
const postgresPassword = generated.get("POSTGRES_PASSWORD");
const localDatabaseUrl = `postgresql://${encodeURIComponent(postgresUser)}:${encodeURIComponent(postgresPassword)}@127.0.0.1:5432/${encodeURIComponent(postgresDb)}?schema=public`;

generated.set("DATABASE_URL", localDatabaseUrl);
generated.set("DIRECT_URL", localDatabaseUrl);
generated.set("REDIS_REST_URL", "http://127.0.0.1:8079");

const lines = example.split(/\r?\n/).map((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
    return line;
  }

  const key = trimmed.slice(0, trimmed.indexOf("="));
  const generatedValue = generated.get(key);
  if (generatedValue) {
    return `${key}=${quote(generatedValue)}`;
  }

  return entries.get(key) ?? line;
});

fs.writeFileSync(envPath, `${lines.join("\n").replace(/\n*$/, "")}\n`, "utf8");
console.log("[env:bootstrap:production] created .env.production");
console.log("[env:bootstrap:production] generated ADMIN_AUTH_TOKEN, POSTGRES_PASSWORD, REDIS_REST_TOKEN, and GEOFLOW_WEBHOOK_SECRET");
console.log("[env:bootstrap:production] secret values were not printed");
console.log("[env:bootstrap:production] fill NEXT_PUBLIC_SITE_URL, DEEPSEEK_API_KEY, and optional GEOFlow API credentials before launch");
