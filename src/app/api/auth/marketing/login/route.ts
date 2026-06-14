import { NextResponse } from "next/server";
import { MARKETING_SESSION_COOKIE_NAME, getMarketingCookieOptions } from "@/lib/auth/marketing-session";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const marketingPassword = process.env.MARKETING_ACCESS_PASSWORD?.trim();

    if (!marketingPassword) {
      return NextResponse.json(
        { error: "营销系统未配置访问密码，请联系管理员" },
        { status: 503 }
      );
    }

    if (!password || password.trim() !== marketingPassword) {
      return NextResponse.json(
        { error: "密码错误，请联系管理员获取正确密码" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      MARKETING_SESSION_COOKIE_NAME,
      "authenticated",
      getMarketingCookieOptions()
    );
    return response;
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
}