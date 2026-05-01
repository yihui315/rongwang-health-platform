import { NextResponse } from "next/server";
import { getWechatReadinessStatus } from "@/lib/wechat/config";

export async function POST() {
  const readiness = getWechatReadinessStatus();
  if (!readiness.pay.configured) {
    return NextResponse.json(
      { success: false, error: "wechat_pay_not_configured" },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { success: false, error: "wechat_pay_notify_verification_not_live" },
    { status: 501 },
  );
}
