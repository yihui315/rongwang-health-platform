import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/auth/admin";
import { MARKETING_SESSION_COOKIE_NAME, isMarketingSessionValid } from "@/lib/auth/marketing-session";
import { checkRateLimit } from "@/lib/health/rate-limit";
import { logApiWarning } from "@/lib/observability";

export type MarketingApiGuardOptions = {
  bucket: string;
  eventPrefix: string;
  defaultLimit: number;
  defaultWindowMs: number;
  limitEnv?: string;
  windowEnv?: string;
};

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function readPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function enforceMarketingAdminGuard(
  request: Request,
  options: MarketingApiGuardOptions,
) {
  const ip = getClientIp(request);
  const cookieHeader = request.headers.get("cookie") ?? null;

  // Accept admin token OR marketing session cookie
  const isAdmin = isAdminRequestAuthorized(request);
  const isMarketingSession = isMarketingSessionValid(cookieHeader);

  if (!isAdmin && !isMarketingSession) {
    logApiWarning(`${options.eventPrefix}.unauthorized`, { ip });
    return NextResponse.json({ success: false, error: "admin_required" }, { status: 401 });
  }

  const rate = await checkRateLimit(
    `${options.bucket}:${ip}`,
    readPositiveInt(
      options.limitEnv ? process.env[options.limitEnv] : undefined,
      options.defaultLimit,
    ),
    readPositiveInt(
      options.windowEnv ? process.env[options.windowEnv] : undefined,
      options.defaultWindowMs,
    ),
  );

  if (!rate.allowed) {
    logApiWarning(`${options.eventPrefix}.rate_limited`, {
      ip,
      resetAt: rate.resetAt,
    });

    return NextResponse.json(
      { success: false, error: "rate_limited" },
      {
        status: 429,
        headers: {
          "x-ratelimit-remaining": String(rate.remaining),
          "x-ratelimit-reset": String(rate.resetAt),
        },
      },
    );
  }

  return null;
}
