export const MARKETING_SESSION_COOKIE_NAME = "rw_marketing_session";

const MARKETING_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export function isMarketingSessionValid(
  cookieHeader: string | null | undefined,
): boolean {
  if (!cookieHeader) return false;
  const prefix = `${MARKETING_SESSION_COOKIE_NAME}=`;
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return Boolean(cookie && cookie.length > prefix.length);
}

export function getMarketingCookieOptions(
  nodeEnv = process.env.NODE_ENV,
) {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: MARKETING_SESSION_MAX_AGE_SECONDS,
  };
}

export function getMarketingLoginRedirectUrl(requestUrl: string | URL) {
  const currentUrl = new URL(requestUrl);
  const loginUrl = new URL("/auth/marketing-login", currentUrl);
  const nextPath = `${currentUrl.pathname}${currentUrl.search}`;
  loginUrl.searchParams.set("next", nextPath);
  return loginUrl;
}