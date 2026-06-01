import fs from "node:fs";

const checks = [];

function addCheck(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const schema = read("prisma/schema.prisma");
const migration = read("prisma/migrations/20260601000000_assessment_outbound_gates/migration.sql");
const envExample = read(".env.example");
const packageJson = JSON.parse(read("package.json"));

for (const model of ["MarketingPlan", "OutboundQueueEntry", "SendEvent", "AuditEvent"]) {
  addCheck(`schema includes ${model}`, new RegExp(`model ${model} \\{`).test(schema));
  addCheck(`migration creates ${model}`, new RegExp(`CREATE TABLE "${model}"`).test(migration));
}

for (const required of [
  "retentionExpiresAt",
  "sensitiveHealthDataAccepted",
  "marketingContactAccepted",
  "stopContactRequested",
  "blockedReasons",
  "gateSnapshot",
  "pending_manual_review",
]) {
  addCheck(`schema/migration includes ${required}`, schema.includes(required) || migration.includes(required));
}

for (const envKey of [
  "SENSITIVE_HEALTH_RETENTION_DAYS=180",
  "ALLOW_AUTOMATED_MARKETING_SEND=false",
]) {
  addCheck(`env contract includes ${envKey}`, envExample.includes(envKey));
}

addCheck(
  "verify runs automation gate check",
  typeof packageJson.scripts?.verify === "string" && packageJson.scripts.verify.includes("db:automation-gates"),
);

const failures = checks.filter((check) => !check.ok);
for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
}

console.log(JSON.stringify({
  decision: failures.length === 0 ? "PASS" : "FAIL",
  checks: checks.length,
  failures: failures.map((check) => check.name),
}, null, 2));

if (failures.length > 0) {
  process.exit(1);
}
