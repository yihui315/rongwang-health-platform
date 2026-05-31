import { NextResponse } from 'next/server';

const cookieName = 'rongwang_admin_token';

function isLoopbackHttpRequest(request: Request): boolean {
  const url = new URL(request.url);
  return (
    url.protocol === 'http:' &&
    (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]')
  );
}

export async function POST(request: Request) {
  const expectedToken = process.env.RONGWANG_ADMIN_TOKEN || process.env.ADMIN_TOKEN || '';

  if (!expectedToken) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Admin login is not configured',
      },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const token = String(body?.token || '');

  if (token !== expectedToken) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid admin token',
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && !isLoopbackHttpRequest(request),
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}
