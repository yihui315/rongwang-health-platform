import { NextResponse } from "next/server";
import { getWechatOpenConfig, getWechatOpenMissingKeys } from "@/lib/auth/wechat-oauth";

export async function GET() {
  const configured = Boolean(getWechatOpenConfig());
  return NextResponse.json({
    configured,
    missing: configured ? [] : getWechatOpenMissingKeys(),
  });
}
