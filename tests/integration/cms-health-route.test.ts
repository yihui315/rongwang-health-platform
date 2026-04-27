import test from "node:test";
import assert from "node:assert/strict";
import { GET as cmsHealthGet } from "@/app/api/cms/health/route";

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

test("GET /api/cms/health fails closed without exposing internal GEOFlow URL", async () => {
  const previous = {
    url: process.env.GEOFLOW_API_URL,
    token: process.env.GEOFLOW_API_TOKEN,
  };

  delete process.env.GEOFLOW_API_URL;
  delete process.env.GEOFLOW_API_TOKEN;

  try {
    const response = await cmsHealthGet();
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");

    const payload = await response.json();
    assert.equal(payload.status, "disconnected");
    assert.equal(payload.configured, false);
    assert.equal("geoflow_url" in payload, false);
  } finally {
    restoreEnv("GEOFLOW_API_URL", previous.url);
    restoreEnv("GEOFLOW_API_TOKEN", previous.token);
  }
});
