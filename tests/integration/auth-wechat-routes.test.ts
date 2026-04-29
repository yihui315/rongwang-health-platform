import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET as startWechatLogin } from "@/app/auth/wechat/route";
import { GET as handleWechatCallback } from "@/app/api/auth/wechat/callback/route";
import { GET as getWechatStatus } from "@/app/api/auth/wechat/status/route";
import { WECHAT_OAUTH_STATE_COOKIE_NAME } from "@/lib/auth/wechat-oauth";
import { resetMemoryStore } from "@/lib/data/memory-store";

async function withAuthEnv<T>(env: Record<string, string | undefined>, fn: () => Promise<T>) {
  const keys = [
    "DATABASE_URL",
    "DIRECT_URL",
    "RW_ENABLE_MEMORY_AUTH",
    "AUTH_ID_HASH_SALT",
    "WECHAT_OPEN_APPID",
    "WECHAT_OPEN_SECRET",
    "WECHAT_OPEN_LOGIN_CALLBACK_URL",
  ];
  const previous: Record<string, string | undefined> = {};
  for (const key of keys) {
    previous[key] = process.env[key];
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  resetMemoryStore();

  try {
    return await fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    resetMemoryStore();
  }
}

function cookieValue(setCookie: string, name: string) {
  const pair = setCookie
    .split(/,\s*/)
    .find((part) => part.startsWith(`${name}=`));
  return pair?.split(";")[0].slice(name.length + 1);
}

test("wechat QR login status and start route fail closed when Open Platform env is missing", async () => {
  await withAuthEnv({}, async () => {
    const status = await getWechatStatus();
    assert.equal(status.status, 200);
    assert.equal((await status.json()).configured, false);

    const response = await startWechatLogin(new NextRequest("http://localhost/auth/wechat"));
    assert.equal(response.status, 307);
    assert.match(response.headers.get("location") ?? "", /wechat_not_configured/);
  });
});

test("wechat QR callback validates state before exchanging code", async () => {
  await withAuthEnv(
    {
      WECHAT_OPEN_APPID: "wx-open-app",
      WECHAT_OPEN_SECRET: "wx-open-secret",
      WECHAT_OPEN_LOGIN_CALLBACK_URL: "http://localhost/api/auth/wechat/callback",
    },
    async () => {
      const response = await handleWechatCallback(
        new NextRequest("http://localhost/api/auth/wechat/callback?code=code&state=bad"),
      );

      assert.equal(response.status, 307);
      assert.match(response.headers.get("location") ?? "", /wechat_state_invalid/);
    },
  );
});

test("wechat QR callback exchanges code, links identity by hashed ids, and sets rw_session", async () => {
  await withAuthEnv(
    {
      RW_ENABLE_MEMORY_AUTH: "true",
      AUTH_ID_HASH_SALT: "wechat-route-test-salt",
      WECHAT_OPEN_APPID: "wx-open-app",
      WECHAT_OPEN_SECRET: "wx-open-secret",
      WECHAT_OPEN_LOGIN_CALLBACK_URL: "http://localhost/api/auth/wechat/callback",
    },
    async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/sns/oauth2/access_token")) {
          return new Response(
            JSON.stringify({
              access_token: "access-token",
              openid: "raw-openid-should-not-leak",
              unionid: "raw-unionid-should-not-leak",
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        return new Response(
          JSON.stringify({
            nickname: "微信用户",
            headimgurl: "https://example.com/avatar.png",
            unionid: "raw-unionid-should-not-leak",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }) as typeof fetch;

      try {
        const start = await startWechatLogin(
          new NextRequest("http://localhost/auth/wechat?next=/dashboard"),
        );
        const location = start.headers.get("location") ?? "";
        const state = new URL(location.replace("#wechat_redirect", "")).searchParams.get("state");
        const stateCookie = cookieValue(
          start.headers.get("set-cookie") ?? "",
          WECHAT_OAUTH_STATE_COOKIE_NAME,
        );

        assert.ok(state);
        assert.ok(stateCookie);

        const callback = await handleWechatCallback(
          new NextRequest(`http://localhost/api/auth/wechat/callback?code=ok&state=${state}`, {
            headers: {
              cookie: `${WECHAT_OAUTH_STATE_COOKIE_NAME}=${stateCookie}`,
            },
          }),
        );

        assert.equal(callback.status, 307);
        assert.match(callback.headers.get("location") ?? "", /\/dashboard$/);
        const setCookie = callback.headers.get("set-cookie") ?? "";
        assert.match(setCookie, /rw_session=/);
        assert.equal(setCookie.includes("raw-openid-should-not-leak"), false);
        assert.equal(setCookie.includes("raw-unionid-should-not-leak"), false);
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
  );
});
