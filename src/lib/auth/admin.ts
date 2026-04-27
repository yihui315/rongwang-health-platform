export const ADMIN_COOKIE_NAME = "rw_admin_token";
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function getAdminAuthToken() {
  return process.env.ADMIN_AUTH_TOKEN?.trim() || "";
}

export function isAdminAuthRequired(nodeEnv = process.env.NODE_ENV) {
  return Boolean(getAdminAuthToken()) || nodeEnv === "production";
}

export function isAdminTokenValid(candidate: string | null | undefined) {
  const token = getAdminAuthToken();
  return Boolean(token && candidate && candidate === token);
}

export function getAdminTokenFromRequest(input: {
  cookieToken?: string;
  headerToken?: string | null;
  queryToken?: string | null;
}) {
  return input.headerToken || input.cookieToken || "";
}

export function getAdminCookieOptions(nodeEnv = process.env.NODE_ENV) {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  };
}

export function getAdminCookieClearOptions(nodeEnv = process.env.NODE_ENV) {
  return {
    ...getAdminCookieOptions(nodeEnv),
    maxAge: 0,
  };
}

export function isAdminRequestAuthorized(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`))
    ?.split("=")[1];

  return isAdminTokenValid(
    getAdminTokenFromRequest({
      cookieToken,
      headerToken: request.headers.get("x-admin-token"),
    }),
  );
}
