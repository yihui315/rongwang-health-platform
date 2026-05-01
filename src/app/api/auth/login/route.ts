import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  getCustomerSessionCookieOptions,
} from '@/lib/auth/customer-shared';

type SupabaseSignInData = {
  session?: {
    access_token?: string;
    expires_in?: number;
  } | null;
  user?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    if (supabase.isStub || !supabase.auth) {
      return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const signInData = data as SupabaseSignInData;
    const accessToken = signInData.session?.access_token;
    if (!accessToken) {
      return NextResponse.json({ error: 'Auth session missing' }, { status: 502 });
    }

    const response = NextResponse.json({ success: true, user: signInData.user ?? null });
    response.cookies.set(
      CUSTOMER_SESSION_COOKIE_NAME,
      accessToken,
      getCustomerSessionCookieOptions(signInData.session?.expires_in),
    );
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '服务异常' }, { status: 500 });
  }
}
