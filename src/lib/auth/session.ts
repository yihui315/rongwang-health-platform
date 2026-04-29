import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { NextResponse } from "next/server";

export const USER_SESSION_COOKIE_NAME = "rw_session";
export const WECHAT_OAUTH_STATE_COOKIE_NAME = "rw_wechat_oauth_state";
export const USER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const WECHAT_OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;

const LOCAL_ID_HASH_SALT = "rongwang-local-dev-identity-salt";
const PASSWORD_ALGORITHM = "scrypt";

export function getIdentityHashSalt(nodeEnv = process.env.NODE_ENV) {
  const salt = process.env.AUTH_ID_HASH_SALT?.trim();
  if (salt) {
    return salt;
  }

  if (nodeEnv === "production") {
    return null;
  }

  return LOCAL_ID_HASH_SALT;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashProviderSubject(provider: string, subject: string) {
  const salt = getIdentityHashSalt();
  if (!salt) {
    return null;
  }

  return createHash("sha256")
    .update(`${provider}:${subject}:${salt}`)
    .digest("hex");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const key = scryptSync(password, salt, 64).toString("base64url");
  return `${PASSWORD_ALGORITHM}$${salt}$${key}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) {
    return false;
  }

  const [algorithm, salt, key] = storedHash.split("$");
  if (algorithm !== PASSWORD_ALGORITHM || !salt || !key) {
    return false;
  }

  const candidate = Buffer.from(scryptSync(password, salt, 64).toString("base64url"));
  const expected = Buffer.from(key);
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex");
}

export function getUserAgent(request: Request) {
  return request.headers.get("user-agent") || "";
}

export function getSessionCookieOptions(nodeEnv = process.env.NODE_ENV) {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: USER_SESSION_MAX_AGE_SECONDS,
  };
}

export function getSessionCookieClearOptions(nodeEnv = process.env.NODE_ENV) {
  return {
    ...getSessionCookieOptions(nodeEnv),
    maxAge: 0,
  };
}

export function setUserSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(USER_SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export function clearUserSessionCookie(response: NextResponse) {
  response.cookies.set(USER_SESSION_COOKIE_NAME, "", getSessionCookieClearOptions());
}

export function readCookieFromRequest(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
