import { NextResponse, type NextRequest } from 'next/server';
import { verifyWorkspaceSessionToken, WORKSPACE_SESSION_COOKIE } from '@/src/lib/auth/session';

function isWorkspacePath(pathname: string): boolean {
  return pathname === '/workspace' || pathname.startsWith('/workspace/');
}

function isProtectedApiPath(pathname: string): boolean {
  return pathname === '/api/mock' || pathname.startsWith('/api/mock/');
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const protectedWorkspace = isWorkspacePath(pathname);
  const protectedApi = isProtectedApiPath(pathname);

  if (!protectedWorkspace && !protectedApi) {
    return NextResponse.next();
  }

  const session = await verifyWorkspaceSessionToken(request.cookies.get(WORKSPACE_SESSION_COOKIE)?.value);

  if (session) {
    return NextResponse.next();
  }

  if (protectedApi) {
    return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/workspace', '/workspace/:path*', '/api/mock', '/api/mock/:path*'],
};
