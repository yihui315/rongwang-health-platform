import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    if (!supabase.auth) {
      return NextResponse.json({ error: '认证服务未配置' }, { status: 503 });
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: true, session: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '服务异常' }, { status: 500 });
  }
}
