import test from "node:test";
import assert from "node:assert/strict";
import { GET as getWechatStatus } from "@/app/api/wechat/status/route";

async function withWechatEnv<T>(env: Record<string, string | undefined>, fn: () => Promise<T>) {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(env)) {
    previous[key] = process.env[key];
    if (env[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = env[key];
    }
  }

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
  }
}

test("GET /api/wechat/status returns sanitized readiness metadata", async () => {
  await withWechatEnv({
    WECHAT_APPID: "wx-official",
    WECHAT_SECRET: "do-not-leak",
    WECHAT_DEFAULT_COVER_MEDIA_ID: "cover-id",
    WECHAT_MINIPROGRAM_APPID: "wx-mini",
    WECHAT_MINIPROGRAM_SECRET: "mini-secret",
    WECHAT_PAY_MCH_ID: "mch",
    WECHAT_PAY_API_V3_KEY: "pay-secret",
    WECHAT_PAY_CERT_SERIAL_NO: "serial",
    WECHAT_PAY_PRIVATE_KEY: "private-key",
    WECHAT_PAY_NOTIFY_URL: "https://example.com/api/wechat/pay/notify",
  }, async () => {
    const response = await getWechatStatus();

    assert.equal(response.status, 200);
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    assert.equal(payload.success, true);
    assert.equal(payload.wechat.officialAccount.canUploadDraft, true);
    assert.equal(payload.wechat.miniProgram.configured, true);
    assert.equal(payload.wechat.pay.configured, true);
    assert.equal(serialized.includes("do-not-leak"), false);
    assert.equal(serialized.includes("mini-secret"), false);
    assert.equal(serialized.includes("private-key"), false);
  });
});
