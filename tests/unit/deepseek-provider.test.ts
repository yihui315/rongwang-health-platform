import test from "node:test";
import assert from "node:assert/strict";
import { generateTextWithProvider } from "@/lib/ai/provider";

function withDeepSeekEnv<T>(env: Record<string, string | undefined>, fn: () => Promise<T>) {
  const previous = {
    aiProvider: process.env.AI_PROVIDER,
    aiModel: process.env.AI_MODEL,
    deepSeekApiKey: process.env.DEEPSEEK_API_KEY,
    deepSeekBaseUrl: process.env.DEEPSEEK_BASE_URL,
    deepSeekModel: process.env.DEEPSEEK_MODEL,
  };

  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return fn().finally(() => {
    process.env.AI_PROVIDER = previous.aiProvider;
    process.env.AI_MODEL = previous.aiModel;
    process.env.DEEPSEEK_API_KEY = previous.deepSeekApiKey;
    process.env.DEEPSEEK_BASE_URL = previous.deepSeekBaseUrl;
    process.env.DEEPSEEK_MODEL = previous.deepSeekModel;
  });
}

test("deepseek provider calls the OpenAI-compatible chat completions endpoint", async () => {
  await withDeepSeekEnv(
    {
      AI_PROVIDER: "deepseek",
      AI_MODEL: "gpt-5.4",
      DEEPSEEK_API_KEY: "test-deepseek-key",
      DEEPSEEK_BASE_URL: undefined,
      DEEPSEEK_MODEL: "deepseek-v4-flash",
    },
    async () => {
      const previousFetch = global.fetch;
      let calls = 0;

      global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        calls += 1;
        assert.equal(String(input), "https://api.deepseek.com/chat/completions");
        assert.equal(init?.method, "POST");
        assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer test-deepseek-key");

        const body = JSON.parse(String(init?.body));
        assert.equal(body.model, "deepseek-v4-flash");
        assert.equal(body.stream, false);
        assert.deepEqual(body.thinking, { type: "disabled" });
        assert.equal(body.temperature, 0.2);
        assert.equal(body.max_tokens, 32);
        assert.deepEqual(body.messages, [
          { role: "system", content: "Return a tiny answer." },
          { role: "user", content: "Ping DeepSeek" },
        ]);

        return new Response(
          JSON.stringify({
            model: "deepseek-v4-flash",
            choices: [{ message: { content: "pong" } }],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }) as typeof fetch;

      try {
        const result = await generateTextWithProvider({
          prompt: "Ping DeepSeek",
          systemPrompt: "Return a tiny answer.",
          temperature: 0.2,
          maxTokens: 32,
        });

        assert.equal(calls, 1);
        assert.equal(result.success, true);
        assert.equal(result.text, "pong");
        assert.equal(result.provider, "deepseek");
        assert.equal(result.resolvedProvider, "deepseek");
        assert.equal(result.model, "deepseek-v4-flash");
      } finally {
        global.fetch = previousFetch;
      }
    },
  );
});

test("deepseek provider fails closed when API key is missing", async () => {
  await withDeepSeekEnv(
    {
      AI_PROVIDER: "deepseek",
      DEEPSEEK_API_KEY: undefined,
      DEEPSEEK_MODEL: "deepseek-v4-flash",
    },
    async () => {
      const previousFetch = global.fetch;
      let calls = 0;

      global.fetch = (async () => {
        calls += 1;
        throw new Error("fetch should not be called without a key");
      }) as typeof fetch;

      try {
        const result = await generateTextWithProvider({
          prompt: "Ping DeepSeek",
          systemPrompt: "Return a tiny answer.",
        });

        assert.equal(calls, 0);
        assert.equal(result.success, false);
        assert.equal(result.provider, "deepseek");
        assert.match(result.error ?? "", /DEEPSEEK_API_KEY/);
      } finally {
        global.fetch = previousFetch;
      }
    },
  );
});
