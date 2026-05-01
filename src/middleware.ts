import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
  getAdminTokenFromRequest,
  isAdminAuthRequired,
  isAdminTokenValid,
} from '@/lib/auth/admin';
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  getCustomerLoginRedirectUrl,
  isCustomerProtectedPath,
} from '@/lib/auth/customer-shared';
import { getAiConsultHrefForValue } from '@/lib/health/consult-entry';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const isAdminPath = url.pathname === '/admin' || url.pathname.startsWith('/admin/');
  const isAdminLoginPath = url.pathname === '/admin/login';
  const isCustomerPath = isCustomerProtectedPath(url.pathname);
  const adminToken = getAdminTokenFromRequest({
    cookieToken: request.cookies.get(ADMIN_COOKIE_NAME)?.value,
    headerToken: request.headers.get('x-admin-token'),
  });

  if (isAdminPath && !isAdminLoginPath && isAdminAuthRequired() && !isAdminTokenValid(adminToken)) {
    return NextResponse.redirect(new URL('/admin/login', request.url), 307);
  }

  if (isCustomerPath && !request.cookies.has(CUSTOMER_SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(getCustomerLoginRedirectUrl(request.url), 307);
  }

  const response = url.pathname === '/quiz'
    ? NextResponse.redirect(
        new URL(getAiConsultHrefForValue(url.searchParams.get('focus') ?? url.searchParams.get('pre')), request.url),
        307,
      )
    : NextResponse.next();

  if (!request.cookies.has('rw_session')) {
    response.cookies.set('rw_session', crypto.randomUUID(), {
      maxAge: 60 * 60 * 24 * 90,
      path: '/',
      sameSite: 'lax',
    });
  }

  if (isAdminPath && isAdminTokenValid(adminToken)) {
    response.cookies.set(ADMIN_COOKIE_NAME, adminToken, getAdminCookieOptions());
  }

  if (!request.cookies.has('rw_ab_group')) {
    const group = Math.random() < 0.5 ? 'A' : 'B';
    response.cookies.set('rw_ab_group', group, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });
  }

  const utmSource = url.searchParams.get('utm_source');
  const utmMedium = url.searchParams.get('utm_medium');
  const utmCampaign = url.searchParams.get('utm_campaign');
  const ref = url.searchParams.get('ref');

  if (utmSource) {
    response.cookies.set('rw_utm', JSON.stringify({
      source: utmSource,
      medium: utmMedium || '',
      campaign: utmCampaign || '',
    }), {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });
  }

  if (ref) {
    response.cookies.set('rw_ref', ref, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon|robots|sitemap).*)',
  ],
};
