import { NextRequest, NextResponse } from "next/server";
import {
  buildWechatQrConnectUrl,
  createWechatOAuthState,
  encodeWechatOAuthState,
  getWechatOAuthStateCookieOptions,
  getWechatOpenConfig,
  WECHAT_OAUTH_STATE_COOKIE_NAME,
} from "@/lib/auth/wechat-oauth";

export async function GET(request: NextRequest) {
  const config = getWechatOpenConfig();
  const requestUrl = new URL(request.url);

  if (!config) {
    const fallback = new URL("/auth/login", requestUrl.origin);
    fallback.searchParams.set("error", "wechat_not_configured");
    return NextResponse.redirect(fallback);
  }

  const oauthState = createWechatOAuthState(requestUrl.searchParams.get("next"));
  const response = NextResponse.redirect(buildWechatQrConnectUrl(config, oauthState.state));
  response.cookies.set(
    WECHAT_OAUTH_STATE_COOKIE_NAME,
    encodeWechatOAuthState(oauthState),
    getWechatOAuthStateCookieOptions(),
  );
  return response;
}
