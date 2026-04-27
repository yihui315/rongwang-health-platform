import test from "node:test";
import assert from "node:assert/strict";
import { POST as consultPost } from "@/app/api/ai/consult/route";
import { POST as pddClickPost } from "@/app/api/pdd/click/route";
import { consultationResponseSchema } from "@/schemas/consultation-response";

function withIsolatedEnv<T>(fn: () => Promise<T>) {
  const previous = {
    databaseUrl: process.env.DATABASE_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    aiProvider: process.env.FEATURE_AI_PROVIDER,
  };

  delete process.env.DATABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.FEATURE_AI_PROVIDER = "false";

  return fn().finally(() => {
    process.env.DATABASE_URL = previous.databaseUrl;
    process.env.NEXT_PUBLIC_SUPABASE_URL = previous.supabaseUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previous.supabaseKey;
    process.env.SUPABASE_SERVICE_ROLE_KEY = previous.supabaseServiceKey;
    process.env.FEATURE_AI_PROVIDER = previous.aiProvider;
  });
}

test("POST /api/ai/consult returns the structured consultation contract", async () => {
  await withIsolatedEnv(async () => {
    const request = new Request("http://localhost/api/ai/consult", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "198.51.100.10",
        "user-agent": "node-test",
      },
      body: JSON.stringify({
        profile: {
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
        },
      }),
    });

    const response = await consultPost(request);
    assert.equal(response.status, 200);

    const payload = await response.json();
    const parsed = consultationResponseSchema.parse(payload);

    assert.equal(parsed.profile.age, 36);
    assert.equal(parsed.safety.commerceAllowed, true);
    assert.notEqual(parsed.result.riskLevel, "urgent");
  });
});

test("POST /api/pdd/click accepts attribution context without blocking redirect flow", async () => {
  await withIsolatedEnv(async () => {
    const request = new Request("http://localhost/api/pdd/click", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "198.51.100.20",
      },
      body: JSON.stringify({
        productId: "msr-nadh-tipsynox",
        sessionId: "session-test",
        consultationId: "consult-test",
        source: "ai-consult",
        solutionSlug: "liver",
        destinationUrl: "https://example.com/product",
        ref: "test",
        utm: {
          source: "unit",
          medium: "test",
          campaign: "contracts",
        },
      }),
    });

    const response = await pddClickPost(request);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });
});
