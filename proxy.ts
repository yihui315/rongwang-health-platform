import { NextResponse, type NextRequest } from 'next/server';

const protectedPrefixes = ['/workspace', '/api/mock'];
const adminCookieName = 'rongwang_admin_token';

function adminToken() {
  return process.env.RONGWANG_ADMIN_TOKEN || process.env.ADMIN_TOKEN || '';
}

function authorized(request: NextRequest) {
  const token = adminToken();
  if (!token) {
    return false;
  }

  return (
    request.headers.get('authorization') === `Bearer ${token}` ||
    request.headers.get('x-admin-token') === token ||
    request.cookies.get(adminCookieName)?.value === token
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected || authorized(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, error: 'Admin authorization required' }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/workspace/:path*', '/api/mock/:path*'],
};
