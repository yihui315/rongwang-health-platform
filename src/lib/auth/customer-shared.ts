export const CUSTOMER_SESSION_COOKIE_NAME = "rw_customer_session";

const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function isCustomerProtectedPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function getSafeCustomerNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export function getCookieValue(cookieHeader: string | null | undefined, name: string) {
  if (!cookieHeader) {
    return undefined;
  }

  const prefix = `${name}=`;
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!cookie) {
    return undefined;
  }

  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return cookie.slice(prefix.length);
  }
}

export function getCustomerLoginPath(nextPath = "/dashboard") {
  const params = new URLSearchParams({
    next: getSafeCustomerNextPath(nextPath),
  });

  return `/auth/login?${params.toString()}`;
}

export function getCustomerLoginRedirectUrl(requestUrl: string | URL) {
  const currentUrl = new URL(requestUrl);
  const loginUrl = new URL("/auth/login", currentUrl);
  const nextPath = `${currentUrl.pathname}${currentUrl.search}`;

  loginUrl.searchParams.set("next", getSafeCustomerNextPath(nextPath));
  return loginUrl;
}

export function getCustomerSessionCookieOptions(maxAge = CUSTOMER_SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
