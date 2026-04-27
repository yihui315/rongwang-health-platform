import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminCookieClearOptions,
  getAdminCookieOptions,
  isAdminTokenValid,
} from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let token = "";

  try {
    const body = (await request.json()) as { token?: unknown };
    token = typeof body.token === "string" ? body.token.trim() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!isAdminTokenValid(token)) {
    return NextResponse.json({ ok: false, error: "invalid_admin_token" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", getAdminCookieClearOptions());
  return response;
}

