import { randomBytes } from "node:crypto";
import {
  WECHAT_OAUTH_STATE_COOKIE_NAME,
  WECHAT_OAUTH_STATE_MAX_AGE_SECONDS,
} from "@/lib/auth/session";

export interface WechatOpenConfig {
  appId: string;
  secret: string;
  callbackUrl: string;
}

export interface WechatOAuthState {
  state: string;
  next: string;
}

function configured(value: string | undefined) {
  if (!value) {
    return false;
  }
  const lower = value.toLowerCase();
  return !(
    lower.includes("your-") ||
    lower.includes("replace-with") ||
    lower.includes("xxx") ||
    lower === "changeme"
  );
}

export function getWechatOpenConfig(): WechatOpenConfig | null {
  if (
    !configured(process.env.WECHAT_OPEN_APPID) ||
    !configured(process.env.WECHAT_OPEN_SECRET) ||
    !configured(process.env.WECHAT_OPEN_LOGIN_CALLBACK_URL)
  ) {
    return null;
  }

  return {
    appId: process.env.WECHAT_OPEN_APPID as string,
    secret: process.env.WECHAT_OPEN_SECRET as string,
    callbackUrl: process.env.WECHAT_OPEN_LOGIN_CALLBACK_URL as string,
  };
}

export function getWechatOpenMissingKeys() {
  return ["WECHAT_OPEN_APPID", "WECHAT_OPEN_SECRET", "WECHAT_OPEN_LOGIN_CALLBACK_URL"].filter(
    (key) => !configured(process.env[key]),
  );
}

export function sanitizeAuthNext(rawNext: string | null | undefined) {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/dashboard";
  }
  return rawNext;
}

export function createWechatOAuthState(next: string | null | undefined): WechatOAuthState {
  return {
    state: randomBytes(18).toString("base64url"),
    next: sanitizeAuthNext(next),
  };
}

export function encodeWechatOAuthState(payload: WechatOAuthState) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeWechatOAuthState(value: string | undefined): WechatOAuthState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<WechatOAuthState>;
    if (!parsed.state || typeof parsed.state !== "string") {
      return null;
    }
    return {
      state: parsed.state,
      next: sanitizeAuthNext(parsed.next),
    };
  } catch {
    return null;
  }
}

export function buildWechatQrConnectUrl(config: WechatOpenConfig, state: string) {
  const url = new URL("https://open.weixin.qq.com/connect/qrconnect");
  url.searchParams.set("appid", config.appId);
  url.searchParams.set("redirect_uri", config.callbackUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "snsapi_login");
  url.searchParams.set("state", state);
  return `${url.toString()}#wechat_redirect`;
}

export function getWechatOAuthStateCookieOptions(nodeEnv = process.env.NODE_ENV) {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: WECHAT_OAUTH_STATE_MAX_AGE_SECONDS,
  };
}

export function getWechatOAuthStateClearOptions(nodeEnv = process.env.NODE_ENV) {
  return {
    ...getWechatOAuthStateCookieOptions(nodeEnv),
    maxAge: 0,
  };
}

export async function exchangeWechatOpenCode(config: WechatOpenConfig, code: string) {
  const tokenUrl = new URL("https://api.weixin.qq.com/sns/oauth2/access_token");
  tokenUrl.searchParams.set("appid", config.appId);
  tokenUrl.searchParams.set("secret", config.secret);
  tokenUrl.searchParams.set("code", code);
  tokenUrl.searchParams.set("grant_type", "authorization_code");

  const tokenResponse = await fetch(tokenUrl);
  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string;
    openid?: string;
    unionid?: string;
    errcode?: number;
    errmsg?: string;
  };

  if (!tokenResponse.ok || tokenPayload.errcode || !tokenPayload.access_token || !tokenPayload.openid) {
    throw new Error(tokenPayload.errmsg || "wechat_code_exchange_failed");
  }

  const userInfoUrl = new URL("https://api.weixin.qq.com/sns/userinfo");
  userInfoUrl.searchParams.set("access_token", tokenPayload.access_token);
  userInfoUrl.searchParams.set("openid", tokenPayload.openid);
  userInfoUrl.searchParams.set("lang", "zh_CN");

  const userInfoResponse = await fetch(userInfoUrl);
  const userInfo = (await userInfoResponse.json()) as {
    nickname?: string;
    headimgurl?: string;
    unionid?: string;
    errcode?: number;
    errmsg?: string;
  };

  if (!userInfoResponse.ok || userInfo.errcode) {
    throw new Error(userInfo.errmsg || "wechat_userinfo_failed");
  }

  return {
    openId: tokenPayload.openid,
    unionId: userInfo.unionid ?? tokenPayload.unionid ?? null,
    nickname: userInfo.nickname ?? null,
    avatarUrl: userInfo.headimgurl ?? null,
  };
}

export { WECHAT_OAUTH_STATE_COOKIE_NAME };
