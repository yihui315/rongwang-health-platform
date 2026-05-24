import { NextResponse, type NextRequest } from 'next/server';
import {
  authenticateWorkspaceAdmin,
  createWorkspaceSessionToken,
  getWorkspaceAdminEmail,
  getWorkspaceSessionCookieOptions,
  normalizeRedirectPath,
  WORKSPACE_SESSION_COOKIE,
} from '@/src/lib/auth/session';

type LoginPayload = {
  email: string;
  password: string;
  nextPath: string;
};

function wantsJson(request: NextRequest): boolean {
  return (
    request.headers.get('content-type')?.includes('application/json') ||
    request.headers.get('accept')?.includes('application/json') ||
    false
  );
}

async function readLoginPayload(request: NextRequest): Promise<LoginPayload> {
  if (request.headers.get('content-type')?.includes('application/json')) {
    const body = await request.json();
    return {
      email: String(body?.email || ''),
      password: String(body?.password || ''),
      nextPath: normalizeRedirectPath(String(body?.next || body?.redirectTo || '/workspace')),
    };
  }

  const formData = await request.formData();

  return {
    email: String(formData.get('email') || ''),
    password: String(formData.get('password') || ''),
    nextPath: normalizeRedirectPath(String(formData.get('next') || '/workspace')),
  };
}

function invalidLoginResponse(request: NextRequest, nextPath: string) {
  if (wantsJson(request)) {
    return NextResponse.json({ ok: false, error: 'Invalid email or password' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'invalid');
  loginUrl.searchParams.set('next', nextPath);
  return NextResponse.redirect(loginUrl, { status: 303 });
}

export async function POST(request: NextRequest) {
  const payload = await readLoginPayload(request);

  if (!authenticateWorkspaceAdmin({ email: payload.email, password: payload.password })) {
    return invalidLoginResponse(request, payload.nextPath);
  }

  const adminEmail = getWorkspaceAdminEmail();
  const token = await createWorkspaceSessionToken(adminEmail);

  if (wantsJson(request)) {
    const response = NextResponse.json({
      ok: true,
      redirectTo: payload.nextPath,
      user: { email: adminEmail },
    });
    response.cookies.set(WORKSPACE_SESSION_COOKIE, token, getWorkspaceSessionCookieOptions());
    return response;
  }

  const response = NextResponse.redirect(new URL(payload.nextPath, request.url), { status: 303 });
  response.cookies.set(WORKSPACE_SESSION_COOKIE, token, getWorkspaceSessionCookieOptions());
  return response;
}
