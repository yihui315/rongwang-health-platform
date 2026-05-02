import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("prisma schema and migration include user auth, reports, and health knowledge models", () => {
  const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
  const migration = fs.readFileSync(
    "prisma/migrations/20260429010000_user_auth_knowledge_service/migration.sql",
    "utf8",
  );

  for (const model of [
    "UserAccount",
    "UserIdentity",
    "UserAuthSession",
    "UserHealthProfile",
    "AssessmentReport",
    "KnowledgeSource",
    "HealthKnowledgeEntry",
    "ProductKnowledgeLink",
  ]) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
    assert.match(migration, new RegExp(`CREATE TABLE "${model}"`));
  }

  assert.match(schema, /sessionTokenHash\s+String\s+@unique/);
  assert.match(schema, /@@unique\(\[provider, providerSubjectHash\]\)/);
  assert.match(schema, /@@unique\(\[userAccountId, consultationId\]\)/);
  assert.match(migration, /CREATE UNIQUE INDEX "UserIdentity_provider_providerSubjectHash_key"/);
});
