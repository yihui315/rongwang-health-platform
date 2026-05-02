import { NextResponse } from "next/server";
import { exchangeWechatMiniProgramCode } from "@/lib/auth/wechat-miniprogram";
import { requestMetaFromRequest, upsertWechatIdentity } from "@/lib/auth/user-service";
import { getWechatReadinessStatus } from "@/lib/wechat/config";
import { wechatMiniProgramLoginSchema } from "@/schemas/wechat";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = wechatMiniProgramLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation_failed" }, { status: 400 });
  }

  const readiness = getWechatReadinessStatus();
  if (!readiness.miniProgram.configured) {
    return NextResponse.json(
      { success: false, error: "wechat_miniprogram_not_configured" },
      { status: 503 },
    );
  }

  try {
    const identity = await exchangeWechatMiniProgramCode(parsed.data.code);
    const result = await upsertWechatIdentity({
      provider: "wechat_miniprogram",
      providerSubject: identity.openId,
      unionId: identity.unionId,
      displayName: parsed.data.profile?.nickname ?? null,
      avatarUrl: parsed.data.profile?.avatarUrl ?? null,
      metadata: {
        source: "wechat_miniprogram_code2session",
        hasUnionId: Boolean(identity.unionId),
        sessionKeyHash: identity.sessionKeyHash,
      },
      requestMeta: requestMetaFromRequest(request),
    });

    if (!result.ok || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error ?? "wechat_identity_link_failed" },
        { status: result.status },
      );
    }

    return NextResponse.json({
      success: true,
      linked: true,
      provider: "wechat_miniprogram",
      hasUnionId: result.data.hasUnionId,
      linkedByUnionId: result.data.linkedByUnionId,
      user: result.data.user,
    });
  } catch (error) {
    console.error("[wechat miniprogram] login failed", error);
    return NextResponse.json(
      { success: false, error: "wechat_login_exchange_failed" },
      { status: 502 },
    );
  }
}
