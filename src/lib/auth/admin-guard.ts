import { NextResponse } from 'next/server';

const adminCookieName = 'rongwang_admin_token';

function getAdminToken(): string {
  return process.env.RONGWANG_ADMIN_TOKEN || process.env.ADMIN_TOKEN || '';
}

function readCookie(request: Request, name: string): string {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

export function isAdminProtectionEnabled(): boolean {
  return true;
}

export function isAuthorizedAdminRequest(request: Request): boolean {
  if (!isAdminProtectionEnabled()) {
    return true;
  }

  const adminToken = getAdminToken();
  if (!adminToken) {
    return false;
  }

  const authHeader = request.headers.get('authorization') || '';
  const tokenHeader = request.headers.get('x-admin-token') || '';
  const cookieToken = readCookie(request, adminCookieName);
  return authHeader === `Bearer ${adminToken}` || tokenHeader === adminToken || cookieToken === adminToken;
}

export function requireAdminRequest(request: Request): NextResponse | null {
  if (isAuthorizedAdminRequest(request)) {
    return null;
  }

  return NextResponse.json(
    {
      ok: false,
      error: 'Admin authorization required',
    },
    { status: 401 }
  );
}
