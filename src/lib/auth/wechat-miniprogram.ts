import { createHash } from "node:crypto";

export async function exchangeWechatMiniProgramCode(code: string) {
  const appId = process.env.WECHAT_MINIPROGRAM_APPID;
  const secret = process.env.WECHAT_MINIPROGRAM_SECRET;

  if (!appId || !secret) {
    throw new Error("wechat_miniprogram_not_configured");
  }

  const url = new URL("https://api.weixin.qq.com/sns/jscode2session");
  url.searchParams.set("appid", appId);
  url.searchParams.set("secret", secret);
  url.searchParams.set("js_code", code);
  url.searchParams.set("grant_type", "authorization_code");

  const response = await fetch(url);
  const payload = (await response.json()) as {
    openid?: string;
    unionid?: string;
    session_key?: string;
    errcode?: number;
    errmsg?: string;
  };

  if (!response.ok || payload.errcode || !payload.openid) {
    throw new Error(payload.errmsg || "wechat_miniprogram_code_exchange_failed");
  }

  return {
    openId: payload.openid,
    unionId: payload.unionid ?? null,
    sessionKeyHash: payload.session_key
      ? createHash("sha256").update(payload.session_key).digest("hex")
      : null,
  };
}
