import { NextResponse } from "next/server";
import { getWechatReadinessStatus } from "@/lib/wechat/config";
import { wechatPayPrepaySchema } from "@/schemas/wechat";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = wechatPayPrepaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "validation_failed" }, { status: 400 });
  }

  const readiness = getWechatReadinessStatus();
  if (!readiness.pay.configured) {
    return NextResponse.json(
      { success: false, error: "wechat_pay_not_configured" },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: "wechat_pay_prepay_not_live",
      orderNo: parsed.data.orderNo,
    },
    { status: 501 },
  );
}
