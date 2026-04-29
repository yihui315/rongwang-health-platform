import { NextResponse } from "next/server";
import { clearUserSessionCookie } from "@/lib/auth/session";
import { revokeSessionFromRequest } from "@/lib/auth/user-service";

export async function POST(request: Request) {
  await revokeSessionFromRequest(request);
  const response = NextResponse.json({ success: true });
  clearUserSessionCookie(response);
  return response;
}
