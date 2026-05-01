import test from "node:test";
import assert from "node:assert/strict";
import { getRedis } from "@/lib/redis";

test("Redis REST client sends commands through pipeline endpoint", async () => {
  const previous = {
    redisUrl: process.env.REDIS_REST_URL,
    redisToken: process.env.REDIS_REST_TOKEN,
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    fetch: globalThis.fetch,
  };
  const requests: Array<{ url: string; init?: RequestInit }> = [];

  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.REDIS_REST_URL = "http://redis.example.test";
  process.env.REDIS_REST_TOKEN = `token-${Date.now()}`;

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(input), init });
    assert.equal(String(input), "http://redis.example.test/pipeline");
    assert.equal(init?.method, "POST");
    assert.equal(init?.headers?.["Authorization" as keyof HeadersInit], `Bearer ${process.env.REDIS_REST_TOKEN}`);
    assert.equal(init?.headers?.["Content-Type" as keyof HeadersInit], "application/json");

    const body = JSON.parse(String(init?.body));
    const command = body[0][0];
    const result = command === "TTL" ? 60 : 1;
    return new Response(JSON.stringify([{ result }]), { status: 200 });
  };

  try {
    const redis = getRedis();
    assert.ok(redis);

    assert.equal(await redis.incr("unit:redis"), 1);
    assert.equal(await redis.expire("unit:redis", 60), true);
    assert.equal(await redis.ttl("unit:redis"), 60);
    assert.deepEqual(
      requests.map((request) => JSON.parse(String(request.init?.body))[0]),
      [
        ["INCR", "unit:redis"],
        ["EXPIRE", "unit:redis", "60"],
        ["TTL", "unit:redis"],
      ],
    );
  } finally {
    globalThis.fetch = previous.fetch;
    process.env.REDIS_REST_URL = previous.redisUrl;
    process.env.REDIS_REST_TOKEN = previous.redisToken;
    process.env.UPSTASH_REDIS_REST_URL = previous.upstashUrl;
    process.env.UPSTASH_REDIS_REST_TOKEN = previous.upstashToken;
  }
});
