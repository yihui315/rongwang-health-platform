import { NextRequest, NextResponse } from "next/server";
import { setUserSessionCookie } from "@/lib/auth/session";
import { requestMetaFromRequest, signUpWithEmail } from "@/lib/auth/user-service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "请填写邮箱和密码" }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: "密码至少 8 位" }, { status: 400 });
    }

    const result = await signUpWithEmail(
      String(email),
      String(password),
      requestMetaFromRequest(request),
    );

    if (!result.ok || !result.data) {
      return NextResponse.json(
        { error: result.error ?? "注册失败" },
        { status: result.status },
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "注册成功，已为你创建健康档案入口",
      user: result.data.user,
    });
    setUserSessionCookie(response, result.data.token);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "服务异常" }, { status: 500 });
  }
}
