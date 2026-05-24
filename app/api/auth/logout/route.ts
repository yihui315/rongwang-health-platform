import { NextResponse, type NextRequest } from 'next/server';
import {
  getExpiredWorkspaceSessionCookieOptions,
  WORKSPACE_SESSION_COOKIE,
} from '@/src/lib/auth/session';

function wantsJson(request: NextRequest): boolean {
  return request.headers.get('accept')?.includes('application/json') || false;
}

export async function POST(request: NextRequest) {
  if (wantsJson(request)) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(WORKSPACE_SESSION_COOKIE, '', getExpiredWorkspaceSessionCookieOptions());
    return response;
  }

  const response = NextResponse.redirect(new URL('/login?loggedOut=1', request.url), { status: 303 });
  response.cookies.set(WORKSPACE_SESSION_COOKIE, '', getExpiredWorkspaceSessionCookieOptions());
  return response;
}
