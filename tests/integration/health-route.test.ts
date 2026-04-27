import test from "node:test";
import assert from "node:assert/strict";
import { GET as healthGet } from "@/app/api/health/route";

test("GET /api/health returns deployment readiness metadata without requiring external services", async () => {
  const previous = {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_REST_URL,
    redisToken: process.env.REDIS_REST_TOKEN,
    aiProvider: process.env.AI_PROVIDER,
    deepSeekApiKey: process.env.DEEPSEEK_API_KEY,
    geoflowUrl: process.env.GEOFLOW_API_URL,
    geoflowToken: process.env.GEOFLOW_API_TOKEN,
  };

  delete process.env.DATABASE_URL;
  delete process.env.REDIS_REST_URL;
  delete process.env.REDIS_REST_TOKEN;
  process.env.AI_PROVIDER = "deepseek";
  delete process.env.DEEPSEEK_API_KEY;
  process.env.GEOFLOW_API_URL = "https://geoflow.example.test";
  process.env.GEOFLOW_API_TOKEN = "secret-geoflow-token";

  try {
    const response = await healthGet(new Request("http://localhost/api/health"));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");

    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.service, "rongwang-health-platform");
    assert.equal(payload.checks.databaseConfigured, false);
    assert.equal(payload.checks.redisConfigured, false);
    assert.equal(payload.checks.aiConfigured, false);
    assert.equal(typeof payload.checks.cmsConfigured, "boolean");
    assert.equal(payload.readiness.database.configured, false);
    assert.equal(payload.readiness.redis.configured, false);
    assert.equal(payload.readiness.ai.provider, "deepseek");
    assert.equal(payload.readiness.ai.configured, false);
    assert.equal(payload.readiness.geoFlow.configured, true);
    assert.equal(JSON.stringify(payload).includes("secret-geoflow-token"), false);
  } finally {
    process.env.DATABASE_URL = previous.databaseUrl;
    process.env.REDIS_REST_URL = previous.redisUrl;
    process.env.REDIS_REST_TOKEN = previous.redisToken;
    process.env.AI_PROVIDER = previous.aiProvider;
    process.env.DEEPSEEK_API_KEY = previous.deepSeekApiKey;
    process.env.GEOFLOW_API_URL = previous.geoflowUrl;
    process.env.GEOFLOW_API_TOKEN = previous.geoflowToken;
  }
});
