import test from "node:test";
import assert from "node:assert/strict";
import { getWechatReadinessStatus } from "@/lib/wechat/config";

async function withWechatEnv<T>(env: Record<string, string | undefined>, fn: () => T | Promise<T>) {
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

test("wechat readiness status exposes sanitized official account, mini program and pay flags", async () => {
  await withWechatEnv({
    WECHAT_APPID: "wx-official",
    WECHAT_SECRET: "secret",
    WECHAT_DEFAULT_COVER_MEDIA_ID: "media",
    WECHAT_MINIPROGRAM_APPID: "wx-mini",
    WECHAT_MINIPROGRAM_SECRET: "mini-secret",
    WECHAT_PAY_MCH_ID: "mch",
    WECHAT_PAY_API_V3_KEY: "v3",
    WECHAT_PAY_CERT_SERIAL_NO: "serial",
    WECHAT_PAY_PRIVATE_KEY: "private",
    WECHAT_PAY_NOTIFY_URL: "https://example.com/notify",
  }, () => {
    const status = getWechatReadinessStatus();

    assert.equal(status.officialAccount.canUploadDraft, true);
    assert.equal(status.miniProgram.configured, true);
    assert.equal(status.pay.configured, true);
    assert.equal(JSON.stringify(status).includes("secret"), false);
    assert.equal(JSON.stringify(status).includes("private"), false);
  });
});
