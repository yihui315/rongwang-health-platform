import { NextRequest, NextResponse } from "next/server";
import { setUserSessionCookie } from "@/lib/auth/session";
import { requestMetaFromRequest, upsertWechatIdentity } from "@/lib/auth/user-service";
import {
  decodeWechatOAuthState,
  exchangeWechatOpenCode,
  getWechatOAuthStateClearOptions,
  getWechatOpenConfig,
  WECHAT_OAUTH_STATE_COOKIE_NAME,
} from "@/lib/auth/wechat-oauth";

function redirectToLogin(origin: string, error: string) {
  const url = new URL("/auth/login", origin);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const config = getWechatOpenConfig();
  if (!config) {
    return redirectToLogin(requestUrl.origin, "wechat_not_configured");
  }

  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const stateCookie = decodeWechatOAuthState(
    request.cookies.get(WECHAT_OAUTH_STATE_COOKIE_NAME)?.value,
  );

  if (!code || !state || !stateCookie || stateCookie.state !== state) {
    const response = redirectToLogin(requestUrl.origin, "wechat_state_invalid");
    response.cookies.set(
      WECHAT_OAUTH_STATE_COOKIE_NAME,
      "",
      getWechatOAuthStateClearOptions(),
    );
    return response;
  }

  try {
    const identity = await exchangeWechatOpenCode(config, code);
    const result = await upsertWechatIdentity({
      provider: "wechat_open",
      providerSubject: identity.openId,
      unionId: identity.unionId,
      displayName: identity.nickname,
      avatarUrl: identity.avatarUrl,
      metadata: {
        source: "wechat_open_qr",
        hasUnionId: Boolean(identity.unionId),
      },
      requestMeta: requestMetaFromRequest(request),
    });

    if (!result.ok || !result.data) {
      const response = redirectToLogin(requestUrl.origin, result.error ?? "wechat_login_failed");
      response.cookies.set(
        WECHAT_OAUTH_STATE_COOKIE_NAME,
        "",
        getWechatOAuthStateClearOptions(),
      );
      return response;
    }

    const response = NextResponse.redirect(new URL(stateCookie.next, requestUrl.origin));
    setUserSessionCookie(response, result.data.token);
    response.cookies.set(
      WECHAT_OAUTH_STATE_COOKIE_NAME,
      "",
      getWechatOAuthStateClearOptions(),
    );
    return response;
  } catch (error) {
    console.error("[wechat oauth] callback failed", error);
    const response = redirectToLogin(requestUrl.origin, "wechat_login_failed");
    response.cookies.set(
      WECHAT_OAUTH_STATE_COOKIE_NAME,
      "",
      getWechatOAuthStateClearOptions(),
    );
    return response;
  }
}
