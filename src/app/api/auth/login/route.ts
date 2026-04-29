import { NextRequest, NextResponse } from "next/server";
import { setUserSessionCookie } from "@/lib/auth/session";
import { requestMetaFromRequest, signInWithEmail } from "@/lib/auth/user-service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "请填写邮箱和密码" }, { status: 400 });
    }

    const result = await signInWithEmail(
      String(email),
      String(password),
      requestMetaFromRequest(request),
    );

    if (!result.ok || !result.data) {
      return NextResponse.json(
        { error: result.error ?? "登录失败" },
        { status: result.status },
      );
    }

    const response = NextResponse.json({ success: true, user: result.data.user });
    setUserSessionCookie(response, result.data.token);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "服务异常" }, { status: 500 });
  }
}
